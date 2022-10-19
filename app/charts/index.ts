import { ascending, group } from "d3";
import produce from "immer";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";

import { DEFAULT_SYMBOL_LAYER_COLORS } from "@/charts/map/constants";
import {
  AreaSegmentField,
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
  PieSegmentField,
  ScatterPlotSegmentField,
  SortingOrder,
  SortingType,
  TableColumn,
  TableFields,
} from "@/configurator/config-types";
import { DEFAULT_PALETTE } from "@/configurator/configurator-state";
import { HierarchyValue } from "@/graphql/resolver-types";
import { visitHierarchy } from "@/rdf/tree-utils";
import { CHART_CONFIG_VERSION } from "@/utils/chart-config/versioning";

import { mapValueIrisToColor } from "../configurator/components/ui-helpers";
import {
  getCategoricalDimensions,
  getGeoDimensions,
  getTimeDimensions,
  isGeoCoordinatesDimension,
  isGeoShapesDimension,
  isNumericalMeasure,
} from "../domain/data";
import { DimensionMetadataFragment } from "../graphql/query-hooks";
import { DataCubeMetadata } from "../graphql/types";
import { unreachableError } from "../utils/unreachable";

import {
  AREA_SEGMENT_SORTING,
  COLUMN_SEGMENT_SORTING,
  PIE_SEGMENT_SORTING,
} from "./chart-config-ui-options";

export const enabledChartTypes: ChartType[] = [
  // "bar",
  "column",
  "line",
  "area",
  "scatterplot",
  "pie",
  "table",
  "map",
];

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

const INITIAL_INTERACTIVE_FILTERS_CONFIG: InteractiveFiltersConfig = {
  legend: {
    active: false,
    componentIri: "",
  },
  time: {
    active: false,
    componentIri: "",
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
};

type SortingOption = {
  sortingType: SortingType;
  sortingOrder: SortingOrder;
};

const DEFAULT_SORTING: SortingOption = {
  sortingType: "byDimensionLabel",
  sortingOrder: "asc",
};

const findBottommostLayers = (dimension: DataCubeMetadata["dimensions"][0]) => {
  const leaves = [] as HierarchyValue[];
  visitHierarchy(dimension?.hierarchy as HierarchyValue[], (node) => {
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

export const getInitialConfig = ({
  chartType,
  dimensions,
  measures,
}: {
  chartType: ChartType;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}): ChartConfig => {
  const numericalMeasures = measures.filter(isNumericalMeasure);

  switch (chartType) {
    case "bar":
      return {
        version: CHART_CONFIG_VERSION,
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: { componentIri: measures[0].iri },
          y: {
            componentIri: findPreferredDimension(
              dimensions,
              "TemporalDimension"
            ).iri,
            sorting: DEFAULT_SORTING,
          },
        },
      };
    case "column":
      return {
        version: CHART_CONFIG_VERSION,
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: {
            componentIri: findPreferredDimension(
              sortBy(dimensions, (x) =>
                isGeoCoordinatesDimension(x) || isGeoShapesDimension(x) ? 1 : -1
              ),
              "TemporalDimension"
            ).iri,
            sorting: DEFAULT_SORTING,
          },
          y: { componentIri: numericalMeasures[0].iri },
        },
      };
    case "line":
      return {
        version: CHART_CONFIG_VERSION,
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: { componentIri: getTimeDimensions(dimensions)[0].iri },
          y: { componentIri: numericalMeasures[0].iri },
        },
      };
    case "area":
      return {
        version: CHART_CONFIG_VERSION,
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: { componentIri: getTimeDimensions(dimensions)[0].iri },
          y: { componentIri: numericalMeasures[0].iri, imputationType: "none" },
        },
      };
    case "scatterplot":
      const scatterplotSegmentComponent =
        getCategoricalDimensions(dimensions)[0] ||
        getGeoDimensions(dimensions)[0];

      return {
        version: CHART_CONFIG_VERSION,
        chartType: "scatterplot",
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
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
                palette: DEFAULT_PALETTE,
                colorMapping: mapValueIrisToColor({
                  palette: DEFAULT_PALETTE,
                  dimensionValues: scatterplotSegmentComponent.values,
                }),
              }
            : {}),
        },
      };
    case "pie":
      const pieSegmentComponent =
        getCategoricalDimensions(dimensions)[0] ||
        getGeoDimensions(dimensions)[0];

      return {
        version: CHART_CONFIG_VERSION,
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          y: { componentIri: numericalMeasures[0].iri },
          segment: {
            componentIri: pieSegmentComponent.iri,
            palette: DEFAULT_PALETTE,
            sorting: { sortingType: "byMeasure", sortingOrder: "asc" },
            colorMapping: mapValueIrisToColor({
              palette: DEFAULT_PALETTE,
              dimensionValues: pieSegmentComponent.values,
            }),
          },
        },
      };
    case "table":
      const allDimensionsSorted = [...dimensions, ...measures].sort((a, b) =>
        ascending(a.order ?? Infinity, b.order ?? Infinity)
      );

      return {
        version: CHART_CONFIG_VERSION,
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
    case "map":
      const {
        GeoShapesDimension: geoShapes = [],
        GeoCoordinatesDimension: geoCoordinates = [],
      } = groupBy(getGeoDimensions(dimensions), (d) => d.__typename);

      const areaDimension = geoShapes[0];
      return {
        version: CHART_CONFIG_VERSION,
        chartType,
        filters: makeInitialFiltersForArea(areaDimension),
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          areaLayer: {
            show: geoShapes.length > 0,
            componentIri: geoShapes[0]?.iri || "",
            measureIri: numericalMeasures[0].iri,
            colorScaleType: "continuous",
            colorScaleInterpolationType: "linear",
            palette: "oranges",
            nbClass: 5,
          },
          symbolLayer: {
            show: geoShapes.length === 0,
            componentIri: geoCoordinates[0]?.iri || geoShapes[0]?.iri || "",
            measureIri: numericalMeasures[0].iri,
            colors: DEFAULT_SYMBOL_LAYER_COLORS,
          },
        },
        baseLayer: {
          show: true,
          locked: false,
          bbox: undefined,
        },
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
  const newChartConfig = getAdjustedChartConfig({
    path: "",
    field: chartConfig,
    adjusters: chartConfigsAdjusters[newChartType],
    pathOverrides: chartConfigsPathOverrides[newChartType][oldChartType],
    oldChartConfig: chartConfig,
    newChartConfig: initialConfig,
    dimensions,
    measures,
  });

  return newChartConfig;
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
    } else {
      switch (path) {
        case "fields":
          return (
            oldChartConfig.chartType === "table" &&
            isSegmentInConfig(newChartConfig)
          );
        case "filters":
        case "fields.segment":
        case "interactiveFiltersConfig.legend":
          return true;
        default:
          return false;
      }
    }
  };

  const go = ({ path, field }: { path: string; field: Object }) => {
    for (const [k, v] of Object.entries(field)) {
      const newPath = path !== "" ? `${path}.${k}` : k;

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
  time: {
    active: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.time.active = oldValue;
        }
      });
    },
    componentIri: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.time.componentIri = oldValue;
        }
      });
    },
    presets: {
      type: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          if (draft.interactiveFiltersConfig) {
            draft.interactiveFiltersConfig.time.presets.type = oldValue;
          }
        });
      },
      from: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          if (draft.interactiveFiltersConfig) {
            draft.interactiveFiltersConfig.time.presets.from = oldValue;
          }
        });
      },
      to: ({ oldValue, newChartConfig }) => {
        return produce(newChartConfig, (draft) => {
          if (draft.interactiveFiltersConfig) {
            draft.interactiveFiltersConfig.time.presets.to = oldValue;
          }
        });
      },
    },
  },
  dataFilters: {
    active: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.dataFilters.active = oldValue;
        }
      });
    },
    componentIris: ({ oldValue, newChartConfig }) => {
      return produce(newChartConfig, (draft) => {
        if (draft.interactiveFiltersConfig) {
          draft.interactiveFiltersConfig.dataFilters.componentIris = oldValue;
        }
      });
    },
  },
};

const chartConfigsAdjusters: ChartConfigsAdjusters = {
  bar: {},
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
      segment: ({ oldValue, oldChartConfig, newChartConfig, dimensions }) => {
        let newSegment: ColumnSegmentField | undefined;

        // When switching from a table chart, a whole fields object is passed as oldValue.
        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
          });

          if (tableSegment) {
            newSegment = {
              ...tableSegment,
              sorting: DEFAULT_SORTING,
              type: "stacked",
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
            type: "stacked",
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
            (d) => d.__typename === "TemporalDimension" && d.iri === oldValue
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
      segment: ({ oldValue, oldChartConfig, newChartConfig, dimensions }) => {
        let newSegment: LineSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
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
            (d) => d.__typename === "TemporalDimension" && d.iri === oldValue
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
      segment: ({ oldValue, oldChartConfig, newChartConfig, dimensions }) => {
        let newSegment: AreaSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
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
      segment: ({ oldValue, oldChartConfig, newChartConfig, dimensions }) => {
        let newSegment: ScatterPlotSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
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
      segment: ({ oldValue, oldChartConfig, newChartConfig, dimensions }) => {
        let newSegment: PieSegmentField | undefined;

        if (oldChartConfig.chartType === "table") {
          const tableSegment = convertTableFieldsToSegmentField({
            fields: oldValue as TableFields,
            dimensions,
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
              draft.fields.areaLayer.componentIri = oldValue;
            });
          }

          return newChartConfig;
        },
        measureIri: ({ oldValue, newChartConfig }) => {
          return produce(newChartConfig, (draft) => {
            draft.fields.areaLayer.measureIri = oldValue;
            draft.fields.symbolLayer.measureIri = oldValue;
          });
        },
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
  bar: {},
  column: {
    map: {
      "fields.areaLayer.componentIri": "fields.x.componentIri",
      "fields.areaLayer.measureIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  line: {
    map: {
      "fields.areaLayer.measureIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  area: {
    map: {
      "fields.areaLayer.measureIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  scatterplot: {
    map: {
      "fields.areaLayer.measureIri": "fields.y.componentIri",
    },
    table: {
      fields: "fields.segment",
    },
  },
  pie: {
    map: {
      "fields.areaLayer.componentIri": "fields.x.componentIri",
      "fields.areaLayer.measureIri": "fields.y.componentIri",
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
      "fields.y.componentIri": "fields.areaLayer.measureIri",
    },
    line: {
      "fields.y.componentIri": "fields.areaLayer.measureIri",
    },
    area: {
      "fields.y.componentIri": "fields.areaLayer.measureIri",
    },
    scatterplot: {
      "fields.y.componentIri": "fields.areaLayer.measureIri",
    },
    pie: {
      "fields.x.componentIri": "fields.areaLayer.componentIri",
      "fields.y.componentIri": "fields.areaLayer.measureIri",
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
  meta,
}: {
  meta: DataCubeMetadata;
}): ChartType[] => {
  const { measures, dimensions } = meta;

  const numericalMeasures = measures.filter(isNumericalMeasure);
  const categoricalDimensions = getCategoricalDimensions(dimensions);
  const geoDimensions = getGeoDimensions(dimensions);
  const timeDimensions = getTimeDimensions(dimensions);

  const categoricalEnabled: ChartType[] = ["column", "pie"];
  const geoEnabled: ChartType[] = ["column", "map", "pie"];
  const multipleNumericalMeasuresEnabled: ChartType[] = ["scatterplot"];
  const timeEnabled: ChartType[] = ["area", "column", "line"];

  let possibles: ChartType[] = ["table"];
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

    if (timeDimensions.length > 0) {
      possibles.push(...timeEnabled);
    }
  }

  return enabledChartTypes.filter((type) => possibles.includes(type));
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
}: {
  fields: TableFields;
  dimensions: DataCubeMetadata["dimensions"];
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

    return {
      componentIri,
      palette: DEFAULT_PALETTE,
      colorMapping: mapValueIrisToColor({
        palette: DEFAULT_PALETTE,
        dimensionValues: (
          dimensions.find(
            (d) => d.iri === componentIri
          ) as DimensionMetadataFragment
        )?.values,
      }),
    };
  }
};
