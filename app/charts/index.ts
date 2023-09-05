import { ascending, group } from "d3";
import produce from "immer";
import get from "lodash/get";
import sortBy from "lodash/sortBy";

import {
  AREA_SEGMENT_SORTING,
  COLUMN_SEGMENT_SORTING,
  disableStacked,
  PIE_SEGMENT_SORTING,
} from "@/charts/chart-config-ui-options";
import { DEFAULT_FIXED_COLOR_FIELD } from "@/charts/map/constants";
import {
  AreaSegmentField,
  canBeNormalized,
  ChartConfig,
  ChartConfigsAdjusters,
  ChartSegmentField,
  ChartType,
  ColumnSegmentField,
  FieldAdjuster,
  GenericFields,
  GenericSegmentField,
  InteractiveFiltersAdjusters,
  InteractiveFiltersConfig,
  isSegmentInConfig,
  LineSegmentField,
  MapAreaLayer,
  MapConfig,
  MapSymbolLayer,
  Meta,
  PieSegmentField,
  ScatterPlotSegmentField,
  SortingOrder,
  SortingType,
  TableColumn,
  TableFields,
} from "@/config-types";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { HierarchyValue } from "@/graphql/resolver-types";
import { getDefaultCategoricalPaletteName } from "@/palettes";
import { bfs } from "@/utils/bfs";
import { CHART_CONFIG_VERSION } from "@/utils/chart-config/versioning";
import { createChartId } from "@/utils/create-chart-id";
import { isMultiHierarchyNode } from "@/utils/hierarchy";

import { mapValueIrisToColor } from "../configurator/components/ui-helpers";
import {
  getCategoricalDimensions,
  getGeoDimensions,
  getTemporalDimensions,
  isGeoCoordinatesDimension,
  isGeoDimension,
  isGeoShapesDimension,
  isNumericalMeasure,
  isOrdinalMeasure,
  isTemporalDimension,
} from "../domain/data";
import {
  DimensionMetadataFragment,
  GeoCoordinatesDimension,
  GeoShapesDimension,
  NumericalMeasure,
  OrdinalMeasure,
} from "../graphql/query-hooks";
import {
  DataCubeMetadata,
  DataCubeMetadataWithHierarchies,
} from "../graphql/types";
import { unreachableError } from "../utils/unreachable";

export const chartTypes: ChartType[] = [
  "column",
  "line",
  "area",
  "scatterplot",
  "pie",
  "table",
  "map",
];

export const chartTypesOrder: { [k in ChartType]: number } = {
  column: 0,
  line: 1,
  area: 2,
  scatterplot: 3,
  pie: 4,
  map: 5,
  table: 6,
};

/**
 * Finds the "best" dimension based on a preferred type (e.g. TemporalDimension) and Key Dimension
 *
 * @param dimensions
 * @param preferredType
 */
export const findPreferredDimension = (
  dimensions: DataCubeMetadata["dimensions"],
  preferredType?: DimensionMetadataFragment["__typename"]
) => {
  const dim =
    dimensions.find(
      (d) => d.__typename === preferredType && d.isKeyDimension
    ) ??
    dimensions.find((d) => d.isKeyDimension) ??
    dimensions[0];

  if (!dim) {
    throw Error("No dimension found for initial config");
  }

  return dim;
};

const getInitialInteractiveFiltersConfig = (options?: {
  timeRangeComponentIri?: string;
}): InteractiveFiltersConfig => {
  const { timeRangeComponentIri = "" } = options ?? {};

  return {
    legend: {
      active: false,
      componentIri: "",
    },
    timeRange: {
      active: false,
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
const findBottommostLayers = (
  dimension: DataCubeMetadataWithHierarchies["dimensions"][0]
) => {
  const leaves = [] as HierarchyValue[];
  let hasSeenMultiHierarchyNode = false;
  bfs(dimension?.hierarchy as HierarchyValue[], (node) => {
    if (isMultiHierarchyNode(node)) {
      if (hasSeenMultiHierarchyNode) {
        return bfs.IGNORE;
      } else {
        hasSeenMultiHierarchyNode = true;
      }
    }
    if ((!node.children || node.children.length === 0) && node.hasValue) {
      leaves.push(node);
    }
  });
  return leaves;
};

const makeInitialFiltersForArea = (
  dimension: DataCubeMetadata["dimensions"][0]
) => {
  let filters = {} as ChartConfig["filters"];
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
  field: "areaLayer" | "symbolLayer";
  componentIri: string;
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
}) => {
  if (field === "areaLayer") {
    chartConfig.fields.areaLayer = getInitialAreaLayer({
      component: dimensions
        .filter(isGeoShapesDimension)
        .find((d) => d.iri === componentIri)!,
      measure: measures[0] as NumericalMeasure | OrdinalMeasure,
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

export const getInitialAreaLayer = ({
  component,
  measure,
}: {
  component: GeoShapesDimension;
  // color
  measure: NumericalMeasure | OrdinalMeasure;
}): MapAreaLayer => {
  const palette = getDefaultCategoricalPaletteName(measure);

  return {
    componentIri: component.iri,
    color: isNumericalMeasure(measure)
      ? {
          type: "numerical",
          componentIri: measure.iri,
          scaleType: "continuous",
          interpolationType: "linear",
          palette: "oranges",
        }
      : {
          type: "categorical",
          componentIri: measure.iri,
          palette,
          colorMapping: mapValueIrisToColor({
            palette,
            dimensionValues: measure.values,
          }),
        },
  };
};

export const getInitialSymbolLayer = ({
  component,
  measure,
}: {
  component: GeoShapesDimension | GeoCoordinatesDimension;
  // size, probably should be extracted to a field
  measure: NumericalMeasure | undefined;
}): MapSymbolLayer => {
  return {
    componentIri: component.iri,
    measureIri: measure?.iri || FIELD_VALUE_NONE,
    color: DEFAULT_FIXED_COLOR_FIELD,
  };
};

const META: Meta = {
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

export const getInitialConfig = ({
  chartType,
  dimensions,
  measures,
}: {
  chartType: ChartType;
  dimensions: DataCubeMetadataWithHierarchies["dimensions"];
  measures: DataCubeMetadataWithHierarchies["measures"];
}): ChartConfig => {
  const genericConfigProps: {
    key: string;
    version: string;
    meta: Meta;
    activeField: string | undefined;
  } = {
    key: createChartId(),
    version: CHART_CONFIG_VERSION,
    meta: META,
    activeField: undefined,
  };
  const numericalMeasures = measures.filter(isNumericalMeasure);

  switch (chartType) {
    case "area":
      const areaXComponentIri = getTemporalDimensions(dimensions)[0].iri;

      return {
        ...genericConfigProps,
        chartType,
        filters: {},
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentIri: areaXComponentIri,
        }),
        fields: {
          x: { componentIri: areaXComponentIri },
          y: { componentIri: numericalMeasures[0].iri, imputationType: "none" },
        },
      };
    case "column":
      const columnXComponentIri = findPreferredDimension(
        sortBy(dimensions, (x) =>
          isGeoCoordinatesDimension(x) || isGeoShapesDimension(x) ? 1 : -1
        ),
        "TemporalDimension"
      ).iri;

      return {
        ...genericConfigProps,
        chartType,
        filters: {},
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentIri: columnXComponentIri,
        }),
        fields: {
          x: {
            componentIri: columnXComponentIri,
            sorting: DEFAULT_SORTING,
          },
          y: { componentIri: numericalMeasures[0].iri },
        },
      };
    case "line":
      const lineXComponentIri = getTemporalDimensions(dimensions)[0].iri;

      return {
        ...genericConfigProps,
        chartType,
        filters: {},
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig({
          timeRangeComponentIri: lineXComponentIri,
        }),
        fields: {
          x: { componentIri: lineXComponentIri },
          y: { componentIri: numericalMeasures[0].iri },
        },
      };
    case "map":
      const geoDimensions = getGeoDimensions(dimensions);
      const geoShapesDimensions = geoDimensions.filter(isGeoShapesDimension);
      const areaDimension = geoShapesDimensions[0];
      const showAreaLayer = geoShapesDimensions.length > 0;
      const showSymbolLayer = !showAreaLayer;

      return {
        ...genericConfigProps,
        chartType,
        filters: makeInitialFiltersForArea(areaDimension),
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
        getCategoricalDimensions(dimensions)[0] ||
        getGeoDimensions(dimensions)[0];
      const piePalette = getDefaultCategoricalPaletteName(pieSegmentComponent);

      return {
        ...genericConfigProps,
        chartType,
        filters: {},
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig(),
        fields: {
          y: { componentIri: numericalMeasures[0].iri },
          segment: {
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
        getCategoricalDimensions(dimensions)[0] ||
        getGeoDimensions(dimensions)[0];
      const scatterplotPalette = getDefaultCategoricalPaletteName(
        scatterplotSegmentComponent
      );

      return {
        ...genericConfigProps,
        chartType: "scatterplot",
        filters: {},
        interactiveFiltersConfig: getInitialInteractiveFiltersConfig(),
        fields: {
          x: { componentIri: numericalMeasures[0].iri },
          y: {
            componentIri:
              numericalMeasures.length > 1
                ? numericalMeasures[1].iri
                : numericalMeasures[0].iri,
          },
          ...(scatterplotSegmentComponent
            ? {
                componentIri: scatterplotSegmentComponent.iri,
                palette: scatterplotPalette,
                colorMapping: mapValueIrisToColor({
                  palette: scatterplotPalette,
                  dimensionValues: scatterplotSegmentComponent.values,
                }),
              }
            : {}),
        },
      };
    case "table":
      const allDimensionsSorted = [...dimensions, ...measures].sort((a, b) =>
        ascending(a.order ?? Infinity, b.order ?? Infinity)
      );

      return {
        ...genericConfigProps,
        chartType,
        filters: {},
        interactiveFiltersConfig: undefined,
        settings: {
          showSearch: true,
          showAllRows: false,
        },
        sorting: [],
        fields: Object.fromEntries<TableColumn>(
          allDimensionsSorted.map((d, i) => [
            d.iri,
            {
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
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}): ChartConfig => {
  const oldChartType = chartConfig.chartType;
  const initialConfig = getInitialConfig({
    chartType: newChartType,
    dimensions,
    measures,
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
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
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
        if (isConfigLeaf(newPath, v)) {
          const getChartConfigWithAdjustedField: FieldAdjuster<
            ChartConfig,
            unknown
          > =
            (pathOverrides && get(adjusters, pathOverrides[newPath])) ||
            get(adjusters, newPath);

          if (getChartConfigWithAdjustedField) {
            newChartConfig = getChartConfigWithAdjustedField({
              oldValue: v,
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
    filters: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.filters = oldValue;
      });
    },
    fields: {
      x: {
        componentIri: ({ oldValue, newChartConfig, dimensions }) => {
          // When switching from a scatterplot, x is a measure.
          if (dimensions.find((d) => d.iri === oldValue)) {
            return produce(newChartConfig, (draft) => {
              draft.fields.x.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
      },
      y: {
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
        let newSegment: ColumnSegmentField | undefined;
        const yMeasure = measures.find(
          (d) => d.iri === newChartConfig.fields.y.componentIri
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
          // Otherwise we are dealing with a segment field.
        } else {
          const oldSegment = oldValue as Exclude<typeof oldValue, TableFields>;
          newSegment = {
            ...oldSegment,
            // We could encouner byMeasure sorting type (Pie chart); we should
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
          if (newChartConfig.fields.x.componentIri !== oldValue?.componentIri) {
            draft.fields.animation = oldValue;
          }
        });
      },
    },
    interactiveFiltersConfig: interactiveFiltersAdjusters,
  },
  line: {
    filters: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.filters = oldValue;
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
          newSegment = {
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
    filters: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.filters = oldValue;
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
        const yMeasure = measures.find(
          (d) => d.iri === newChartConfig.fields.y.componentIri
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
          newSegment = {
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
    filters: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.filters = oldValue;
      });
    },
    fields: {
      // x is not needed, as this is the only chart type with x-axis measures.
      y: {
        componentIri: ({ oldValue, newChartConfig, measures }) => {
          const numericalMeasures = measures.filter(isNumericalMeasure);

          // If there is only one numerical measure then x & y are already filled correctly.
          if (numericalMeasures.length > 1) {
            if (newChartConfig.fields.x.componentIri !== oldValue) {
              return produce(newChartConfig, (draft) => {
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
    filters: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.filters = oldValue;
      });
    },
    fields: {
      y: {
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
    filters: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        draft.filters = oldValue;
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
    filters: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        // Filters have been reset by the initial config of the map.
        // We need to set them back to their old value, taking care not
        // to override the filters that have been set by the initial config
        // of the map.
        for (const [iri, value] of Object.entries(oldValue)) {
          if (draft.filters[iri] === undefined) {
            draft.filters[iri] = value;
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
};
type ChartConfigAdjusters = typeof chartConfigsAdjusters[ChartType];

// Needed to correctly retain chart options when switching to maps and tables.
const chartConfigsPathOverrides: {
  [newChartType in ChartType]: {
    [oldChartType in ChartType]?: {
      [oldFieldToOverride: string]: string;
    };
  };
} = {
  column: {
    map: {
      "fields.areaLayer.componentIri": "fields.x.componentIri",
      "fields.areaLayer.color.componentIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  line: {
    map: {
      "fields.areaLayer.color.componentIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  area: {
    map: {
      "fields.areaLayer.color.componentIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  scatterplot: {
    map: {
      "fields.areaLayer.color.componentIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  pie: {
    map: {
      "fields.areaLayer.componentIri": "fields.x.componentIri",
      "fields.areaLayer.color.componentIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  table: {
    column: {
      "fields.segment": "fields",
    },
    line: {
      "fields.segment": "fields",
    },
    area: {
      "fields.segment": "fields",
    },
    scatterplot: {
      "fields.segment": "fields",
    },
    pie: {
      "fields.segment": "fields",
    },
  },
  map: {
    column: {
      "fields.x.componentIri": "fields.areaLayer.componentIri",
      "fields.y.componentIri": "fields.areaLayer.color.componentIri",
    },
    line: {
      "fields.y.componentIri": "fields.areaLayer.color.componentIri",
    },
    area: {
      "fields.y.componentIri": "fields.areaLayer.color.componentIri",
    },
    scatterplot: {
      "fields.y.componentIri": "fields.areaLayer.color.componentIri",
    },
    pie: {
      "fields.x.componentIri": "fields.areaLayer.componentIri",
      "fields.y.componentIri": "fields.areaLayer.color.componentIri",
    },
  },
};
type ChartConfigPathOverrides =
  typeof chartConfigsPathOverrides[ChartType][ChartType];

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
export const getPossibleChartType = ({
  dimensions,
  measures,
}: {
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
}): ChartType[] => {
  const numericalMeasures = measures.filter(isNumericalMeasure);
  const ordinalMeasures = measures.filter(isOrdinalMeasure);
  const categoricalDimensions = getCategoricalDimensions(dimensions);
  const geoDimensions = getGeoDimensions(dimensions);
  const temporalDimensions = getTemporalDimensions(dimensions);

  const categoricalEnabled: ChartType[] = ["column", "pie"];
  const geoEnabled: ChartType[] = ["column", "map", "pie"];
  const multipleNumericalMeasuresEnabled: ChartType[] = ["scatterplot"];
  const timeEnabled: ChartType[] = ["area", "column", "line"];

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
    }

    if (temporalDimensions.length > 0) {
      possibles.push(...timeEnabled);
    }
  }

  if (ordinalMeasures.length > 0 && geoDimensions.length > 0) {
    possibles.push("map");
  }

  return chartTypes
    .filter((d) => possibles.includes(d))
    .sort((a, b) => chartTypesOrder[a] - chartTypesOrder[b]);
};

export const getFieldComponentIris = (fields: GenericFields) => {
  return new Set(
    Object.values(fields).flatMap((f) => (f ? [f.componentIri] : []))
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

export const getFieldComponentIri = (fields: GenericFields, field: string) => {
  return fields[field]?.componentIri;
};

const convertTableFieldsToSegmentField = ({
  fields,
  dimensions,
  measures,
}: {
  fields: TableFields;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}): GenericSegmentField | undefined => {
  const groupedColumns = group(Object.values(fields), (d) => d.isGroup)
    .get(true)
    // All the other dimension types can be used as a segment field.
    ?.filter(
      (d) =>
        d.componentType !== "NumericalMeasure" &&
        d.componentType !== "TemporalDimension"
    )
    .sort((a, b) => a.index - b.index);
  const component = groupedColumns?.[0];

  if (component) {
    const { componentIri } = component;
    const actualComponent = [...dimensions, ...measures].find(
      (d) => d.iri === componentIri
    ) as DimensionMetadataFragment;
    const palette = getDefaultCategoricalPaletteName(actualComponent);

    return {
      componentIri,
      palette,
      colorMapping: mapValueIrisToColor({
        palette,
        dimensionValues: actualComponent.values,
      }),
    };
  }
};
