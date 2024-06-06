import produce, { createDraft, current, Draft } from "immer";
import { WritableDraft } from "immer/dist/internal";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import setWith from "lodash/setWith";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import unset from "lodash/unset";
import { Reducer } from "use-immer";

import {
  getChartConfigAdjustedToChartType,
  getFieldComponentIris,
  getGroupedFieldIris,
  getHiddenFieldIris,
  getInitialConfig,
  getPossibleChartTypes,
} from "@/charts";
import {
  getChartFieldChangeSideEffect,
  getChartFieldOptionChangeSideEffect,
} from "@/charts/chart-config-ui-options";
import { COLS, MIN_H } from "@/components/react-grid";
import {
  ChartConfig,
  ColorMapping,
  ColumnStyleCategory,
  ConfiguratorState,
  enableLayouting,
  Filters,
  GenericField,
  GenericFields,
  getChartConfig,
  isAreaConfig,
  isTableConfig,
  makeMultiFilter,
} from "@/config-types";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { toggleInteractiveFilterDataDimension } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { Dimension, isGeoDimension, isJoinByComponent } from "@/domain/data";
import { getOriginalDimension, JOIN_BY_CUBE_IRI } from "@/graphql/join";
import { ObservationFilter } from "@/graphql/query-hooks";
import { findInHierarchy } from "@/rdf/tree-utils";
import { getCachedComponents } from "@/urql-cache";
import { assert } from "@/utils/assert";
import { unreachableError } from "@/utils/unreachable";

import { ConfiguratorStateAction } from "./actions";
import {
  getInitialConfiguringConfigBasedOnCube,
  SELECTING_DATASET_STATE,
} from "./initial";

import {
  addDatasetInConfig,
  getPreviousState,
  getStateWithCurrentDataSource,
  hasChartConfigs,
  isConfiguring,
  isLayouting,
} from "./index";

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
      possibleFilters?: ObservationFilter[];
    }
  ) => {
    const { dimensions, possibleFilters } = options;

    const getCubeDimensions = (dimensions: Dimension[], cubeIri: string) => {
      return dimensions.filter(
        (d) => d.cubeIri === cubeIri || d.cubeIri === JOIN_BY_CUBE_IRI
      );
    };

    if (draft.chartType === "table") {
      // As dimensions in tables behave differently than in other chart types,
      // they need to be handled in a different way.
      const hiddenFieldIris = getHiddenFieldIris(draft.fields);
      const groupedDimensionIris = getGroupedFieldIris(draft.fields);
      const isHidden = (dimension: Dimension) =>
        hiddenFieldIris.has(dimension.iri);
      const isGrouped = (dimension: Dimension) =>
        groupedDimensionIris.has(dimension.iri);
      draft.cubes.forEach((cube) => {
        const cubeDimensions = getCubeDimensions(dimensions, cube.iri);
        cubeDimensions.forEach((dimension) => {
          applyTableDimensionToFilters({
            cubeIri: cube.iri,
            filters: cube.filters,
            dimension,
            isHidden: isHidden(dimension),
            isGrouped: isGrouped(dimension),
            possibleFilter: possibleFilters?.find(
              (f) => f.iri === dimension.iri
            ),
          });
        });
      });
    } else {
      const fieldDimensionIris = getFieldComponentIris(draft.fields);
      const isField = (dimension: Dimension) =>
        fieldDimensionIris.has(dimension.iri);
      draft.cubes.forEach((cube) => {
        const cubeDimensions = getCubeDimensions(dimensions, cube.iri);
        const sortedCubeDimensions = sortBy(
          cubeDimensions,
          (d) => (isGeoDimension(d) ? -1 : 1),
          (d) => (d.hierarchy ? -1 : 1)
        );
        sortedCubeDimensions.forEach((dimension) => {
          applyNonTableDimensionToFilters({
            cubeIri: cube.iri,
            filters: cube.filters,
            dimension: isJoinByComponent(dimension)
              ? getOriginalDimension(dimension, cube)
              : dimension,
            isField: isField(dimension),
            possibleFilter: possibleFilters?.find(
              (f) => f.iri === dimension.iri
            ),
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
  possibleFilter?: ObservationFilter;
}) => {
  const { filters, dimension, isHidden, isGrouped, possibleFilter, cubeIri } =
    props;
  const originalIri = isJoinByComponent(dimension)
    ? dimension.originalIris.find((c) => c.cubeIri === cubeIri)?.dimensionIri
    : dimension.iri;
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
      // of of the full range of values
      value: possibleFilter?.value ?? dimension.values[0].value,
    };
  }
};

export const applyNonTableDimensionToFilters = (props: {
  cubeIri: string;
  filters: Filters;
  dimension: Dimension;
  isField: boolean;
  possibleFilter?: ObservationFilter;
}) => {
  const { filters, dimension, isField, possibleFilter, cubeIri } = props;
  const originalIri = isJoinByComponent(dimension)
    ? dimension.originalIris.find((c) => c.cubeIri === cubeIri)?.dimensionIri
    : dimension.iri;
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
            : Object.keys(currentFilter.values)[0] ?? dimension.values[0].value;
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
      : possibleFilter?.value ?? dimension.values[0]?.value;

    if (filterValue) {
      filters[dimension.iri] = {
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
    componentIri,
    selectedValues: actionSelectedValues,
  } = action.value;
  const f = get(chartConfig.fields, field);
  const dataCubesComponents = getCachedComponents(
    draft.dataSource,
    chartConfig.cubes.map((cube) => ({
      iri: cube.iri,
      joinBy: cube.joinBy,
    })),
    locale
  );
  const dimensions = dataCubesComponents?.dimensions ?? [];
  const measures = dataCubesComponents?.measures ?? [];
  const components = [...dimensions, ...measures];
  const component = components.find((d) => d.iri === componentIri);
  const selectedValues = actionSelectedValues ?? component?.values ?? [];

  if (f) {
    // Reset field properties, excluding componentIri.
    (chartConfig.fields as GenericFields)[field] = { componentIri };
  }

  const sideEffect = getChartFieldChangeSideEffect(chartConfig, field);
  sideEffect?.(componentIri, {
    chartConfig,
    dimensions,
    measures,
    initializing: !f,
    selectedValues,
    field,
  });

  // Remove the component from interactive data filters.
  if (chartConfig.interactiveFiltersConfig?.dataFilters) {
    const componentIris =
      chartConfig.interactiveFiltersConfig.dataFilters.componentIris.filter(
        (d) => d !== componentIri
      );
    const active = componentIris.length > 0;
    chartConfig.interactiveFiltersConfig.dataFilters = {
      active,
      componentIris,
    };
  }

  const newConfig = deriveFiltersFromFields(chartConfig, { dimensions });
  const index = draft.chartConfigs.findIndex((d) => d.key === chartConfig.key);
  draft.chartConfigs[index] = newConfig;

  return draft;
};

export const handleChartOptionChanged = (
  draft: ConfiguratorState,
  action: Extract<ConfiguratorStateAction, { type: "CHART_OPTION_CHANGED" }>
) => {
  if (isConfiguring(draft)) {
    const { locale, path, field, value } = action.value;
    const chartConfig = getChartConfig(draft);
    const updatePath = field === null ? path : `fields["${field}"].${path}`;
    const dataCubesComponents = getCachedComponents(
      draft.dataSource,
      chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
      locale
    );

    const dimensions = dataCubesComponents?.dimensions ?? [];
    const measures = dataCubesComponents?.measures ?? [];

    if (field) {
      const sideEffect = getChartFieldOptionChangeSideEffect(
        chartConfig,
        field,
        path
      );
      sideEffect?.(value, { chartConfig, dimensions, measures, field });
    }

    if (value === FIELD_VALUE_NONE) {
      unset(chartConfig, updatePath);
    }

    setWith(chartConfig, updatePath, value, Object);
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
    const { field, colorConfigPath, dimensionIri, values, random } =
      action.value;
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
          palette: fieldValue.palette,
          dimensionValues: values,
          random,
        });
      }
    } else {
      const fieldValue: (GenericField & { palette: string }) | undefined = get(
        chartConfig,
        path
      );

      if (fieldValue?.componentIri === dimensionIri) {
        colorMapping = mapValueIrisToColor({
          palette: fieldValue.palette,
          dimensionValues: values,
          random,
        });
      }
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
  const adjustFilter = (cubeIri: string, dimensionIri: string) => {
    const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

    if (cube) {
      cube.filters[dimensionIri] = {
        type: "range",
        from,
        to,
      };
    }
  };

  if (dimension.isJoinByDimension) {
    for (const { cubeIri, dimensionIri } of dimension.originalIris) {
      adjustFilter(cubeIri, dimensionIri);
    }
  } else {
    adjustFilter(dimension.cubeIri, dimension.iri);
  }

  if (chartConfig.interactiveFiltersConfig) {
    chartConfig.interactiveFiltersConfig.timeRange = {
      componentIri: dimension.iri,
      active: chartConfig.interactiveFiltersConfig.timeRange.active,
      presets: {
        type: "range",
        from,
        to,
      },
    };
  }
};
export const reducer_: Reducer<ConfiguratorState, ConfiguratorStateAction> = (
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
        const { locale, chartKey, chartType } = action.value;
        const chartConfig = getChartConfig(draft, chartKey);
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
          locale
        );
        const dimensions = dataCubesComponents?.dimensions;
        const measures = dataCubesComponents?.measures;

        if (dimensions && measures) {
          const newConfig = deriveFiltersFromFields(
            getChartConfigAdjustedToChartType({
              chartConfig: current(chartConfig),
              newChartType: chartType,
              dimensions,
              measures,
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

    case "CHART_ACTIVE_FIELD_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        chartConfig.activeField = action.value;
      }

      return draft;

    case "CHART_FIELD_CHANGED":
      return handleChartFieldChanged(draft, action);

    case "CHART_FIELD_DELETED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        delete (chartConfig.fields as GenericFields)[action.value.field];
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
          action.value.locale
        );
        const dimensions = dataCubesComponents?.dimensions ?? [];
        const newConfig = deriveFiltersFromFields(chartConfig, { dimensions });
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === chartConfig.key
        );
        draft.chartConfigs[index] = newConfig;

        if (
          action.value.field === "segment" &&
          chartConfig.interactiveFiltersConfig
        ) {
          chartConfig.interactiveFiltersConfig.calculation.active = false;
          chartConfig.interactiveFiltersConfig.calculation.type = "identity";
        }
      }

      return draft;

    case "CHART_OPTION_CHANGED":
      return handleChartOptionChanged(draft, action);

    case "CHART_PALETTE_CHANGED":
      if (isConfiguring(draft)) {
        const chartConfig = getChartConfig(draft);
        setWith(
          chartConfig,
          `fields["${action.value.field}"].${
            action.value.colorConfigPath
              ? `${action.value.colorConfigPath}.`
              : ""
          }palette`,
          action.value.palette,
          Object
        );
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

    case "CHART_ANNOTATION_CHANGED":
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

    case "CHART_CONFIG_FILTER_SET_SINGLE":
      if (isConfiguring(draft)) {
        const { filters, value } = action.value;
        const chartConfig = getChartConfig(draft);

        /*
         * We are getting a list of filters, since setting a single filter in the UI
         * in the case of joined dimensions, sets multiple filters inside the chart
         * configuration.
         */
        for (const filter of filters) {
          const { cubeIri, dimensionIri } = filter;
          const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

          if (cube) {
            cube.filters[dimensionIri] = {
              type: "single",
              value,
            };
          } else {
            console.warn(
              `Could not set filter, no cube in chat config was found with iri ${cubeIri}`
            );
          }
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_REMOVE_SINGLE":
      if (isConfiguring(draft)) {
        const { filters } = action.value;
        const chartConfig = getChartConfig(draft);

        for (const filter of filters) {
          const { cubeIri, dimensionIri } = filter;
          const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

          if (cube) {
            delete cube.filters[dimensionIri];
            const newIFConfig = toggleInteractiveFilterDataDimension(
              chartConfig.interactiveFiltersConfig,
              dimensionIri,
              false
            );
            chartConfig.interactiveFiltersConfig = newIFConfig;
          }
        }
      }

      return draft;

    case "CHART_CONFIG_UPDATE_COLOR_MAPPING":
      return updateColorMapping(draft, action);

    case "CHART_CONFIG_FILTER_SET_MULTI":
      if (isConfiguring(draft)) {
        const { cubeIri, dimensionIri, values } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          cube.filters[dimensionIri] = makeMultiFilter(values);
        }
      }

      return draft;

    case "CHART_CONFIG_FILTER_RESET_RANGE":
      if (isConfiguring(draft)) {
        const { cubeIri, dimensionIri } = action.value;
        const chartConfig = getChartConfig(draft);
        const cube = chartConfig.cubes.find((cube) => cube.iri === cubeIri);

        if (cube) {
          delete cube.filters[dimensionIri];
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
      if (isConfiguring(draft)) {
        const chartConfig =
          createDraft(action.value.chartConfig) ?? getChartConfig(draft);
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          chartConfig.cubes.map((cube) => ({
            iri: cube.iri,
            joinBy: cube.joinBy,
          })),
          action.value.locale
        );

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
          draft.chartConfigs.push(newConfig);
          draft.activeChartKey = action.value.chartConfig.key;
        }

        ensureDashboardLayoutAreCorrect(draft);
      }

      return draft;

    case "CHART_CONFIG_ADD_NEW_DATASET":
      if (isConfiguring(draft)) {
        draft.chartConfigs.push(action.value.chartConfig);
        draft.activeChartKey = action.value.chartConfig.key;
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
        const { locale } = action.value;
        const chartConfig = getChartConfig(draft);
        const removedCubeIri = action.value.iri;
        const newCubes = chartConfig.cubes.filter(
          (c) => c.iri !== removedCubeIri
        );
        const dataCubesComponents = getCachedComponents(
          draft.dataSource,
          newCubes.map((cube) => ({
            iri: cube.iri,
            // Only keep joinBy while we have more than one cube
            joinBy: newCubes.length > 1 ? cube.joinBy : undefined,
          })),
          locale
        );

        if (!dataCubesComponents) {
          throw new Error(
            "Error while removing dataset: Could not find cached dataCubesComponents"
          );
        }

        const { dimensions, measures } = dataCubesComponents;
        const iris = chartConfig.cubes
          .filter((c) => c.iri !== removedCubeIri)
          .map(({ iri, publishIri }) => ({ iri, publishIri }));
        const possibleChartTypes = getPossibleChartTypes({
          dimensions,
          measures,
          cubeCount: iris.length,
        });
        const initialConfig = getInitialConfig({
          chartType: possibleChartTypes[0],
          iris,
          dimensions,
          measures,
        });
        const newChartConfig = deriveFiltersFromFields(initialConfig, {
          dimensions,
        });
        const initConfig = getInitialConfiguringConfigBasedOnCube({
          dataSource: draft.dataSource,
          chartConfig: newChartConfig,
        });
        const newConfig = {
          ...initConfig.chartConfigs[0],
          key: chartConfig.key,
        } as ChartConfig;
        const index = draft.chartConfigs.findIndex(
          (d) => d.key === chartConfig.key
        );
        const withFilters = deriveFiltersFromFields(newConfig, { dimensions });
        draft.chartConfigs[index] = withFilters;

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

        if (removedKey === draft.activeChartKey) {
          draft.activeChartKey = draft.chartConfigs[Math.max(index - 1, 0)].key;
        }
      } else {
        console.warn(
          "Ignoring CHART_CONFIG_REMOVE as state is incompatible with action"
        );
        console.log(current(draft));
      }

      ensureDashboardLayoutAreCorrect(draft);

      return draft;

    case "CHART_CONFIG_REORDER":
      if (isConfiguring(draft) || draft.state === "LAYOUTING") {
        const { oldIndex, newIndex } = action.value;
        const [removed] = draft.chartConfigs.splice(oldIndex, 1);
        draft.chartConfigs.splice(newIndex, 0, removed);
      }

      return draft;

    case "CHART_CONFIG_SWAP":
      if (isConfiguring(draft) || draft.state === "LAYOUTING") {
        const { oldIndex, newIndex } = action.value;
        const oldChartConfig = draft.chartConfigs[oldIndex];
        const newChartConfig = draft.chartConfigs[newIndex];
        draft.chartConfigs[oldIndex] = newChartConfig;
        draft.chartConfigs[newIndex] = oldChartConfig;
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
      if (draft.state === "LAYOUTING") {
        draft.layout = action.value;
      }

      return draft;

    case "LAYOUT_ACTIVE_FIELD_CHANGED":
      if (draft.state === "LAYOUTING") {
        draft.layout.activeField = action.value;
      }

      return draft;

    case "LAYOUT_ANNOTATION_CHANGED":
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

    case "DASHBOARD_FILTER_ADD":
      if (isLayouting(draft)) {
        setWith(
          draft,
          "dashboardFilters.filters",
          uniqBy(
            [...(draft.dashboardFilters?.filters ?? []), action.value],
            (x) => x.componentIri
          ),
          Object
        );
      }

      return draft;

    case "DASHBOARD_FILTER_UPDATE":
      if (isLayouting(draft)) {
        const idx = draft.dashboardFilters?.filters.findIndex(
          (f) => f.componentIri === action.value.componentIri
        );

        if (idx !== undefined && idx > -1) {
          const newFilters = [...(draft.dashboardFilters?.filters ?? [])];
          newFilters.splice(idx, 1, action.value);
          setWith(draft, "dashboardFilters.filters", newFilters, Object);
        }
      }
      return draft;

    case "DASHBOARD_FILTER_REMOVE":
      if (isLayouting(draft)) {
        const newFilters = draft.dashboardFilters?.filters.filter(
          (f) => f.componentIri !== action.value
        );
        setWith(draft, "dashboardFilters.filters", newFilters, Object);
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
    console.log(`Action: ${action.type}`, action, res);
    return res;
  };
};
export const reducer = reducerLogging ? withLogging(reducer_) : reducer_;

export function ensureDashboardLayoutAreCorrect(
  draft: WritableDraft<ConfiguratorState>
) {
  if (
    hasChartConfigs(draft) &&
    draft.layout.type === "dashboard" &&
    draft.layout.layout === "canvas"
  ) {
    const chartConfigKeys = draft.chartConfigs.map((c) => c.key).sort();

    const canvasLayouts = draft.layout.layouts["lg"];
    const layoutConfigKeys = canvasLayouts.map((c) => c.i).sort();

    if (!isEqual(chartConfigKeys, layoutConfigKeys)) {
      // remove charts that are no longer in the chartConfigs
      draft.layout.layouts["lg"] = canvasLayouts.filter((c) =>
        chartConfigKeys.includes(c.i)
      );

      // add new charts
      const newConfigs = draft.chartConfigs.filter(
        (x) => !layoutConfigKeys.includes(x.key)
      );

      let curX =
        (Math.max(...canvasLayouts.map((c) => c.x + c.w)) ?? 0) % COLS.lg;
      let curY = Math.max(...canvasLayouts.map((c) => c.y + c.h)) ?? 0;

      for (const chartConfig of newConfigs) {
        let chartX = curX;
        let chartY = curY;
        let chartW = 2;
        let chartH = MIN_H;
        canvasLayouts.push({
          i: chartConfig.key,
          x: chartX,
          y: chartY,
          w: chartW,
          h: chartH,
          // Is initialized later
          resizeHandles: [],
        });
        curX += chartW;
        if (curX > COLS.lg) {
          curX = 0;
          curY += chartH;
        }
      }
    }

    draft.layout.layouts["lg"] = canvasLayouts;
  }
}
