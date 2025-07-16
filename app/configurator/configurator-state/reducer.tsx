import produce, {
  createDraft,
  current,
  Draft,
  isDraft,
  setAutoFreeze,
} from "immer";
import { WritableDraft } from "immer/dist/types/types-external";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import setWith from "lodash/setWith";
import sortBy from "lodash/sortBy";
import unset from "lodash/unset";
import { Reducer } from "use-immer";

import {
  getChartConfigAdjustedToChartType,
  getFieldComponentIds,
  getGroupedFieldIds,
  getHiddenFieldIds,
} from "@/charts";
import {
  getChartFieldChangeSideEffect,
  getChartFieldDeleteSideEffect,
  getChartFieldOptionChangeSideEffect,
} from "@/charts/chart-config-ui-options";
import {
  availableHandlesByBlockType,
  COLS,
  getInitialTileHeight,
  getInitialTileWidth,
  MIN_H,
} from "@/components/react-grid";
import {
  ChartConfig,
  ColorMapping,
  ColumnStyleCategory,
  ConfiguratorState,
  DashboardFiltersConfig,
  DashboardTimeRangeFilter,
  enableLayouting,
  Filters,
  GenericFields,
  isAreaConfig,
  isColorInConfig,
  isMapConfig,
  isSegmentInConfig,
  isTableConfig,
  ReactGridLayoutType,
  SingleColorField,
} from "@/config-types";
import { getChartConfig, makeMultiFilter } from "@/config-utils";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import {
  addDatasetInConfig,
  getPreviousState,
  getStateWithCurrentDataSource,
  hasChartConfigs,
  isConfiguring,
  isLayouting,
  removeDatasetInConfig,
} from "@/configurator/configurator-state";
import { ConfiguratorStateAction } from "@/configurator/configurator-state/actions";
import {
  getInitialConfiguringConfigBasedOnCube,
  SELECTING_DATASET_STATE,
} from "@/configurator/configurator-state/initial";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { toggleInteractiveFilterDataDimension } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { Dimension, isGeoDimension, isJoinByComponent } from "@/domain/data";
import { getOriginalDimension, isJoinByCube } from "@/graphql/join";
import { PossibleFilterValue } from "@/graphql/query-hooks";
import { DEFAULT_CATEGORICAL_PALETTE_ID } from "@/palettes";
import { findInHierarchy } from "@/rdf/tree-utils";
import { theme } from "@/themes/theme";
import { getCachedComponents } from "@/urql-cache";
import { assert } from "@/utils/assert";
import { unreachableError } from "@/utils/unreachable";

/**
 * Setting auto-freeze behavior to false, to prevent hard-to-trace bugs.
 * It looks like the state is sometimes being mutated in a way that is not
 * expected by immer - I'd prefer to not be constrained by the auto-freeze
 * behavior.
 *
 * Also see https://immerjs.github.io/immer/freezing.
 */
setAutoFreeze(false);

/**
 * Is responsible for inferring filters when changing chart type, or when
 * changing some chart fields. Makes sure that we are always showing the
 * non-"duplicated" data (with the correct filters for key dimensions).
 */
export const deriveFiltersFromFields = produce(
  (
    draft: ChartConfig,
    options: {
      /** Possibly joined dimensions */
      dimensions: Dimension[];
      possibleFilters?: PossibleFilterValue[];
    }
  ) => {
    const { dimensions, possibleFilters } = options;

    const getCubeDimensions = (dimensions: Dimension[], cubeIri: string) => {
      return dimensions.filter(
        (d) => d.cubeIri === cubeIri || isJoinByCube(d.cubeIri)
      );
    };

    if (draft.chartType === "table") {
      // As dimensions in tables behave differently than in other chart types,
      // they need to be handled in a different way.
      const hiddenFieldIds = getHiddenFieldIds(draft.fields);
      const groupedDimensionIds = getGroupedFieldIds(draft.fields);
      const isHidden = (dim: Dimension) => hiddenFieldIds.has(dim.id);
      const isGrouped = (dim: Dimension) => groupedDimensionIds.has(dim.id);
      draft.cubes.forEach((cube) => {
        const cubeDimensions = getCubeDimensions(dimensions, cube.iri);
        cubeDimensions.forEach((dim) => {
          applyTableDimensionToFilters({
            cubeIri: cube.iri,
            filters: cube.filters,
            dimension: dim,
            isHidden: isHidden(dim),
            isGrouped: isGrouped(dim),
            possibleFilter: possibleFilters?.find((f) => f.id === dim.id),
          });
        });
      });
    } else {
      const fieldDimensionIds = getFieldComponentIds(draft.fields);
      const isField = (dim: Dimension) => fieldDimensionIds.has(dim.id);
      draft.cubes.forEach((cube) => {
        const cubeDimensions = getCubeDimensions(dimensions, cube.iri);
        const sortedCubeDimensions = sortBy(
          cubeDimensions,
          (d) => (isGeoDimension(d) ? -1 : 1),
          (d) => (d.hierarchy ? -1 : 1)
        );
        sortedCubeDimensions.forEach((dim) => {
          applyNonTableDimensionToFilters({
            cubeIri: cube.iri,
            filters: cube.filters,
            dimension: isJoinByComponent(dim)
              ? getOriginalDimension(dim, cube)
              : dim,
            isField: isField(dim),
            possibleFilter: possibleFilters?.find((f) => f.id === dim.id),
          });
        });
      });
    }
  }
);

export const applyTableDimensionToFilters = (props: {
  cubeIri: string;
  filters: Filters;
  dimension: Dimension;
  isHidden: boolean;
  isGrouped: boolean;
  possibleFilter?: PossibleFilterValue;
}) => {
  const { filters, dimension, isHidden, isGrouped, possibleFilter, cubeIri } =
    props;
  const originalIri = isJoinByComponent(dimension)
    ? dimension.originalIds.find((c) => c.cubeIri === cubeIri)?.dimensionId
    : dimension.id;
  assert(originalIri !== undefined, "Dimension should have an IRI");
  const currentFilter = filters[originalIri];
  const shouldBecomeSingleFilter = isHidden && !isGrouped;

  if (currentFilter) {
    switch (currentFilter.type) {
      case "single":
        if (!shouldBecomeSingleFilter) {
          delete filters[originalIri];
        }
        break;
      case "multi":
        if (shouldBecomeSingleFilter && dimension.isKeyDimension) {
          filters[originalIri] = {
            type: "single",
            value:
              Object.keys(currentFilter.values)[0] ?? dimension.values[0].value,
          };
        }
        break;
      case "range":
        if (shouldBecomeSingleFilter) {
          filters[originalIri] = {
            type: "single",
            value: currentFilter.from,
          };
        }
        break;
      default:
        const _exhaustiveCheck: never = currentFilter;
        return _exhaustiveCheck;
    }
  } else if (shouldBecomeSingleFilter && dimension.isKeyDimension) {
    filters[originalIri] = {
      type: "single",
      // TODO, possibly in case of join by dimensions, we could get a value that is not part
      // of the full range of values
      value: possibleFilter?.value ?? dimension.values[0].value,
    };
  }
};

export const applyNonTableDimensionToFilters = (props: {
  cubeIri: string;
  filters: Filters;
  dimension: Dimension;
  isField: boolean;
  possibleFilter?: PossibleFilterValue;
}) => {
  const { filters, dimension, isField, possibleFilter, cubeIri } = props;
  const originalIri = isJoinByComponent(dimension)
    ? dimension.originalIds.find((c) => c.cubeIri === cubeIri)?.dimensionId
    : dimension.id;
  assert(originalIri !== undefined, "Dimension should have an IRI");
  const currentFilter = filters[originalIri];

  if (currentFilter) {
    switch (currentFilter.type) {
      case "single":
        if (isField) {
          // When a dimension is either x, y or segment, we want to clear the filter.
          delete filters[originalIri];
        }
        break;
      // Multi-filters are not allowed in the left panel.
      case "multi":
        if (!isField) {
          const hierarchyTopMost = dimension.hierarchy
            ? findInHierarchy(dimension.hierarchy, (v) => !!v.hasValue)
            : undefined;
          const filterValue = hierarchyTopMost
            ? hierarchyTopMost.value
            : (Object.keys(currentFilter.values)[0] ??
              dimension.values[0].value);
          filters[originalIri] = {
            type: "single",
            value: filterValue,
          };
        }
        break;
      case "range":
        if (!isField) {
          // Range-filters are not allowed in the left panel.
          filters[originalIri] = {
            type: "single",
            value: currentFilter.from,
          };
        }
        break;
      default:
        const _exhaustiveCheck: never = currentFilter;
        return _exhaustiveCheck;
    }
  } else if (!isField && dimension.isKeyDimension) {
    // If this scenario appears, it means that current filter is undefined -
    // which means it must be converted to a single-filter (if it's a keyDimension,
    // otherwise a 'No filter' option should be selected by default).
    // Find the topmost hierarchy value
    const hierarchyTopMost = dimension.hierarchy
      ? findInHierarchy(dimension.hierarchy, (v) => !!v.hasValue)
      : undefined;
    const filterValue = hierarchyTopMost
      ? hierarchyTopMost.value
      : (possibleFilter?.value ?? dimension.values[0]?.value);

    if (filterValue) {
      filters[dimension.id] = {
        type: "single",
        value: filterValue,
      };
    }
  }
};

export const transitionStepNext = (
  draft: ConfiguratorState,
  options?: {
    chartConfig?: ChartConfig;
  }
): ConfiguratorState => {
  const { chartConfig } = options ?? {};

  switch (draft.state) {
    case "SELECTING_DATASET":
      if (chartConfig) {
        return getInitialConfiguringConfigBasedOnCube({
          dataSource: draft.dataSource,
          chartConfig,
        });
      }
      break;
    case "CONFIGURING_CHART":
      return {
        ...draft,
        state: enableLayouting(draft) ? "LAYOUTING" : "PUBLISHING",
        activeChartKey: draft.chartConfigs[0].key,
      };
    case "LAYOUTING":
      return {
        ...draft,
        state: "PUBLISHING",
      };

    case "INITIAL":
    case "PUBLISHING":
    case "PUBLISHED":
      break;
    default:
      throw unreachableError(draft);
  }

  return draft;
};
const transitionStepPrevious = (
  draft: ConfiguratorState,
  to?: Exclude<ConfiguratorState["state"], "INITIAL" | "PUBLISHING">
): ConfiguratorState => {
  const stepTo = to ?? getPreviousState(draft);

  if (draft.state === "INITIAL" || draft.state === "SELECTING_DATASET") {
    return draft;
  }
  switch (stepTo) {
    case "SELECTING_DATASET":
      return {
        ...draft,
        layout: undefined,
        chartConfigs: undefined,
        activeChartKey: undefined,
        state: stepTo,
      };
    case "CONFIGURING_CHART":
      return {
        ...draft,
        state: stepTo,
        layout: {
          ...draft.layout,
          activeField: undefined,
        },
        chartConfigs: draft.chartConfigs.map((chartConfig) => ({
          ...chartConfig,
          activeField: undefined,
        })),
        activeChartKey: draft.chartConfigs[0].key,
      };
    case "LAYOUTING":
      return {
        ...draft,
        state: stepTo,
      };
  }

  return draft;
};

export const handleChartFieldChanged = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_FIELD_CHANGED" }>
) => {
  if (!isConfiguring(draft)) {
    return draft;
  }

  const chartConfig = getChartConfig(draft);
  const {
    locale,
    field,
    componentId,
    selectedValues: actionSelectedValues,
  } = action.value;
  const f = get(chartConfig.fields, field);
  const dataCubesComponents = getCachedComponents({
    locale,
    dataSource: draft.dataSource,
    cubeFilters: chartConfig.cubes.map((cube) => ({
      iri: cube.iri,
      joinBy: cube.joinBy,
    })),
  });
  const dimensions = dataCubesComponents?.dimensions ?? [];
  const measures = dataCubesComponents?.measures ?? [];
  const components = [...dimensions, ...measures];
  const component = components.find((d) => d.id === componentId);
  const selectedValues = actionSelectedValues ?? component?.values ?? [];

  if (f) {
    // Reset field properties, excluding component id.
    (chartConfig.fields as GenericFields)[field] = {
      componentId,
    };
  }

  const sideEffect = getChartFieldChangeSideEffect(chartConfig, field);
  sideEffect?.(componentId, {
    chartConfig,
    dimensions,
    measures,
    initializing: !f,
    selectedValues,
    field,
    oldField: f,
  });

  // Remove the component from interactive data filters.
  if (chartConfig.interactiveFiltersConfig?.dataFilters) {
    const componentIds =
      chartConfig.interactiveFiltersConfig.dataFilters.componentIds.filter(
        (d) => d !== componentId
      );
    const active = componentIds.length > 0;
    chartConfig.interactiveFiltersConfig.dataFilters = {
      active,
      componentIds,
    };
  }

  const newConfig = deriveFiltersFromFields(chartConfig, { dimensions });
  const index = draft.chartConfigs.findIndex((d) => d.key === chartConfig.key);
  draft.chartConfigs[index] = newConfig;

  return draft;
};

export const handleChartFieldDeleted = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_FIELD_DELETED" }>
) => {
  if (!isConfiguring(draft)) {
    return draft;
  }

  const { locale, field } = action.value;
  const chartConfig = getChartConfig(draft);
  delete (chartConfig.fields as GenericFields)[field];
  const dataCubesComponents = getCachedComponents({
    locale,
    dataSource: draft.dataSource,
    cubeFilters: chartConfig.cubes.map((cube) => ({
      iri: cube.iri,
      joinBy: cube.joinBy,
    })),
  });
  const dimensions = dataCubesComponents?.dimensions ?? [];
  const newConfig = deriveFiltersFromFields(chartConfig, { dimensions });
  const index = draft.chartConfigs.findIndex((d) => d.key === chartConfig.key);
  draft.chartConfigs[index] = newConfig;

  if (action.value.field === "segment") {
    if (chartConfig.interactiveFiltersConfig) {
      chartConfig.interactiveFiltersConfig.calculation.active = false;
      chartConfig.interactiveFiltersConfig.calculation.type = "identity";
    }

    if (isColorInConfig(chartConfig)) {
      const newColorField: SingleColorField = {
        type: "single",
        paletteId: DEFAULT_CATEGORICAL_PALETTE_ID,
        color: theme.palette.primary.main,
      };
      chartConfig.fields.color = newColorField;
    }
  }

  const sideEffect = getChartFieldDeleteSideEffect(chartConfig, field);
  sideEffect?.({ chartConfig });

  return draft;
};

export const handleChartFieldUpdated = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_FIELD_UPDATED" }>
) => {
  if (isConfiguring(draft)) {
    const { locale, path, field, value } = action.value;
    const chartConfig = getChartConfig(draft);
    const updatePath = field === null ? path : `fields["${field}"].${path}`;
    const dataCubesComponents = getCachedComponents({
      locale,
      dataSource: draft.dataSource,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    });

    const dimensions = dataCubesComponents?.dimensions ?? [];
    const measures = dataCubesComponents?.measures ?? [];

    if (field) {
      const sideEffect = getChartFieldOptionChangeSideEffect(
        chartConfig,
        field,
        path
      );
      sideEffect?.(value, {
        chartConfig,
        dimensions,
        measures,
        field,
        oldField: get(chartConfig.fields, field),
      });
    }

    if (value === FIELD_VALUE_NONE) {
      unset(chartConfig, updatePath);
    } else {
      setWith(chartConfig, updatePath, value, Object);
    }
  }

  return draft;
};

export const updateColorMapping = (
  draft: ConfiguratorState,
  action: Extract<
    ConfiguratorStateAction,
    { type: "CHART_CONFIG_UPDATE_COLOR_MAPPING" }
  >
) => {
  if (isConfiguring(draft)) {
    const {
      field,
      colorConfigPath,
      colorMapping: oldColorMapping,
      values,
      random,
      customPalette,
    } = action.value;
    const chartConfig = getChartConfig(draft);
    const path = colorConfigPath
      ? ["fields", field, colorConfigPath]
      : ["fields", field];
    let colorMapping: ColorMapping | undefined;

    if (isTableConfig(chartConfig)) {
      const fieldValue: ColumnStyleCategory | undefined = get(
        chartConfig,
        path
      );

      if (fieldValue) {
        colorMapping = mapValueIrisToColor({
          paletteId: fieldValue.paletteId,
          dimensionValues: values,
          colorMapping: oldColorMapping,
          random,
          customPalette,
        });
      }
    } else {
      const { paletteId } = get(chartConfig, path);
      colorMapping = mapValueIrisToColor({
        paletteId,
        dimensionValues: values,
        colorMapping: oldColorMapping,
        random,
        customPalette,
      });
    }

    if (colorMapping) {
      setWith(chartConfig, path.concat("colorMapping"), colorMapping, Object);
    }
  }

  return draft;
};

const handleInteractiveFilterChanged = (
  draft: ConfiguratorState,
  action: Extract<
    ConfiguratorStateAction,
    { type: "INTERACTIVE_FILTER_CHANGED" }
  >
) => {
  if (isConfiguring(draft)) {
    const chartConfig = getChartConfig(draft);
    setWith(chartConfig, "interactiveFiltersConfig", action.value, Object);
  }

  return draft;
};

export const setRangeFilter = (
  draft: ConfiguratorState,
  action: Extract<
    ConfiguratorStateAction,
    { type: "CHART_CONFIG_FILTER_SET_RANGE" }
  >
) => {
  const { dimension, from, to } = action.value;
  const chartConfig = getChartConfig(draft);
  const adjustFilter = (cubeIri: string, dimensionId: string) => {
    const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

    if (cube) {
      cube.filters[dimensionId] = {
        type: "range",
        from,
        to,
      };
    }
  };

  if (dimension.isJoinByDimension) {
    for (const { cubeIri, dimensionId } of dimension.originalIds) {
      adjustFilter(cubeIri, dimensionId);
    }
  } else {
    adjustFilter(dimension.cubeIri, dimension.id);
  }

  if (chartConfig.interactiveFiltersConfig) {
    chartConfig.interactiveFiltersConfig.timeRange = {
      componentId: dimension.id,
      active: chartConfig.interactiveFiltersConfig.timeRange.active,
      presets: {
        type: "range",
        from,
        to,
      },
    };
  }
};

const handleAddNewChartConfig = (
  draft: ConfiguratorState,
  chartConfig: ChartConfig
) => {
  if (isConfiguring(draft) || isLayouting(draft)) {
    draft.chartConfigs.push(chartConfig);
    draft.activeChartKey = chartConfig.key;
    draft.layout.blocks.push({
      key: chartConfig.key,
      type: "chart",
      initialized: false,
    });

    ensureDashboardLayoutIsCorrect(draft);
  }

  return draft;
};

const reducer_: Reducer<ConfiguratorState, ConfiguratorStateAction> = (
  draft,
  action
) => {
  switch (action.type) {
    case "INITIALIZED":
      // Never restore from an UNINITIALIZED state
      return action.value.state === "INITIAL"
        ? getStateWithCurrentDataSource(SELECTING_DATASET_STATE)
        : action.value;
    case "DATASOURCE_CHANGED":
      draft.dataSource = action.value;

      return draft;

    case "CHART_TYPE_CHANGED":
      if (isConfiguring(draft)) {
        const { locale, chartKey, chartType, isAddingNewCube } = action.value;
        const chartConfig = getChartConfig(draft, chartKey);
        const dataCubesComponents = getCachedComponents({
          locale,
          dataSource: draft.dataSource,
          cubeFilters: chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
        });
        const dimensions = dataCubesComponents?.dimensions;
        const measures = dataCubesComponents?.measures;

        if (dimensions && measures) {
          const newConfig = deriveFiltersFromFields(
            getChartConfigAdjustedToChartType({
              chartConfig: current(chartConfig),
              newChartType: chartType,
              dimensions,
              measures,
              isAddingNewCube,
            }),
            { dimensions }
          );

          const index = draft.chartConfigs.findIndex(
            (d) => d.key === chartConfig.key
          );
          draft.chartConfigs[index] = newConfig;
        }
      }

      return draft;

    case "CHART_ACTIVE_FIELD_CHANGE":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        chartConfig.activeField = action.value;
      }

      return draft;

    case "CHART_FIELD_CHANGED":
      return handleChartFieldChanged(draft, action);

    case "CHART_SHOW_LEGEND_TITLE_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);

        if (isSegmentInConfig(chartConfig) && chartConfig.fields.segment) {
          chartConfig.fields.segment.showTitle = action.value;
        }
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === chartConfig.key
        );
        draft.chartConfigs[index] = chartConfig;
      }
      return draft;

    case "CHART_FIELD_DELETED":
      return handleChartFieldDeleted(draft, action);

    case "CHART_FIELD_UPDATED":
      return handleChartFieldUpdated(draft, action);

    case "COLOR_FIELD_SET":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `fields.color.paletteId`,
          action.value.paletteId,
          Object
        );
        setWith(
          chartConfig,
          `fields.color.${action.value.type === "single" ? "color" : "colorMapping"}`,
          action.value.type === "single"
            ? action.value.color
            : action.value.colorMapping,
          Object
        );
      }

      return draft;
    case "CHART_PALETTE_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        const commonPath = `fields["${action.value.field}"].${
          action.value.colorConfigPath ? `${action.value.colorConfigPath}.` : ""
        }`;

        setWith(
          chartConfig,
          `${commonPath}palette`,
          action.value.paletteId,
          Object
        );
        setWith(
          chartConfig,
          `${commonPath}colorMapping`,
          action.value.colorMapping,
          Object
        );
      }

      return draft;

    case "CHART_PALETTE_RESET":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }colorMapping`,
          action.value.colorMapping,
          Object
        );
      }

      return draft;

    case "CHART_COLOR_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }colorMapping["${action.value.value}"]`,
          action.value.color,
          Object
        );
      }
      return draft;

    case "CHART_META_CHANGE":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `meta.${action.value.path}`,
          action.value.value,
          Object
        );
      }

      return draft;

    case "CUSTOM_LAYER_ADD":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);

        if (isMapConfig(chartConfig)) {
          chartConfig.baseLayer.customLayers.push(action.value.layer);
        }
      }

      return draft;

    case "CUSTOM_LAYER_UPDATE":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);

        if (isMapConfig(chartConfig)) {
          const { layer } = action.value;
          const i = chartConfig.baseLayer.customLayers.findIndex(
            (l) => l.type === layer.type && l.id === layer.id
          );

          if (i !== -1) {
            chartConfig.baseLayer.customLayers[i] = layer;
          }
        }
      }

      return draft;

    case "CUSTOM_LAYER_REMOVE":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);

        if (isMapConfig(chartConfig)) {
          const { type, id } = action.value;
          chartConfig.baseLayer.customLayers =
            chartConfig.baseLayer.customLayers.filter(
              (layer) => !(layer.type === type && layer.id === id)
            );
        }
      }

      return draft;

    case "CUSTOM_LAYER_SWAP":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);

        if (isMapConfig(chartConfig)) {
          const { oldIndex, newIndex } = action.value;
          const customLayers = chartConfig.baseLayer.customLayers;
          const newCustomLayers = [...customLayers];
          const [removed] = newCustomLayers.splice(oldIndex, 1);
          newCustomLayers.splice(newIndex, 0, removed);
          chartConfig.baseLayer.customLayers = newCustomLayers;
        }
      }

      return draft;

    case "INTERACTIVE_FILTER_CHANGED":
      return handleInteractiveFilterChanged(draft, action);

    case "CHART_CONFIG_REPLACED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === chartConfig.key
        );
        draft.chartConfigs[index] = deriveFiltersFromFields(
          action.value.chartConfig,
          { dimensions: action.value.dataCubesComponents.dimensions }
        );
      }

      return draft;

    case "FILTER_SET_SINGLE":
      if (isConfiguring(draft)) {
        const { filters, value } = action.value;
        const chartConfig = getChartConfig(draft);

        /*
         * We are getting a list of filters, since setting a single filter in the UI
         * in the case of joined dimensions, sets multiple filters inside the chart
         * configuration.
         */
        for (const filter of filters) {
          const { cubeIri, dimensionId } = filter;
          const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

          if (cube) {
            cube.filters[dimensionId] = {
              type: "single",
              value,
            };
          } else {
            console.warn(
              `Could not set filter, no cube in chart config was found with iri ${cubeIri}`
            );
          }
        }
      } else if (isLayouting(draft)) {
        const { filters, value } = action.value;
        const { dimensionId } = filters[0];
        if (draft.dashboardFilters) {
          draft.dashboardFilters.dataFilters.filters[dimensionId] = {
            type: "single",
            value,
          };
        }
      }

      return draft;

    case "FILTER_REMOVE_SINGLE":
      if (isConfiguring(draft)) {
        const { filters } = action.value;
        const chartConfig = getChartConfig(draft);

        for (const filter of filters) {
          const { cubeIri, dimensionId } = filter;
          const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

          if (cube) {
            delete cube.filters[dimensionId];
            const newIFConfig = toggleInteractiveFilterDataDimension(
              chartConfig.interactiveFiltersConfig,
              dimensionId,
              false
            );
            chartConfig.interactiveFiltersConfig = newIFConfig;
          }
        }
      } else if (isLayouting(draft)) {
        const { filters } = action.value;
        const { dimensionId } = filters[0];
        if (draft.dashboardFilters) {
          delete draft.dashboardFilters.dataFilters.filters[dimensionId];
        }
      }

      return draft;

    case "CHART_CONFIG_UPDATE_COLOR_MAPPING":
      return updateColorMapping(draft, action);

    case "CHART_CONFIG_FILTER_SET_MULTI":
      if (isConfiguring(draft)) {
        const { cubeIri, dimensionId, values } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          cube.filters[dimensionId] = makeMultiFilter(values);
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_RESET_RANGE":
      if (isConfiguring(draft)) {
        const { cubeIri, dimensionId } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          delete cube.filters[dimensionId];
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_SET_RANGE":
      if (isConfiguring(draft)) {
        setRangeFilter(draft, action);
      }

      return draft;

    case "CHART_CONFIG_FILTERS_UPDATE":
      if (isConfiguring(draft)) {
        const { cubeIri, filters } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          cube.filters = filters;
        }
      }

      return draft;

    case "IMPUTATION_TYPE_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        if (isAreaConfig(chartConfig)) {
          chartConfig.fields.y.imputationType = action.value.type;
        }
      }

      return draft;

    // State transitions
    case "STEP_NEXT":
      return transitionStepNext(draft);

    case "STEP_PREVIOUS":
      return transitionStepPrevious(draft, action.to);

    // Special state transitions
    case "PUBLISH_FAILED":
      if (draft.state === "PUBLISHING") {
        return transitionStepPrevious(draft);
      }
      return draft;

    case "PUBLISHED":
      return draft;

    case "CHART_CONFIG_ADD":
      if (isConfiguring(draft) || isLayouting(draft)) {
        const chartConfig =
          createDraft(action.value.chartConfig) ?? getChartConfig(draft);
        const dataCubesComponents = getCachedComponents({
          locale: action.value.locale,
          dataSource: draft.dataSource,
          cubeFilters: chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
        });

        if (dataCubesComponents) {
          const cubes = current(chartConfig.cubes);
          const newConfig = deriveFiltersFromFields(
            {
              ...action.value.chartConfig,
              // Need to finalize the cubes draft to avoid revoked proxy errors
              cubes,
            },
            { dimensions: dataCubesComponents.dimensions }
          );
          handleAddNewChartConfig(draft, newConfig);
        }
      }

      return draft;

    case "CHART_CONFIG_ADD_NEW_DATASET":
      if (isConfiguring(draft)) {
        handleAddNewChartConfig(draft, action.value.chartConfig);
      }

      return draft;

    case "DATASET_ADD":
      if (isConfiguring(draft)) {
        addDatasetInConfig(draft, action.value);
        return draft;
      }
      break;

    case "DATASET_REMOVE":
      if (isConfiguring(draft)) {
        removeDatasetInConfig(draft, action.value);

        return draft;
      }

      break;

    case "CHART_CONFIG_REMOVE":
      if (isConfiguring(draft) || isLayouting(draft)) {
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === action.value.chartKey
        );
        const removedKey = draft.chartConfigs[index].key;
        draft.chartConfigs.splice(index, 1);
        draft.layout.blocks = draft.layout.blocks.filter(
          (block) => block.key !== removedKey
        );

        if (removedKey === draft.activeChartKey) {
          draft.activeChartKey = draft.chartConfigs[Math.max(index - 1, 0)].key;
        }
      } else {
        console.warn(
          "Ignoring CHART_CONFIG_REMOVE as state is incompatible with action"
        );
        console.log(current(draft));
      }

      ensureDashboardLayoutIsCorrect(draft);

      return draft;

    case "CHART_CONFIG_REORDER":
      if (isConfiguring(draft) || draft.state === "LAYOUTING") {
        const { oldIndex, newIndex } = action.value;
        const [removed] = draft.chartConfigs.splice(oldIndex, 1);
        draft.chartConfigs.splice(newIndex, 0, removed);
      }

      return draft;

    case "CHART_ANNOTATION_ADD":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        chartConfig.annotations.push(action.value);
      }

      return draft;

    case "CHART_ANNOTATION_HIGHLIGHT_TYPE_CHANGE":
      if (isConfiguring(draft)) {
        const { key, highlightType } = action.value;
        const chartConfig = getChartConfig(draft);
        const annotation = chartConfig.annotations.find((a) => a.key === key);

        if (annotation) {
          annotation.highlightType = highlightType;
        }
      }

      return draft;

    case "CHART_ANNOTATION_COLOR_CHANGE":
      if (isConfiguring(draft)) {
        const { key, color } = action.value;
        const chartConfig = getChartConfig(draft);
        const annotation = chartConfig.annotations.find((a) => a.key === key);

        if (annotation) {
          annotation.color = color;
        }
      }

      return draft;

    case "CHART_ANNOTATION_DEFAULT_OPEN_CHANGE":
      if (isConfiguring(draft)) {
        const { key, defaultOpen } = action.value;
        const chartConfig = getChartConfig(draft);
        const annotation = chartConfig.annotations.find((a) => a.key === key);

        if (annotation) {
          annotation.defaultOpen = defaultOpen;
        }
      }

      return draft;

    case "CHART_ANNOTATION_TEXT_CHANGE":
      if (isConfiguring(draft)) {
        const { key, locale, value } = action.value;
        const chartConfig = getChartConfig(draft);
        const annotation = chartConfig.annotations.find((a) => a.key === key);

        if (annotation) {
          annotation.text[locale] = value;
        }
      }

      return draft;

    case "CHART_ANNOTATION_REMOVE":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        chartConfig.annotations = chartConfig.annotations.filter(
          (a) => a.key !== action.value.key
        );
        chartConfig.activeField = undefined;
      }

      return draft;

    case "CHART_ANNOTATION_TARGETS_CHANGE":
      if (isConfiguring(draft)) {
        const { key, targets } = action.value;
        const chartConfig = getChartConfig(draft);
        const annotation = chartConfig.annotations.find((a) => a.key === key);

        if (annotation) {
          annotation.targets = targets;
        }
      }

      return draft;

    case "LIMIT_SET":
      if (isConfiguring(draft)) {
        const { measureId, ...limit } = action.value;
        const chartConfig = getChartConfig(draft);

        if (!chartConfig.limits[measureId]) {
          chartConfig.limits[measureId] = [limit];
        } else {
          const limitToAddIndex = chartConfig.limits[measureId].findIndex(
            (d) => {
              if (d.related.length !== limit.related.length) {
                return false;
              }

              return d.related.every((r) =>
                limit.related.some(
                  (nr) =>
                    r.dimensionId === nr.dimensionId && r.value === nr.value
                )
              );
            }
          );

          if (limitToAddIndex !== -1) {
            chartConfig.limits[measureId][limitToAddIndex] = limit;
          } else {
            chartConfig.limits[measureId].push(limit);
          }
        }
      }

      return draft;

    case "LIMIT_REMOVE":
      if (isConfiguring(draft)) {
        const { measureId, related } = action.value;
        const chartConfig = getChartConfig(draft);

        const limits = chartConfig.limits[measureId] ?? [];

        const limitToRemoveIndex = limits.findIndex((d) => {
          if (d.related.length !== related.length) {
            return false;
          }

          return d.related.every((r) => {
            return related.some((nr) => {
              return r.dimensionId === nr.dimensionId && r.value === nr.value;
            });
          });
        });

        if (limitToRemoveIndex === -1) {
          return draft;
        }

        if (limits.length === 1) {
          delete chartConfig.limits[measureId];
        } else {
          chartConfig.limits[measureId] = limits.filter(
            (_, index) => index !== limitToRemoveIndex
          );
        }
      }

      return draft;

    case "LAYOUT_BLOCK_SWAP":
      if (isConfiguring(draft) || draft.state === "LAYOUTING") {
        const { oldIndex, newIndex } = action.value;
        const oldBlock = draft.layout.blocks[oldIndex];
        const newBlock = draft.layout.blocks[newIndex];
        draft.layout.blocks[oldIndex] = newBlock;
        draft.layout.blocks[newIndex] = oldBlock;
      }

      return draft;

    case "SWITCH_ACTIVE_CHART":
      if (
        isConfiguring(draft) ||
        draft.state === "LAYOUTING" ||
        draft.state === "PUBLISHED"
      ) {
        draft.activeChartKey = action.value;
      }

      return draft;

    case "LAYOUT_CHANGED":
      if (draft.state === "LAYOUTING" || draft.state === "PUBLISHED") {
        if (!isEqual(draft.layout, action.value)) {
          draft.layout = action.value;
          ensureDashboardLayoutIsCorrect(draft);
        }
      }

      return draft;

    case "LAYOUT_ACTIVE_FIELD_CHANGE":
      if (draft.state === "LAYOUTING") {
        draft.layout.activeField = action.value;
      }

      return draft;

    case "LAYOUT_META_CHANGE":
      if (draft.state === "LAYOUTING") {
        setWith(
          draft,
          `layout.meta.${action.value.path}`,
          action.value.value,
          Object
        );
      }
      return draft;

    case "CONFIGURE_CHART":
      const newDraft = transitionStepPrevious(draft, "CONFIGURING_CHART");
      assert(isConfiguring(newDraft), "Should be configuring after edit");
      newDraft.activeChartKey = action.value.chartKey;
      return newDraft;

    case "DASHBOARD_TIME_RANGE_FILTER_UPDATE":
      if (isLayouting(draft)) {
        setWith(draft, "dashboardFilters.timeRange", action.value, Object);
      }
      return draft;

    case "DASHBOARD_TIME_RANGE_FILTER_REMOVE":
      if (isLayouting(draft)) {
        setWith(
          draft,
          "dashboardFilters.timeRange",
          {
            active: false,
            timeUnit: "",
            presets: {
              from: "",
              to: "",
            },
          } as DashboardTimeRangeFilter,
          Object
        );
      }
      return draft;

    case "DASHBOARD_DATA_FILTER_ADD":
      if (isLayouting(draft) && draft.dashboardFilters) {
        const { dimensionId } = action.value;
        const newFilters: DashboardFiltersConfig = {
          ...draft.dashboardFilters,
          dataFilters: {
            ...draft.dashboardFilters.dataFilters,
            componentIds: [
              ...draft.dashboardFilters.dataFilters.componentIds,
              dimensionId,
            ],
          },
        };
        draft.dashboardFilters = newFilters;
      }
      return draft;

    case "DASHBOARD_DATA_FILTERS_SET":
      if (isLayouting(draft) && draft.dashboardFilters) {
        draft.dashboardFilters.dataFilters = action.value;
      }
      return draft;

    case "DASHBOARD_DATA_FILTER_REMOVE":
      if (isLayouting(draft) && draft.dashboardFilters) {
        const { dimensionId } = action.value;
        const newFilters: DashboardFiltersConfig = {
          ...draft.dashboardFilters,
          dataFilters: {
            ...draft.dashboardFilters.dataFilters,
            componentIds:
              draft.dashboardFilters.dataFilters.componentIds.filter(
                (d) => d !== dimensionId
              ),
          },
        };
        draft.dashboardFilters = newFilters;
      }

      return draft;

    default:
      throw unreachableError(action);
  }
};

/** Turn this on for the reducer to log state, action and result */
const reducerLogging: false = false;
const withLogging = <TState, TAction extends { type: unknown }>(
  reducer: Reducer<TState, TAction>
) => {
  return (state: Draft<TState>, action: TAction) => {
    const res = reducer(state, action);
    console.log(
      `Action: ${action.type}`,
      action,
      isDraft(state) ? current(state) : state
    );
    return res;
  };
};
export const reducer = reducerLogging ? withLogging(reducer_) : reducer_;

export const ensureDashboardLayoutIsCorrect = (
  draft: WritableDraft<ConfiguratorState>
) => {
  if (
    hasChartConfigs(draft) &&
    draft.layout.type === "dashboard" &&
    draft.layout.layout === "canvas"
  ) {
    const { blocks, layouts } = draft.layout;

    for (const [breakpoint, _breakpointLayouts] of Object.entries(layouts)) {
      const breakpointLayouts = [..._breakpointLayouts];
      const breakpointLayoutKeys = breakpointLayouts.map((l) => l.i);
      const newBlocks = blocks.filter((block) => {
        return !breakpointLayoutKeys.includes(block.key);
      });
      const keysToRemove = breakpointLayoutKeys.filter(
        (key) => !blocks.find((block) => block.key === key)
      );
      const cols = COLS[breakpoint as keyof typeof COLS];
      const { x, y } = getPreferredEmptyCellCoords({
        layouts: breakpointLayouts,
        cols,
      });
      let w = 0;
      let h = 0;

      for (const block of newBlocks) {
        switch (block.type) {
          case "chart":
            w = getInitialTileWidth();
            h = getInitialTileHeight();
            break;
          case "text":
            w = 1;
            h = 1;
            break;
          default:
            const _exhaustiveCheck: never = block;
            return _exhaustiveCheck;
        }

        breakpointLayouts.push({
          i: block.key,
          x,
          y,
          w,
          h,
          minH: MIN_H,
          resizeHandles: availableHandlesByBlockType[block.type],
        });
      }

      for (const key of keysToRemove) {
        const index = breakpointLayouts.findIndex((l) => l.i === key);
        breakpointLayouts.splice(index, 1);
      }

      draft.layout.layouts = {
        ...draft.layout.layouts,
        [breakpoint]: breakpointLayouts,
      };
    }
  }
};

const getPreferredEmptyCellCoords = ({
  layouts,
  cols,
}: {
  layouts: ReactGridLayoutType[];
  cols: number;
}) => {
  const makeKey = (x: number, y: number) => `${x},${y}`;
  const occupiedCells = new Set<string>();

  for (const layout of layouts) {
    for (let dx = 0; dx < layout.w; dx++) {
      for (let dy = 0; dy < layout.h; dy++) {
        occupiedCells.add(makeKey(layout.x + dx, layout.y + dy));
      }
    }
  }

  let x = 0;
  let y = 0;

  while (true) {
    const key = makeKey(x, y);

    if (!occupiedCells.has(key)) {
      return { x, y };
    }

    x++;

    if (x >= cols) {
      x = 0;
      y++;
    }
  }
};
