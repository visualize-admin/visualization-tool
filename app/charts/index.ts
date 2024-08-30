import { ascending, descending, group, rollup, rollups } from "d3-array";
import produce from "immer";
import get from "lodash/get";
import sortBy from "lodash/sortBy";

import {
  AREA_SEGMENT_SORTING,
  COLUMN_SEGMENT_SORTING,
  disableStacked,
  EncodingFieldType,
  PIE_SEGMENT_SORTING,
} from "@/charts/chart-config-ui-options";
import {
  DEFAULT_FIXED_COLOR_FIELD,
  getDefaultCategoricalColorField,
  getDefaultNumericalColorField,
} from "@/charts/map/constants";
import {
  AreaSegmentField,
  canBeNormalized,
  ChartConfig,
  ChartConfigsAdjusters,
  ChartSegmentField,
  ChartType,
  ColumnSegmentField,
  ComboChartType,
  ComboLineColumnFields,
  ComboLineSingleFields,
  Cube,
  FieldAdjuster,
  Filters,
  GenericFields,
  GenericSegmentField,
  InteractiveFiltersAdjusters,
  InteractiveFiltersConfig,
  isAreaConfig,
  isColumnConfig,
  isComboChartConfig,
  isComboLineColumnConfig,
  isComboLineDualConfig,
  isComboLineSingleConfig,
  isLineConfig,
  isMapConfig,
  isPieConfig,
  isScatterPlotConfig,
  isSegmentInConfig,
  LineSegmentField,
  MapAreaLayer,
  MapConfig,
  MapSymbolLayer,
  Meta,
  PieSegmentField,
  RegularChartType,
  ScatterPlotSegmentField,
  SortingOrder,
  SortingType,
  TableColumn,
  TableFields,
} from "@/config-types";
import { mapValueIrisToColor } from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  Component,
  Dimension,
  DimensionType,
  GeoCoordinatesDimension,
  GeoShapesDimension,
  getCategoricalDimensions,
  getGeoDimensions,
  HierarchyValue,
  isGeoDimension,
  isGeoShapesDimension,
  isNumericalMeasure,
  isOrdinalMeasure,
  isTemporalDimension,
  isTemporalEntityDimension,
  Measure,
  NumericalMeasure,
  SEGMENT_ENABLED_COMPONENTS,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  DEFAULT_CATEGORICAL_PALETTE_NAME,
  getDefaultCategoricalPaletteName,
} from "@/palettes";
import { bfs } from "@/utils/bfs";
import { CHART_CONFIG_VERSION } from "@/utils/chart-config/versioning";
import { createChartId } from "@/utils/create-chart-id";
import { isMultiHierarchyNode } from "@/utils/hierarchy";
import { unreachableError } from "@/utils/unreachable";

const chartTypes: ChartType[] = [
  "column",
  "line",
  "area",
  "scatterplot",
  "pie",
  "table",
  "map",
  "comboLineSingle",
  "comboLineDual",
  "comboLineColumn",
];

export const regularChartTypes: RegularChartType[] = [
  "column",
  "line",
  "area",
  "scatterplot",
  "pie",
  "table",
  "map",
];

const comboDifferentUnitChartTypes: ComboChartType[] = [
  "comboLineDual",
  "comboLineColumn",
];

export const comboSameUnitChartTypes: ComboChartType[] = ["comboLineSingle"];

export const comboChartTypes: ComboChartType[] = [
  ...comboSameUnitChartTypes,
  ...comboDifferentUnitChartTypes,
];

type ChartOrder = { [k in ChartType]: number };
function getChartTypeOrder({ cubeCount }: { cubeCount: number }): ChartOrder {
  const multiCubeBoost = cubeCount > 1 ? -100 : 0;
  return {
    column: 0,
    line: 1,
    area: 2,
    scatterplot: 3,
    pie: 4,
    map: 5,
    table: 6,
    comboLineSingle: 7 + multiCubeBoost,
    comboLineDual: 8 + multiCubeBoost,
    comboLineColumn: 9 + multiCubeBoost,
  };
}

/**
 * Finds the "best" dimension based on a preferred type (e.g. TemporalDimension) and Key Dimension
 *
 * @param dimensions
 * @param preferredType
 */
const findPreferredDimension = (
  dimensions: Component[],
  preferredTypes?: DimensionType[]
) => {
  const dim =
    preferredTypes
      ?.map((preferredType) =>
        dimensions.find(
          (d) => d.__typename === preferredType && d.isKeyDimension
        )
      )
      .filter(truthy)[0] ??
    dimensions.find((d) => d.isKeyDimension) ??
    dimensions[0];

  if (!dim) {
    throw Error("No dimension found for initial config");
  }

  return dim;
};

const getInitialInteractiveFiltersConfig = (options?: {
  timeRangeComponentCubeIri?: string;
  timeRangeComponentIri?: string;
}): InteractiveFiltersConfig => {
  const { timeRangeComponentCubeIri = "", timeRangeComponentIri = "" } =
    options ?? {};
  return {
    legend: {
      active: false,
      componentCubeIri: "",
      componentIri: "",
    },
    timeRange: {
      active: false,
      componentCubeIri: timeRangeComponentCubeIri,
      componentIri: timeRangeComponentIri,
      presets: {
        type: "range",
        from: "",
        to: "",
      },
    },
    dataFilters: {
      active: false,
      componentIris: [],
    },
    calculation: {
      active: false,
      type: "identity",
    },
  };
};

type SortingOption = {
  sortingType: SortingType;
  sortingOrder: SortingOrder;
};

export const DEFAULT_SORTING: SortingOption = {
  sortingType: "byAuto",
  sortingOrder: "asc",
};

/**
 * Finds bottomost layer for the first hierarchy
 */
const findBottommostLayers = (dimension: Dimension) => {
  const leaves = [] as HierarchyValue[];
  let hasSeenMultiHierarchyNode = false;
  bfs(dimension?.hierarchy as HierarchyValue[], (node) => {
    if (isMultiHierarchyNode(node)) {
      if (hasSeenMultiHierarchyNode) {
        return bfs.IGNORE;
      }

      hasSeenMultiHierarchyNode = true;
    }

    if ((!node.children || node.children.length === 0) && node.hasValue) {
      leaves.push(node);
    }
  });

  return leaves;
};

const makeInitialFiltersForArea = (dimension: Dimension) => {
  const filters: Filters = {};

  // Setting the filters so that bottommost areas are shown first
  // @ts-ignore
  if (dimension?.hierarchy) {
    const leaves = findBottommostLayers(dimension);
    if (leaves.length > 0) {
      filters[dimension.iri] = {
        type: "multi",
        values: Object.fromEntries(leaves.map((x) => [x.value, true])),
      };
    }
  }

  return filters;
};

export const initializeMapLayerField = ({
  chartConfig,
  field,
  componentIri,
  dimensions,
  measures,
}: {
  chartConfig: MapConfig;
  field: EncodingFieldType;
  componentIri: string;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  if (field === "areaLayer") {
    chartConfig.fields.areaLayer = getInitialAreaLayer({
      component: dimensions
        .filter(isGeoShapesDimension)
        .find((d) => d.iri === componentIri)!,
      measure: measures[0],
    });
  } else if (field === "symbolLayer") {
    chartConfig.fields.symbolLayer = getInitialSymbolLayer({
      component: dimensions
        .filter(isGeoDimension)
        .find((d) => d.iri === componentIri)!,
      measure: measures.find(isNumericalMeasure),
    });
  }
};

const getInitialAreaLayer = ({
  component,
  measure,
}: {
  component: GeoShapesDimension;
  measure: Measure;
}): MapAreaLayer => {
  const palette = getDefaultCategoricalPaletteName(measure);
  return {
    componentCubeIri: component.cubeIri,
    componentIri: component.iri,
    color: isNumericalMeasure(measure)
      ? getDefaultNumericalColorField({
          iri: measure.iri,
        })
      : getDefaultCategoricalColorField({
          iri: measure.iri,
          palette,
          dimensionValues: measure.values,
        }),
  };
};

const getInitialSymbolLayer = ({
  component,
  measure,
}: {
  component: GeoShapesDimension | GeoCoordinatesDimension;
  measure: NumericalMeasure | undefined;
}): MapSymbolLayer => {
  return {
    componentCubeIri: component.cubeIri,
    componentIri: component.iri,
    measureCubeIri: measure?.cubeIri ?? FIELD_VALUE_NONE,
    measureIri: measure?.iri ?? FIELD_VALUE_NONE,
    color: DEFAULT_FIXED_COLOR_FIELD,
  };
};

export const META: Meta = {
  title: {
    en: "",
    de: "",
    fr: "",
    it: "",
  },
  description: {
    en: "",
    de: "",
    fr: "",
    it: "",
  },
};

export const getInitialConfig = (options: {
  key?: string;
  iris: { iri: string; publishIri: string; joinBy?: string[] }[];
  chartType: ChartType;
  dimensions: Dimension[];
  measures: Measure[];
  meta?: Meta;
}): ChartConfig => {
  const { key, iris, chartType, dimensions, measures, meta } = options;
  const getGenericConfigProps = (
    filters?: Filters
  ): {
    key: string;
    version: string;
    meta: Meta;
    cubes: Cube[];
    activeField: string | undefined;
  } => {
    return {
      key: key ?? createChartId(),
      version: CHART_CONFIG_VERSION,
      meta: meta ?? META,
      // Technically, we should scope filters per cube; but as we only set initial
      // filters for area charts, and we can only have multi-cubes for combo charts,
      // we can ignore the filters scoping for now.
      cubes: iris.map(({ iri, publishIri, joinBy }) => ({
        iri,
        publishIri,
        filters: filters ?? {},
        joinBy,
      })),
      activeField: undefined,
    };
  };
  const numericalMeasures = measures.filter(isNumericalMeasure);
  const temporalDimensions = dimensions.filter(
    (d) => isTemporalDimension(d) || isTemporalEntityDimension(d)
  );

  switch (chartType) {
    case "area":
      const areaXComponent = temporalDimensions[0];
      const areaYComponent = numericalMeasures[0];
      return {
        ...getGenericConfigProps(),
        chartType,
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentIri: areaXComponent.iri,
        }),
        fields: {
          x: {
            componentCubeIri: areaXComponent.cubeIri,
            componentIri: areaXComponent.iri,
          },
          y: {
            componentCubeIri: areaYComponent.cubeIri,
            componentIri: areaYComponent.iri,
            imputationType: "none",
          },
        },
      };
    case "column":
      const columnXComponent = findPreferredDimension(
        sortBy(dimensions, (d) => (isGeoDimension(d) ? 1 : -1)),
        [
          "TemporalDimension",
          "TemporalEntityDimension",
          "TemporalOrdinalDimension",
        ]
      );
      const columnYComponent = numericalMeasures[0];
      return {
        ...getGenericConfigProps(),
        chartType,
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentIri: columnXComponent.iri,
        }),
        fields: {
          x: {
            componentCubeIri: columnXComponent.cubeIri,
            componentIri: columnXComponent.iri,
            sorting: DEFAULT_SORTING,
          },
          y: {
            componentCubeIri: columnYComponent.cubeIri,
            componentIri: columnYComponent.iri,
          },
        },
      };
    case "line":
      const lineXComponent = temporalDimensions[0];
      const lineYComponent = numericalMeasures[0];
      return {
        ...getGenericConfigProps(),
        chartType,
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentIri: lineXComponent.iri,
        }),
        fields: {
          x: {
            componentCubeIri: lineXComponent.cubeIri,
            componentIri: lineXComponent.iri,
          },
          y: {
            componentCubeIri: lineYComponent.cubeIri,
            componentIri: lineYComponent.iri,
          },
        },
      };
    case "map":
      const geoDimensions = getGeoDimensions(dimensions);
      const geoShapesDimensions = geoDimensions.filter(isGeoShapesDimension);
      const areaDimension = geoShapesDimensions[0];
      const showAreaLayer = geoShapesDimensions.length > 0;
      const showSymbolLayer = !showAreaLayer;
      return {
        ...getGenericConfigProps(makeInitialFiltersForArea(areaDimension)),
        chartType,
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig(),
        baseLayer: {
          show: true,
          locked: false,
          bbox: undefined,
        },
        fields: {
          ...(showAreaLayer
            ? {
                areaLayer: getInitialAreaLayer({
                  component: areaDimension,
                  measure: measures[0],
                }),
              }
            : {}),
          ...(showSymbolLayer
            ? {
                symbolLayer: getInitialSymbolLayer({
                  component: geoDimensions[0],
                  measure: numericalMeasures[0],
                }),
              }
            : {}),
        },
      };
    case "pie":
      const pieSegmentComponent =
        getCategoricalDimensions(dimensions)[0] ??
        getGeoDimensions(dimensions)[0];
      const piePalette = getDefaultCategoricalPaletteName(pieSegmentComponent);
      const pieMeasure = numericalMeasures[0];
      return {
        ...getGenericConfigProps(),
        chartType,
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig(),
        fields: {
          y: {
            componentCubeIri: pieMeasure.cubeIri,
            componentIri: pieMeasure.iri,
          },
          segment: {
            componentCubeIri: pieSegmentComponent.cubeIri,
            componentIri: pieSegmentComponent.iri,
            palette: piePalette,
            sorting: { sortingType: "byMeasure", sortingOrder: "asc" },
            colorMapping: mapValueIrisToColor({
              palette: piePalette,
              dimensionValues: pieSegmentComponent.values,
            }),
          },
        },
      };
    case "scatterplot":
      const scatterplotSegmentComponent =
        getCategoricalDimensions(dimensions)[0] ??
        getGeoDimensions(dimensions)[0];
      const scatterplotPalette = getDefaultCategoricalPaletteName(
        scatterplotSegmentComponent
      );
      const scatterplotXComponent = numericalMeasures[0];
      return {
        ...getGenericConfigProps(),
        chartType: "scatterplot",
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig(),
        fields: {
          x: {
            componentCubeIri: scatterplotXComponent.cubeIri,
            componentIri: scatterplotXComponent.iri,
          },
          y: {
            componentCubeIri:
              numericalMeasures.length > 1
                ? numericalMeasures[1].cubeIri
                : scatterplotXComponent.cubeIri,
            componentIri:
              numericalMeasures.length > 1
                ? numericalMeasures[1].iri
                : scatterplotXComponent.iri,
          },
          ...(scatterplotSegmentComponent
            ? {
                segment: {
                  componentCubeIri: scatterplotSegmentComponent.cubeIri,
                  componentIri: scatterplotSegmentComponent.iri,
                  palette: scatterplotPalette,
                  colorMapping: mapValueIrisToColor({
                    palette: scatterplotPalette,
                    dimensionValues: scatterplotSegmentComponent.values,
                  }),
                },
              }
            : {}),
        },
      };
    case "table":
      const sortedComponents = [...dimensions, ...measures].sort((a, b) =>
        ascending(a.order ?? Infinity, b.order ?? Infinity)
      );
      return {
        ...getGenericConfigProps(),
        chartType,
        interactiveFiltersConfig: undefined,
        settings: {
          showSearch: true,
          showAllRows: false,
        },
        sorting: [],
        fields: Object.fromEntries<TableColumn>(
          sortedComponents.map((d, i) => [
            // FIXME: handle properly in relevant places
            d.cubeIri + d.iri,
            {
              componentCubeIri: d.cubeIri,
              componentIri: d.iri,
              componentType: d.__typename,
              index: i,
              isGroup: false,
              isHidden: false,
              columnStyle: {
                textStyle: "regular",
                type: "text",
                textColor: "#000",
                columnColor: "#fff",
              },
            },
          ])
        ) as TableFields,
      };
    case "comboLineSingle": {
      const comboLineSingleXComponent = temporalDimensions[0];
      // It's guaranteed by getPossibleChartTypes that there are at least two units.
      const mostCommonUnit = rollups(
        numericalMeasures.filter((d) => d.unit),
        (v) => v.length,
        (d) => d.unit
      ).sort((a, b) => descending(a[1], b[1]))[0][0];
      const yComponentIris = numericalMeasures
        .filter((d) => d.unit === mostCommonUnit)
        .map((d) => d.iri);
      return {
        ...getGenericConfigProps(),
        chartType: "comboLineSingle",
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentCubeIri: comboLineSingleXComponent.cubeIri,
          timeRangeComponentIri: comboLineSingleXComponent.iri,
        }),
        fields: {
          x: {
            componentCubeIri: comboLineSingleXComponent.cubeIri,
            componentIri: comboLineSingleXComponent.iri,
          },
          // Use all measures with the most common unit.
          y: {
            componentIris: yComponentIris,
            palette: DEFAULT_CATEGORICAL_PALETTE_NAME,
            colorMapping: mapValueIrisToColor({
              palette: DEFAULT_CATEGORICAL_PALETTE_NAME,
              dimensionValues: yComponentIris.map((iri) => ({
                value: iri,
                label: iri,
              })),
            }),
          },
        },
      };
    }
    case "comboLineDual": {
      const comboLineDualXComponent = temporalDimensions[0];
      // It's guaranteed by getPossibleChartTypes that there are at least two units.
      const [firstUnit, secondUnit] = Array.from(
        new Set(numericalMeasures.filter((d) => d.unit).map((d) => d.unit))
      );
      const leftAxisComponent = numericalMeasures.find(
        (d) => d.unit === firstUnit
      )!;
      const rightAxisComponent = numericalMeasures.find(
        (d) => d.unit === secondUnit
      )!;
      return {
        ...getGenericConfigProps(),
        chartType: "comboLineDual",
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentCubeIri: comboLineDualXComponent.cubeIri,
          timeRangeComponentIri: comboLineDualXComponent.iri,
        }),
        fields: {
          x: {
            componentCubeIri: comboLineDualXComponent.cubeIri,
            componentIri: comboLineDualXComponent.iri,
          },
          y: {
            leftAxisComponentCubeIri: leftAxisComponent.cubeIri,
            leftAxisComponentIri: leftAxisComponent.iri,
            rightAxisComponentCubeIri: rightAxisComponent.cubeIri,
            rightAxisComponentIri: rightAxisComponent.iri,
            palette: DEFAULT_CATEGORICAL_PALETTE_NAME,
            colorMapping: mapValueIrisToColor({
              palette: DEFAULT_CATEGORICAL_PALETTE_NAME,
              dimensionValues: [
                leftAxisComponent.iri,
                rightAxisComponent.iri,
              ].map((iri) => ({
                value: iri,
                label: iri,
              })),
            }),
          },
        },
      };
    }
    case "comboLineColumn": {
      const comboLineColumnXComponent = temporalDimensions[0];
      // It's guaranteed by getPossibleChartTypes that there are at least two units.
      const [firstUnit, secondUnit] = Array.from(
        new Set(numericalMeasures.filter((d) => d.unit).map((d) => d.unit))
      );
      const lineComponent = numericalMeasures.find(
        (d) => d.unit === firstUnit
      )!;
      const columnComponent = numericalMeasures.find(
        (d) => d.unit === secondUnit
      )!;
      return {
        ...getGenericConfigProps(),
        chartType: "comboLineColumn",
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentCubeIri: comboLineColumnXComponent.cubeIri,
          timeRangeComponentIri: comboLineColumnXComponent.iri,
        }),
        fields: {
          x: {
            componentCubeIri: comboLineColumnXComponent.cubeIri,
            componentIri: comboLineColumnXComponent.iri,
          },
          y: {
            lineComponentCubeIri: lineComponent.cubeIri,
            lineComponentIri: lineComponent.iri,
            lineAxisOrientation: "right",
            columnComponentCubeIri: columnComponent.cubeIri,
            columnComponentIri: columnComponent.iri,
            palette: DEFAULT_CATEGORICAL_PALETTE_NAME,
            colorMapping: mapValueIrisToColor({
              palette: DEFAULT_CATEGORICAL_PALETTE_NAME,
              dimensionValues: [lineComponent.iri, columnComponent.iri].map(
                (iri) => ({
                  value: iri,
                  label: iri,
                })
              ),
            }),
          },
        },
      };
    }

    // This code *should* be unreachable! If it's not, it means we haven't checked
    // all cases (and we should get a TS error).
    default:
      throw unreachableError(chartType);
  }
};

export const getChartConfigAdjustedToChartType = ({
  chartConfig,
  newChartType,
  dimensions,
  measures,
}: {
  chartConfig: ChartConfig;
  newChartType: ChartType;
  dimensions: Dimension[];
  measures: Measure[];
}): ChartConfig => {
  const oldChartType = chartConfig.chartType;
  const initialConfig = getInitialConfig({
    key: chartConfig.key,
    chartType: newChartType,
    iris: chartConfig.cubes.map(({ iri, publishIri }) => ({
      iri,
      publishIri,
    })),
    dimensions,
    measures,
    meta: chartConfig.meta,
  });
  const { interactiveFiltersConfig, ...rest } = chartConfig;

  return getAdjustedChartConfig({
    path: "",
    // Make sure interactiveFiltersConfig is passed as the last item, so that
    // it can be adjusted based on other, already adjusted fields.
    field: {
      ...rest,
      interactiveFiltersConfig,
    },
    adjusters: chartConfigsAdjusters[newChartType],
    pathOverrides: chartConfigsPathOverrides[newChartType][oldChartType],
    oldChartConfig: chartConfig,
    newChartConfig: initialConfig,
    dimensions,
    measures,
  });
};

const getAdjustedChartConfig = ({
  path,
  field,
  adjusters,
  pathOverrides,
  oldChartConfig,
  newChartConfig,
  dimensions,
  measures,
}: {
  path: string;
  field: Object;
  adjusters: ChartConfigAdjusters;
  pathOverrides: ChartConfigPathOverrides;
  oldChartConfig: ChartConfig;
  newChartConfig: ChartConfig;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  // For filters & segments we can't reach a primitive level as we need to
  // pass the whole object. Table fields have an [iri: Config] structure,
  // so we also pass a whole field in such case (used in segments).
  const isConfigLeaf = (path: string, configValue: any) => {
    if (typeof configValue !== "object" || Array.isArray(configValue)) {
      return true;
    }

    switch (path) {
      case "fields":
        return (
          oldChartConfig.chartType === "table" &&
          isSegmentInConfig(newChartConfig)
        );
      case "filters":
      case "fields.segment":
      case "fields.animation":
      case "interactiveFiltersConfig.calculation":
      case "interactiveFiltersConfig.dataFilters":
      case "interactiveFiltersConfig.legend":
        return true;
      default:
        return false;
    }
  };

  const go = ({ path, field }: { path: string; field: Object }) => {
    for (const [k, v] of Object.entries(field)) {
      const newPath = path === "" ? k : `${path}.${k}`;

      if (v !== undefined) {
        const override = pathOverrides?.[newPath];

        if (isConfigLeaf(newPath, v) || override) {
          const getChartConfigWithAdjustedField: FieldAdjuster<
            ChartConfig,
            unknown
          > =
            (override?.path && get(adjusters, override.path)) ||
            get(adjusters, newPath);

          if (getChartConfigWithAdjustedField) {
            newChartConfig = getChartConfigWithAdjustedField({
              oldValue: override?.oldValue ? override.oldValue(v) : v,
              newChartConfig,
              oldChartConfig,
              dimensions,
              measures,
            });
          }
        } else {
          go({ path: newPath, field: v });
        }
      }
    }

    return newChartConfig;
  };

  return go({ path, field });
};

const interactiveFiltersAdjusters: InteractiveFiltersAdjusters = {
  legend: ({ oldValue, oldChartConfig, newChartConfig }) => {
    if ((oldChartConfig.fields as any).segment !== undefined) {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.legend = oldValue;
        }
      });
    }

    return newChartConfig;
  },
  timeRange: {
    active: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.timeRange.active = oldValue;
        }
      });
    },
    componentCubeIri: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.timeRange.componentCubeIri = oldValue;
        }
      });
    },
    componentIri: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.timeRange.componentIri = oldValue;
        }
      });
    },
    presets: {
      type: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          if (draft.interactiveFiltersConfig) {
            draft.interactiveFiltersConfig.timeRange.presets.type = oldValue;
          }
        });
      },
      from: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          if (draft.interactiveFiltersConfig) {
            draft.interactiveFiltersConfig.timeRange.presets.from = oldValue;
          }
        });
      },
      to: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          if (draft.interactiveFiltersConfig) {
            draft.interactiveFiltersConfig.timeRange.presets.to = oldValue;
          }
        });
      },
    },
  },
  dataFilters: ({ oldValue, newChartConfig }) => {
    return produce(newChartConfig, (draft) => {
      if (draft.interactiveFiltersConfig) {
        const oldComponentIris = oldValue.componentIris ?? [];

        if (oldComponentIris.length > 0) {
          const fieldComponentIris = Object.values(draft.fields).map(
            (d) => d.componentIri
          );
          // Remove componentIris that are not in the new chart config, as they
          // can't be used as interactive data filters then.
          const validComponentIris = oldComponentIris.filter(
            (d) => !fieldComponentIris.includes(d)
          );
          draft.interactiveFiltersConfig.dataFilters.active =
            validComponentIris.length > 0;
          draft.interactiveFiltersConfig.dataFilters.componentIris =
            validComponentIris;
        } else {
          draft.interactiveFiltersConfig.dataFilters = oldValue;
        }
      }
    });
  },
  calculation: ({ oldValue, newChartConfig }) => {
    return produce(newChartConfig, (draft) => {
      if (draft.interactiveFiltersConfig) {
        if (canBeNormalized(newChartConfig)) {
          draft.interactiveFiltersConfig.calculation = oldValue;
        } else {
          draft.interactiveFiltersConfig.calculation = {
            active: false,
            type: "identity",
          };
        }
      }
    });
  },
};

const chartConfigsAdjusters: ChartConfigsAdjusters = {
  column: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      x: {
        componentIri: ({
          oldValue,
          oldChartConfig,
          newChartConfig,
          dimensions,
        }) => {
          const oldComponentCubeIri = (oldChartConfig.fields as GenericFields)
            .x!.componentCubeIri;

          if (
            // When switching from a scatterplot, x is a measure.
            dimensions.find(
              (d) => d.iri === oldValue && d.cubeIri === oldComponentCubeIri
            )
          ) {
            return produce(newChartConfig, (draft) => {
              draft.fields.x.componentCubeIri = oldComponentCubeIri;
              draft.fields.x.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
      },
      y: {
        componentIri: ({ oldValue, oldChartConfig, newChartConfig }) => {
          const oldComponentCubeIri = (oldChartConfig.fields as GenericFields)
            .y!.componentCubeIri;
          return produce(newChartConfig, (draft) => {
            draft.fields.y.componentCubeIri = oldComponentCubeIri;
            draft.fields.y.componentIri = oldValue;
          });
        },
      },
      segment: ({
        oldValue,
        oldChartConfig,
        newChartConfig,
        dimensions,
        measures,
      }) => {
        let newSegment: ColumnSegmentField | undefined;
        const yMeasure = measures.find(
          (d) =>
            d.iri === newChartConfig.fields.y.componentIri &&
            d.cubeIri === newChartConfig.fields.y.componentCubeIri
        );

        // When switching from a table chart, a whole fields object is passed as oldValue.
        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
            measures,
          });

          if (tableSegment) {
            newSegment = {
              ...tableSegment,
              sorting: DEFAULT_SORTING,
              type: disableStacked(yMeasure) ? "grouped" : "stacked",
            };
          }
          // Otherwise we are dealing with a segment field. We shouldn't take
          // the segment from oldValue if the component has already been used as
          // x axis.
        } else if (
          newChartConfig.fields.x.componentIri !== oldValue.componentIri ||
          newChartConfig.fields.x.componentCubeIri !== oldValue.componentCubeIri
        ) {
          const oldSegment = oldValue as Exclude<typeof oldValue, TableFields>;
          newSegment = {
            ...oldSegment,
            // We could encounter byMeasure sorting type (Pie chart); we should
            // switch to byTotalSize sorting then.
            sorting: adjustSegmentSorting({
              segment: oldSegment,
              acceptedValues: COLUMN_SEGMENT_SORTING.map((d) => d.sortingType),
              defaultValue: "byTotalSize",
            }),
            type: disableStacked(yMeasure) ? "grouped" : "stacked",
          };
        }

        return produce(newChartConfig, (draft) => {
          if (newSegment) {
            draft.fields.segment = newSegment;
          }
        });
      },
      animation: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          // Temporal dimension could be used as X axis, in this case we need to
          // remove the animation.
          if (
            newChartConfig.fields.x.componentIri !== oldValue?.componentIri ||
            newChartConfig.fields.x.componentCubeIri !==
              oldValue?.componentCubeIri
          ) {
            draft.fields.animation = oldValue;
          }
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  line: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      x: {
        componentIri: ({ oldValue, newChartConfig, dimensions }) => {
          const ok = dimensions.find(
            (d) => isTemporalDimension(d) && d.iri === oldValue
          );

          if (ok) {
            return produce(newChartConfig, (draft) => {
              draft.fields.x.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
      },
      y: {
        componentCubeIri: ({ oldValue, newChartConfig }) => {
          return produce(newChartConfig, (draft) => {
            draft.fields.y.componentCubeIri = oldValue;
          });
        },
        componentIri: ({ oldValue, newChartConfig }) => {
          return produce(newChartConfig, (draft) => {
            draft.fields.y.componentIri = oldValue;
          });
        },
      },
      segment: ({
        oldValue,
        oldChartConfig,
        newChartConfig,
        dimensions,
        measures,
      }) => {
        let newSegment: LineSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
            measures,
          });

          if (tableSegment) {
            newSegment = tableSegment;
          }
        } else {
          const oldSegment = oldValue as Exclude<typeof oldValue, TableFields>;
          const segmentDimension = dimensions.find(
            (d) => d.iri === oldValue.componentIri
          );

          if (!isTemporalDimension(segmentDimension)) {
            newSegment = {
              componentCubeIri: oldSegment.componentCubeIri,
              componentIri: oldSegment.componentIri,
              palette: oldSegment.palette,
              colorMapping: oldSegment.colorMapping,
              sorting:
                "sorting" in oldSegment &&
                oldSegment.sorting &&
                "sortingOrder" in oldSegment.sorting
                  ? oldSegment.sorting ?? DEFAULT_FIXED_COLOR_FIELD
                  : DEFAULT_SORTING,
            };
          }
        }

        return produce(newChartConfig, (draft) => {
          if (newSegment) {
            draft.fields.segment = newSegment;
          }
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  area: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      x: {
        componentIri: ({ oldValue, newChartConfig, dimensions }) => {
          const oldComponentCubeIri = (newChartConfig.fields as GenericFields)
            .x!.componentCubeIri;
          const ok = dimensions.find(
            (d) =>
              isTemporalDimension(d) &&
              d.iri === oldValue &&
              d.cubeIri === oldComponentCubeIri
          );

          if (ok) {
            return produce(newChartConfig, (draft) => {
              draft.fields.x.componentCubeIri = oldComponentCubeIri;
              draft.fields.x.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
      },
      y: {
        componentIri: ({ oldValue, newChartConfig }) => {
          const oldComponentCubeIri = (newChartConfig.fields as GenericFields)
            .y!.componentCubeIri;
          return produce(newChartConfig, (draft) => {
            draft.fields.y.componentCubeIri = oldComponentCubeIri;
            draft.fields.y.componentIri = oldValue;
          });
        },
      },
      segment: ({
        oldValue,
        oldChartConfig,
        newChartConfig,
        dimensions,
        measures,
      }) => {
        const yMeasure = measures.find(
          (d) =>
            d.iri === newChartConfig.fields.y.componentIri &&
            d.cubeIri === newChartConfig.fields.y.componentCubeIri
        );

        if (disableStacked(yMeasure)) {
          return produce(newChartConfig, (draft) => {
            delete draft.fields.segment;
          });
        }

        let newSegment: AreaSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
            measures,
          });

          if (tableSegment) {
            newSegment = {
              ...tableSegment,
              sorting: DEFAULT_SORTING,
            };
          }
        } else {
          const oldSegment = oldValue as Exclude<typeof oldValue, TableFields>;
          const segmentDimension = dimensions.find(
            (d) =>
              d.iri === oldValue.componentIri &&
              d.cubeIri === oldSegment.componentCubeIri
          );

          if (!isTemporalDimension(segmentDimension)) {
            newSegment = {
              componentCubeIri: oldSegment.componentCubeIri,
              componentIri: oldSegment.componentIri,
              palette: oldSegment.palette,
              colorMapping: oldSegment.colorMapping,
              sorting: adjustSegmentSorting({
                segment: oldSegment,
                acceptedValues: AREA_SEGMENT_SORTING.map((d) => d.sortingType),
                defaultValue: "byTotalSize",
              }),
            };
          }
        }

        return produce(newChartConfig, (draft) => {
          if (newSegment) {
            draft.fields.segment = newSegment;
          }
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  scatterplot: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      // x is not needed, as this is the only chart type with x-axis measures.
      y: {
        componentIri: ({ oldValue, newChartConfig, measures }) => {
          const numericalMeasures = measures.filter(isNumericalMeasure);

          // If there is only one numerical measure then x & y are already filled correctly.
          if (numericalMeasures.length > 1) {
            const oldComponentCubeIri = (newChartConfig.fields as GenericFields)
              .y!.componentCubeIri;
            if (
              newChartConfig.fields.x.componentIri !== oldValue ||
              newChartConfig.fields.x.componentCubeIri !== oldComponentCubeIri
            ) {
              return produce(newChartConfig, (draft) => {
                draft.fields.y.componentCubeIri = oldComponentCubeIri;
                draft.fields.y.componentIri = oldValue;
              });
            }
          }

          return newChartConfig;
        },
      },
      segment: ({
        oldValue,
        oldChartConfig,
        newChartConfig,
        dimensions,
        measures,
      }) => {
        let newSegment: ScatterPlotSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
            measures,
          });

          if (tableSegment) {
            newSegment = tableSegment;
          }
        } else {
          const oldSegment = oldValue as Exclude<typeof oldValue, TableFields>;
          newSegment = {
            componentCubeIri: oldSegment.componentCubeIri,
            componentIri: oldSegment.componentIri,
            palette: oldSegment.palette,
            colorMapping: oldSegment.colorMapping,
          };
        }

        return produce(newChartConfig, (draft) => {
          if (newSegment) {
            draft.fields.segment = newSegment;
          }
        });
      },
      animation: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          draft.fields.animation = oldValue;
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  pie: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      y: {
        componentIri: ({ oldValue, newChartConfig }) => {
          const oldComponentCubeIri = (newChartConfig.fields as GenericFields)
            .y!.componentCubeIri;
          return produce(newChartConfig, (draft) => {
            draft.fields.y.componentCubeIri = oldComponentCubeIri;
            draft.fields.y.componentIri = oldValue;
          });
        },
      },
      segment: ({
        oldValue,
        oldChartConfig,
        newChartConfig,
        dimensions,
        measures,
      }) => {
        let newSegment: PieSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
            measures,
          });

          if (tableSegment) {
            newSegment = {
              ...tableSegment,
              sorting: DEFAULT_SORTING,
            };
          }
        } else {
          const oldSegment = oldValue as Exclude<typeof oldValue, TableFields>;
          newSegment = {
            componentCubeIri: oldSegment.componentCubeIri,
            componentIri: oldSegment.componentIri,
            palette: oldSegment.palette,
            colorMapping: oldSegment.colorMapping,
            sorting: adjustSegmentSorting({
              segment: oldSegment,
              acceptedValues: PIE_SEGMENT_SORTING.map((d) => d.sortingType),
              defaultValue: "byMeasure",
            }),
          };
        }

        return produce(newChartConfig, (draft) => {
          if (newSegment) {
            draft.fields.segment = newSegment;
          }
        });
      },
      animation: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          draft.fields.animation = oldValue;
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  table: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: ({ oldValue, newChartConfig }) => {
      for (const componentIri of Object.keys(newChartConfig.fields)) {
        if (componentIri === oldValue.componentIri) {
          return produce(newChartConfig, (draft) => {
            draft.fields[componentIri].isGroup = true;
          });
        }
      }

      return newChartConfig;
    },
  },
  map: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        // Filters have been reset by the initial config of the map.
        // We need to set them back to their old value, taking care not
        // to override the filters that have been set by the initial config
        // of the map.
        for (const oldCube of oldValue) {
          const cube = draft.cubes.find((d) => d.iri === oldCube.iri) as Cube;

          for (const [iri, value] of Object.entries(oldCube.filters)) {
            if (cube.filters[iri] === undefined) {
              cube.filters[iri] = value;
            }
          }
          if (oldCube.joinBy !== undefined) {
            cube.joinBy = oldCube.joinBy;
          }
        }
      });
    },
    fields: {
      areaLayer: {
        componentIri: ({ oldValue, newChartConfig, dimensions }) => {
          const areaDimension = dimensions.find(
            (d) => d.__typename === "GeoShapesDimension" && d.iri === oldValue
          );

          if (areaDimension) {
            return produce(newChartConfig, (draft) => {
              if (draft.fields.areaLayer) {
                draft.fields.areaLayer.componentIri = oldValue;
              }
            });
          }

          return newChartConfig;
        },
        color: {
          componentIri: ({ oldValue, newChartConfig }) => {
            return produce(newChartConfig, (draft) => {
              if (draft.fields.areaLayer) {
                draft.fields.areaLayer.color.componentIri = oldValue;
              }

              if (draft.fields.symbolLayer) {
                draft.fields.symbolLayer.measureIri = oldValue;
              }
            });
          },
        },
      },
      animation: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          draft.fields.animation = oldValue;
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  comboLineSingle: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      x: {
        componentIri: ({ oldValue, newChartConfig, dimensions }) => {
          const ok = dimensions.find(
            (d) => isTemporalDimension(d) && d.iri === oldValue
          );

          if (ok) {
            return produce(newChartConfig, (draft) => {
              draft.fields.x.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
      },
      y: {
        componentIris: ({
          oldValue,
          newChartConfig,
          oldChartConfig,
          measures,
        }) => {
          const numericalMeasures = measures.filter(
            (d) => isNumericalMeasure(d) && d.unit
          );
          const { unit } =
            numericalMeasures.find((d) => d.iri === oldValue) ??
            numericalMeasures[0];
          const componentIris = numericalMeasures
            .filter((d) => d.unit === unit)
            .map((d) => d.iri);
          const palette = isSegmentInConfig(oldChartConfig)
            ? oldChartConfig.fields.segment?.palette ??
              DEFAULT_CATEGORICAL_PALETTE_NAME
            : isComboChartConfig(oldChartConfig)
              ? oldChartConfig.fields.y.palette
              : DEFAULT_CATEGORICAL_PALETTE_NAME;

          return produce(newChartConfig, (draft) => {
            draft.fields.y = {
              componentIris,
              palette,
              colorMapping: mapValueIrisToColor({
                palette,
                dimensionValues: componentIris.map((iri) => ({
                  value: iri,
                  label: iri,
                })),
              }),
            };
          });
        },
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  comboLineDual: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      x: {
        componentIri: ({ oldValue, newChartConfig, dimensions }) => {
          const ok = dimensions.find(
            (d) => isTemporalDimension(d) && d.iri === oldValue
          );

          if (ok) {
            return produce(newChartConfig, (draft) => {
              draft.fields.x.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
      },
      y: ({ newChartConfig, oldChartConfig, measures }) => {
        const numericalMeasures = measures.filter(isNumericalMeasure);
        const numericalMeasureIris = numericalMeasures.map((d) => d.iri);
        let leftMeasure = numericalMeasures.find(
          (d) => d.iri === numericalMeasureIris[0]
        ) as NumericalMeasure;
        let rightMeasureIri: string | undefined;
        const getMeasure = (iri: string) => {
          return numericalMeasures.find(
            (d) => d.iri === iri
          ) as NumericalMeasure;
        };

        if (isComboLineColumnConfig(oldChartConfig)) {
          const {
            lineComponentIri: lineIri,
            lineAxisOrientation: lineOrientation,
            columnComponentIri: columnIri,
          } = oldChartConfig.fields.y;
          const leftAxisIri = lineOrientation === "left" ? lineIri : columnIri;
          leftMeasure = getMeasure(leftAxisIri);
          rightMeasureIri = lineOrientation === "left" ? columnIri : lineIri;
        } else if (isComboLineSingleConfig(oldChartConfig)) {
          leftMeasure = getMeasure(oldChartConfig.fields.y.componentIris[0]);
        } else if (
          isAreaConfig(oldChartConfig) ||
          isColumnConfig(oldChartConfig) ||
          isLineConfig(oldChartConfig) ||
          isPieConfig(oldChartConfig) ||
          isScatterPlotConfig(oldChartConfig)
        ) {
          leftMeasure = getMeasure(oldChartConfig.fields.y.componentIri);
        } else if (isMapConfig(oldChartConfig)) {
          const { areaLayer, symbolLayer } = oldChartConfig.fields;
          const leftAxisIri =
            areaLayer?.color.componentIri ?? symbolLayer?.measureIri;

          if (leftAxisIri) {
            leftMeasure = getMeasure(leftAxisIri);
          }
        }

        const rightAxisComponent = numericalMeasures.find((d) =>
          rightMeasureIri
            ? d.iri === rightMeasureIri
            : d.unit !== leftMeasure.unit
        ) as NumericalMeasure;
        const palette = isSegmentInConfig(oldChartConfig)
          ? oldChartConfig.fields.segment?.palette ??
            DEFAULT_CATEGORICAL_PALETTE_NAME
          : isComboChartConfig(oldChartConfig)
            ? oldChartConfig.fields.y.palette
            : DEFAULT_CATEGORICAL_PALETTE_NAME;

        return produce(newChartConfig, (draft) => {
          draft.fields.y = {
            leftAxisComponentCubeIri: leftMeasure.cubeIri,
            leftAxisComponentIri: leftMeasure.iri,
            rightAxisComponentCubeIri: rightAxisComponent.cubeIri,
            rightAxisComponentIri: rightAxisComponent.iri,
            palette,
            colorMapping: mapValueIrisToColor({
              palette,
              dimensionValues: [leftMeasure.iri, rightAxisComponent.iri].map(
                (iri) => ({
                  value: iri,
                  label: iri,
                })
              ),
            }),
          };
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  comboLineColumn: {
    cubes: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.cubes = oldValue;
      });
    },
    fields: {
      x: {
        componentIri: ({ oldValue, newChartConfig, dimensions }) => {
          const ok = dimensions.find(
            (d) => isTemporalDimension(d) && d.iri === oldValue
          );

          if (ok) {
            return produce(newChartConfig, (draft) => {
              draft.fields.x.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
      },
      y: ({ newChartConfig, oldChartConfig, measures }) => {
        const numericalMeasures = measures.filter(isNumericalMeasure);
        const numericalMeasureIris = numericalMeasures.map((d) => d.iri);
        let leftMeasure = numericalMeasures.find(
          (d) => d.iri === numericalMeasureIris[0]
        ) as NumericalMeasure;
        let rightAxisMeasureIri: string | undefined;
        const getMeasure = (iri: string) => {
          return numericalMeasures.find(
            (d) => d.iri === iri
          ) as NumericalMeasure;
        };

        if (isComboLineDualConfig(oldChartConfig)) {
          const leftAxisIri = oldChartConfig.fields.y.leftAxisComponentIri;
          leftMeasure = getMeasure(leftAxisIri);
          rightAxisMeasureIri = oldChartConfig.fields.y.rightAxisComponentIri;
        } else if (isComboLineSingleConfig(oldChartConfig)) {
          leftMeasure = getMeasure(oldChartConfig.fields.y.componentIris[0]);
        } else if (
          isAreaConfig(oldChartConfig) ||
          isColumnConfig(oldChartConfig) ||
          isLineConfig(oldChartConfig) ||
          isPieConfig(oldChartConfig) ||
          isScatterPlotConfig(oldChartConfig)
        ) {
          leftMeasure = getMeasure(oldChartConfig.fields.y.componentIri);
        } else if (isMapConfig(oldChartConfig)) {
          const { areaLayer, symbolLayer } = oldChartConfig.fields;
          const leftAxisIri =
            areaLayer?.color.componentIri ?? symbolLayer?.measureIri;

          if (leftAxisIri) {
            leftMeasure = getMeasure(leftAxisIri);
          }
        }

        const lineComponent = numericalMeasures.find((d) =>
          rightAxisMeasureIri
            ? d.iri === rightAxisMeasureIri
            : d.unit !== leftMeasure.unit
        ) as NumericalMeasure;
        const palette = isSegmentInConfig(oldChartConfig)
          ? oldChartConfig.fields.segment?.palette ??
            DEFAULT_CATEGORICAL_PALETTE_NAME
          : isComboChartConfig(oldChartConfig)
            ? oldChartConfig.fields.y.palette
            : DEFAULT_CATEGORICAL_PALETTE_NAME;

        return produce(newChartConfig, (draft) => {
          draft.fields.y = {
            columnComponentCubeIri: leftMeasure.cubeIri,
            columnComponentIri: leftMeasure.iri,
            lineComponentCubeIri: lineComponent.cubeIri,
            lineComponentIri: lineComponent.iri,
            lineAxisOrientation: "right",
            palette,
            colorMapping: mapValueIrisToColor({
              palette,
              dimensionValues: [leftMeasure.iri, lineComponent.iri].map(
                (iri) => ({
                  value: iri,
                  label: iri,
                })
              ),
            }),
          };
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
};
type ChartConfigAdjusters = (typeof chartConfigsAdjusters)[ChartType];

// Needed to correctly retain chart options when switching to maps and tables.
const chartConfigsPathOverrides: {
  [newChartType in ChartType]: {
    [oldChartType in ChartType]?: {
      [oldFieldToOverride: string]: {
        path: string;
        oldValue?: (d: any) => any;
      };
    };
  };
} = {
  column: {
    map: {
      "fields.areaLayer.componentIri": { path: "fields.x.componentIri" },
      "fields.areaLayer.color.componentIri": { path: "fields.y.componentIri" },
    },
    table: {
      fields: { path: "fields.segment" },
    },
    comboLineSingle: {
      "fields.y.componentIris": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineSingleFields["y"]["componentIris"]) => d[0],
      },
    },
    comboLineDual: {
      "fields.y.leftAxisComponentIri": { path: "fields.y.componentIri" },
    },
    comboLineColumn: {
      "fields.y": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineColumnFields["y"]) => {
          return d.lineAxisOrientation === "left"
            ? d.lineComponentIri
            : d.columnComponentIri;
        },
      },
    },
  },
  line: {
    map: {
      "fields.areaLayer.color.componentIri": { path: "fields.y.componentIri" },
    },
    table: {
      fields: { path: "fields.segment" },
    },
    comboLineSingle: {
      "fields.y.componentIris": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineSingleFields["y"]["componentIris"]) => d[0],
      },
    },
    comboLineDual: {
      "fields.y.leftAxisComponentIri": { path: "fields.y.componentIri" },
    },
    comboLineColumn: {
      "fields.y": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineColumnFields["y"]) => {
          return d.lineAxisOrientation === "left"
            ? d.lineComponentIri
            : d.columnComponentIri;
        },
      },
    },
  },
  area: {
    map: {
      "fields.areaLayer.color.componentIri": { path: "fields.y.componentIri" },
    },
    table: {
      fields: { path: "fields.segment" },
    },
    comboLineSingle: {
      "fields.y.componentIris": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineSingleFields["y"]["componentIris"]) => d[0],
      },
    },
    comboLineDual: {
      "fields.y.leftAxisComponentIri": { path: "fields.y.componentIri" },
    },
    comboLineColumn: {
      "fields.y": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineColumnFields["y"]) => {
          return d.lineAxisOrientation === "left"
            ? d.lineComponentIri
            : d.columnComponentIri;
        },
      },
    },
  },
  scatterplot: {
    map: {
      "fields.areaLayer.color.componentIri": { path: "fields.y.componentIri" },
    },
    table: {
      fields: { path: "fields.segment" },
    },
    comboLineSingle: {
      "fields.y.componentIris": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineSingleFields["y"]["componentIris"]) => d[0],
      },
    },
    comboLineDual: {
      "fields.y.leftAxisComponentIri": { path: "fields.y.componentIri" },
    },
    comboLineColumn: {
      "fields.y": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineColumnFields["y"]) => {
          return d.lineAxisOrientation === "left"
            ? d.lineComponentIri
            : d.columnComponentIri;
        },
      },
    },
  },
  pie: {
    map: {
      "fields.areaLayer.componentIri": { path: "fields.x.componentIri" },
      "fields.areaLayer.color.componentIri": { path: "fields.y.componentIri" },
    },
    table: {
      fields: { path: "fields.segment" },
    },
    comboLineSingle: {
      "fields.y.componentIris": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineSingleFields["y"]["componentIris"]) => d[0],
      },
    },
    comboLineDual: {
      "fields.y.leftAxisComponentIri": { path: "fields.y.componentIri" },
    },
    comboLineColumn: {
      "fields.y": {
        path: "fields.y.componentIri",
        oldValue: (d: ComboLineColumnFields["y"]) => {
          return d.lineAxisOrientation === "left"
            ? d.lineComponentIri
            : d.columnComponentIri;
        },
      },
    },
  },
  table: {
    column: {
      "fields.segment": { path: "fields" },
    },
    line: {
      "fields.segment": { path: "fields" },
    },
    area: {
      "fields.segment": { path: "fields" },
    },
    scatterplot: {
      "fields.segment": { path: "fields" },
    },
    pie: {
      "fields.segment": { path: "fields" },
    },
  },
  map: {
    column: {
      "fields.x.componentIri": { path: "fields.areaLayer.componentIri" },
      "fields.y.componentIri": { path: "fields.areaLayer.color.componentIri" },
    },
    line: {
      "fields.y.componentIri": { path: "fields.areaLayer.color.componentIri" },
    },
    area: {
      "fields.y.componentIri": { path: "fields.areaLayer.color.componentIri" },
    },
    scatterplot: {
      "fields.y.componentIri": { path: "fields.areaLayer.color.componentIri" },
    },
    pie: {
      "fields.x.componentIri": { path: "fields.areaLayer.componentIri" },
      "fields.y.componentIri": { path: "fields.areaLayer.color.componentIri" },
    },
    comboLineSingle: {
      "fields.y.componentIris": {
        path: "fields.areaLayer.color.componentIri",
        oldValue: (d: ComboLineSingleFields["y"]["componentIris"]) => d[0],
      },
    },
    comboLineDual: {
      "fields.y.leftAxisComponentIri": {
        path: "fields.areaLayer.color.componentIri",
      },
    },
    comboLineColumn: {
      "fields.y": {
        path: "fields.areaLayer.color.componentIri",
        oldValue: (d: ComboLineColumnFields["y"]) => {
          return d.lineAxisOrientation === "left"
            ? d.lineComponentIri
            : d.columnComponentIri;
        },
      },
    },
  },
  comboLineSingle: {
    column: {
      "fields.y.componentIri": { path: "fields.y.componentIris" },
    },
    line: {
      "fields.y.componentIri": { path: "fields.y.componentIris" },
    },
    area: {
      "fields.y.componentIri": { path: "fields.y.componentIris" },
    },
    scatterplot: {
      "fields.y.componentIri": { path: "fields.y.componentIris" },
    },
    pie: {
      "fields.y.componentIri": { path: "fields.y.componentIris" },
    },
    map: {
      "fields.areaLayer.color.componentIri": {
        path: "fields.y.componentIris",
      },
    },
    comboLineDual: {
      "fields.y.leftAxisComponentIri": {
        path: "fields.y.componentIris",
      },
    },
    comboLineColumn: {
      "fields.y.lineComponentIri": { path: "fields.y.componentIris" },
    },
  },
  comboLineDual: {
    column: {
      "fields.y": { path: "fields.y" },
    },
    line: {
      "fields.y": { path: "fields.y" },
    },
    area: {
      "fields.y": { path: "fields.y" },
    },
    scatterplot: {
      "fields.y": { path: "fields.y" },
    },
    pie: {
      "fields.y": { path: "fields.y" },
    },
    map: {
      "fields.areaLayer": { path: "fields.y" },
    },
    comboLineSingle: {
      "fields.y": { path: "fields.y" },
    },
    comboLineColumn: {
      "fields.y": { path: "fields.y" },
    },
  },
  comboLineColumn: {
    column: {
      "fields.y": { path: "fields.y" },
    },
    line: {
      "fields.y": { path: "fields.y" },
    },
    area: {
      "fields.y": { path: "fields.y" },
    },
    scatterplot: {
      "fields.y": { path: "fields.y" },
    },
    pie: {
      "fields.y": { path: "fields.y" },
    },
    map: {
      "fields.areaLayer": { path: "fields.y" },
    },
    comboLineSingle: {
      "fields.y": { path: "fields.y" },
    },
    comboLineDual: {
      "fields.y": { path: "fields.y" },
    },
  },
};
type ChartConfigPathOverrides =
  (typeof chartConfigsPathOverrides)[ChartType][ChartType];

const adjustSegmentSorting = ({
  segment,
  acceptedValues,
  defaultValue,
}: {
  segment: ChartSegmentField;
  acceptedValues: SortingType[];
  defaultValue: SortingType;
}): SortingOption | undefined => {
  const sorting = (segment as any).sorting as SortingOption | undefined;
  const sortingType = sorting?.sortingType;
  const newSorting = sorting
    ? sortingType && acceptedValues.includes(sortingType)
      ? sorting
      : { ...sorting, sortingType: defaultValue }
    : DEFAULT_SORTING;

  return newSorting;
};

// Helpers
export const getPossibleChartTypes = ({
  dimensions,
  measures,
  allowedChartTypes,
  cubeCount,
}: {
  dimensions: Dimension[];
  measures: Measure[];
  allowedChartTypes?: ChartType[];
  cubeCount: number;
}): ChartType[] => {
  const numericalMeasures = measures.filter(isNumericalMeasure);
  const ordinalMeasures = measures.filter(isOrdinalMeasure);
  const categoricalDimensions = getCategoricalDimensions(dimensions);
  const geoDimensions = getGeoDimensions(dimensions);
  const temporalDimensions = dimensions.filter(
    (d) => isTemporalDimension(d) || isTemporalEntityDimension(d)
  );

  const categoricalEnabled: RegularChartType[] = ["column", "pie"];
  const geoEnabled: RegularChartType[] = ["column", "map", "pie"];
  const multipleNumericalMeasuresEnabled: RegularChartType[] = ["scatterplot"];
  const timeEnabled: RegularChartType[] = ["area", "column", "line"];

  const possibles: ChartType[] = ["table"];
  if (numericalMeasures.length > 0) {
    if (categoricalDimensions.length > 0) {
      possibles.push(...categoricalEnabled);
    }

    if (geoDimensions.length > 0) {
      possibles.push(...geoEnabled);
    }

    if (numericalMeasures.length > 1) {
      possibles.push(...multipleNumericalMeasuresEnabled);

      if (temporalDimensions.length > 0) {
        const measuresWithUnit = numericalMeasures.filter((d) => d.unit);
        const uniqueUnits = Array.from(
          new Set(measuresWithUnit.map((d) => d.unit))
        );

        if (uniqueUnits.length > 1) {
          possibles.push(...comboDifferentUnitChartTypes);
        }

        const unitCounts = rollup(
          measuresWithUnit,
          (v) => v.length,
          (d) => d.unit
        );

        if (Array.from(unitCounts.values()).some((d) => d > 1)) {
          possibles.push(...comboSameUnitChartTypes);
        }
      }
    }

    if (temporalDimensions.length > 0) {
      possibles.push(...timeEnabled);
    }
  }

  if (ordinalMeasures.length > 0 && geoDimensions.length > 0) {
    possibles.push("map");
  }

  const chartTypesOrder = getChartTypeOrder({ cubeCount });
  return chartTypes
    .filter(
      (d) =>
        possibles.includes(d) &&
        (!allowedChartTypes || allowedChartTypes.includes(d))
    )
    .sort((a, b) => chartTypesOrder[a] - chartTypesOrder[b]);
};

export const getFieldComponentIris = (fields: ChartConfig["fields"]) => {
  return new Set(
    Object.values(fields).flatMap((f) =>
      f?.componentIri ? [f.componentIri] : []
    )
  );
};

export const getGroupedFieldIris = (fields: GenericFields) => {
  return new Set(
    Object.values(fields).flatMap((f) =>
      f && (f as $IntentionalAny).isGroup ? [f.componentIri] : []
    )
  );
};

export const getHiddenFieldIris = (fields: GenericFields) => {
  return new Set(
    Object.values(fields).flatMap((f) =>
      f && (f as $IntentionalAny).isHidden ? [f.componentIri] : []
    )
  );
};

export const getFieldComponentIri = (
  fields: ChartConfig["fields"],
  field: string
): string | undefined => {
  // Multi axis charts have multiple componentIris in the y field.
  return (fields as $IntentionalAny)[field]?.componentIri;
};

const convertTableFieldsToSegmentField = ({
  fields,
  dimensions,
  measures,
}: {
  fields: TableFields;
  dimensions: Dimension[];
  measures: Measure[];
}): GenericSegmentField | undefined => {
  const groupedColumns = group(Object.values(fields), (d) => d.isGroup)
    .get(true)
    ?.filter((d) => SEGMENT_ENABLED_COMPONENTS.includes(d.componentType))
    .sort((a, b) => a.index - b.index);
  const component = groupedColumns?.[0];

  if (!component) {
    return;
  }

  const { componentCubeIri, componentIri } = component;
  const actualComponent = [...dimensions, ...measures].find(
    (d) => d.cubeIri === componentCubeIri && d.iri === componentIri
  ) as Component;
  const palette = getDefaultCategoricalPaletteName(actualComponent);

  return {
    componentCubeIri,
    componentIri,
    palette,
    colorMapping: mapValueIrisToColor({
      palette,
      dimensionValues: actualComponent.values,
    }),
  };
};

export const getChartSymbol = (
  chartType: ChartType
): "square" | "line" | "circle" => {
  switch (chartType) {
    case "area":
    case "column":
    case "comboLineColumn":
    case "pie":
    case "map":
    case "table":
      return "square";
    case "comboLineDual":
    case "comboLineSingle":
    case "line":
      return "line";
    case "scatterplot":
      return "circle";
    default:
      const _exhaustiveCheck: never = chartType;
      return _exhaustiveCheck;
  }
};
