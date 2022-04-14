import { get, groupBy } from "lodash";
import {
  AreaConfig,
  ChartConfig,
  ChartType,
  ColumnConfig,
  GenericFields,
  InteractiveFiltersConfig,
  LineConfig,
  MapConfig,
  PieConfig,
  ScatterPlotConfig,
  TableColumn,
} from "../configurator";
import { mapColorsToComponentValuesIris } from "../configurator/components/ui-helpers";
import {
  getCategoricalDimensions,
  getGeoDimensions,
  getTimeDimensions,
} from "../domain/data";
import { DimensionMetaDataFragment } from "../graphql/query-hooks";
import { DataCubeMetadata } from "../graphql/types";
import { unreachableError } from "../lib/unreachable";

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
const findPreferredDimension = (
  dimensions: DataCubeMetadata["dimensions"],
  preferredType?: DimensionMetaDataFragment["__typename"]
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

const INITIAL_INTERACTIVE_FILTERS_CONFIG = {
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
} as InteractiveFiltersConfig;

export const getInitialConfig = ({
  chartType,
  dimensions,
  measures,
}: {
  chartType: ChartType;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}): ChartConfig => {
  switch (chartType) {
    case "bar":
      return {
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
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
        },
      };
    case "column":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: {
            componentIri: findPreferredDimension(
              dimensions,
              "TemporalDimension"
            ).iri,
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
          y: { componentIri: measures[0].iri },
        },
      };
    case "line":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: { componentIri: getTimeDimensions(dimensions)[0].iri },
          y: { componentIri: measures[0].iri },
        },
      };
    case "area":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: { componentIri: getTimeDimensions(dimensions)[0].iri },
          y: { componentIri: measures[0].iri, imputationType: "none" },
        },
      };
    case "scatterplot":
      return {
        chartType: "scatterplot",
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          x: { componentIri: measures[0].iri },
          y: {
            componentIri:
              measures.length > 1 ? measures[1].iri : measures[0].iri,
          },
          segment: {
            componentIri: getCategoricalDimensions(dimensions)[0].iri,
            palette: "category10",
            colorMapping: mapColorsToComponentValuesIris({
              palette: "category10",
              component: getCategoricalDimensions(dimensions)[0],
            }),
          },
        },
      };
    case "pie":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          y: { componentIri: measures[0].iri },
          segment: {
            componentIri: getCategoricalDimensions(dimensions)[0].iri,
            palette: "category10",
            sorting: { sortingType: "byMeasure", sortingOrder: "asc" },
            colorMapping: mapColorsToComponentValuesIris({
              palette: "category10",
              component: getCategoricalDimensions(dimensions)[0],
            }),
          },
        },
      };
    case "table":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: undefined,
        settings: {
          showSearch: true,
          showAllRows: false,
        },
        sorting: [],
        fields: Object.fromEntries<TableColumn>(
          [...dimensions, ...measures].map((d, i) => [
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
        ),
      };
    case "map":
      const {
        GeoShapesDimension: geoShapes = [],
        GeoCoordinatesDimension: geoCoordinates = [],
      } = groupBy(getGeoDimensions(dimensions), (d) => d.__typename);

      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: INITIAL_INTERACTIVE_FILTERS_CONFIG,
        fields: {
          areaLayer: {
            show: geoShapes.length > 0,
            componentIri: geoShapes[0]?.iri || "",
            measureIri: measures[0].iri,
            hierarchyLevel: 1,
            colorScaleType: "continuous",
            colorScaleInterpolationType: "linear",
            palette: "oranges",
            nbClass: 5,
          },
          symbolLayer: {
            show: geoShapes.length === 0,
            componentIri: geoCoordinates[0]?.iri || geoShapes[0]?.iri || "",
            measureIri: measures[0].iri,
            hierarchyLevel: 1,
            color: "#1f77b4",
          },
        },
        baseLayer: {
          show: true,
        },
      };

    // This code *should* be unreachable! If it's not, it means we haven't checked all cases (and we should get a TS error).
    default:
      throw unreachableError(chartType);
  }
};

export const getChartConfigAdjustedToChartType = ({
  chartConfig,
  chartType,
  dimensions,
  measures,
}: {
  chartConfig: ChartConfig;
  chartType: ChartType;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}) => {
  const newChartConfig = getInitialConfig({
    chartType,
    dimensions,
    measures,
  });

  mkChartConfigAdjuster({
    chartAdjustConfig: CHART_ADJUST_CONFIGS[chartType],
    pathOverrides: PATH_OVERRIDES_CONFIG[chartType],
    oldChartConfig: chartConfig,
    newChartConfig,
    dimensions,
    measures,
  })({ path: "", field: chartConfig });

  return newChartConfig;
};

const CHART_ADJUST_CONFIGS = {
  bar: {},
  column: {
    fields: {
      x: {
        componentIri: ({
          oldValue,
          newChartConfig,
          dimensions,
        }: FieldAdjustParams<ColumnConfig>) => {
          // When switching from a scatterplot, x is a measure.
          if (dimensions.map((d) => d.iri).includes(oldValue)) {
            newChartConfig.fields.x.componentIri = oldValue;
          }
        },
      },
      y: {
        componentIri: ({
          oldValue,
          newChartConfig,
        }: FieldAdjustParams<ColumnConfig>) => {
          newChartConfig.fields.y.componentIri = oldValue;
        },
      },
    },
  },
  line: {
    fields: {
      x: {
        componentIri: ({
          oldValue,
          newChartConfig,
          dimensions,
        }: FieldAdjustParams<LineConfig>) => {
          const ok = dimensions
            .filter((d) => d.__typename === "TemporalDimension")
            .map((d) => d.iri)
            .includes(oldValue);

          if (ok) {
            newChartConfig.fields.x.componentIri = oldValue;
          }
        },
      },
      y: {
        componentIri: ({
          oldValue,
          newChartConfig,
        }: FieldAdjustParams<LineConfig>) => {
          newChartConfig.fields.y.componentIri = oldValue;
        },
      },
    },
  },
  area: {
    fields: {
      x: {
        componentIri: ({
          oldValue,
          newChartConfig,
          dimensions,
        }: FieldAdjustParams<AreaConfig>) => {
          const ok = dimensions
            .filter((d) => d.__typename === "TemporalDimension")
            .map((d) => d.iri)
            .includes(oldValue);

          if (ok) {
            newChartConfig.fields.x.componentIri = oldValue;
          }
        },
      },
      y: {
        componentIri: ({
          oldValue,
          newChartConfig,
        }: FieldAdjustParams<AreaConfig>) => {
          newChartConfig.fields.y.componentIri = oldValue;
        },
      },
    },
  },
  scatterplot: {
    fields: {
      // x is not needed, as this is the only chart type with x-axis measures.
      y: {
        componentIri: ({
          oldValue,
          newChartConfig,
          measures,
        }: FieldAdjustParams<ScatterPlotConfig>) => {
          // If there is only one measure then x & y are already filled correctly.
          if (measures.length > 1) {
            if (newChartConfig.fields.x.componentIri !== oldValue) {
              newChartConfig.fields.y.componentIri = oldValue;
            }
          }
        },
      },
    },
  },
  pie: {
    fields: {
      y: {
        componentIri: ({
          oldValue,
          newChartConfig,
        }: FieldAdjustParams<PieConfig>) => {
          newChartConfig.fields.y.componentIri = oldValue;
        },
      },
    },
  },
  table: {},
  map: {
    fields: {
      areaLayer: {
        componentIri: ({
          oldValue,
          newChartConfig,
          dimensions,
        }: FieldAdjustParams<MapConfig>) => {
          const ok = dimensions
            .filter((d) => d.__typename === "GeoShapesDimension")
            .map((d) => d.iri)
            .includes(oldValue);

          if (ok) {
            newChartConfig.fields.areaLayer.componentIri = oldValue;
          }
        },
        measureIri: ({
          oldValue,
          newChartConfig,
        }: FieldAdjustParams<MapConfig>) => {
          newChartConfig.fields.areaLayer.measureIri = oldValue;
          newChartConfig.fields.symbolLayer.measureIri = oldValue;
        },
      },
    },
  },
};

// Needed to correctly retain filters when switching to maps (and tables?).
const PATH_OVERRIDES_CONFIG: {
  [chartType in ChartType]: {
    [fieldToOverride: string]: string;
  };
} = {
  bar: {},
  column: {
    "fields.areaLayer.componentIri": "fields.x.componentIri",
    "fields.areaLayer.measureIri": "fields.y.componentIri",
  },
  line: {
    "fields.areaLayer.measureIri": "fields.y.componentIri",
  },
  area: {
    "fields.areaLayer.measureIri": "fields.y.componentIri",
  },
  scatterplot: {
    "fields.areaLayer.measureIri": "fields.y.componentIri",
  },
  pie: {
    "fields.areaLayer.componentIri": "fields.x.componentIri",
    "fields.areaLayer.measureIri": "fields.y.componentIri",
  },
  table: {},
  map: {
    "fields.x.componentIri": "fields.areaLayer.componentIri",
    "fields.y.componentIri": "fields.areaLayer.measureIri",
  },
};
type PathOverrides = typeof PATH_OVERRIDES_CONFIG[ChartType];

type FieldAdjustParams<NewChartConfigType> = {
  oldValue: string;
  oldChartConfig: ChartConfig;
  newChartConfig: NewChartConfigType;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
};
type ChartAdjustConfig = typeof CHART_ADJUST_CONFIGS[ChartType];

const mkChartConfigAdjuster = ({
  chartAdjustConfig,
  pathOverrides,
  oldChartConfig,
  newChartConfig,
  dimensions,
  measures,
}: {
  chartAdjustConfig: ChartAdjustConfig;
  pathOverrides: PathOverrides;
  oldChartConfig: ChartConfig;
  newChartConfig: ChartConfig;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}) => {
  const go = ({ path, field }: { path: string; field: Object }) => {
    for (const [k, v] of Object.entries(field)) {
      const newPath = path !== "" ? `${path}.${k}` : k;

      if (typeof v !== "object") {
        const adjustField: (params: FieldAdjustParams<ChartConfig>) => void =
          get(chartAdjustConfig, newPath) ||
          get(chartAdjustConfig, pathOverrides[newPath]);

        if (adjustField !== undefined) {
          adjustField({
            oldValue: v,
            newChartConfig,
            oldChartConfig,
            dimensions,
            measures,
          });
        }
      } else {
        go({
          path: newPath,
          field: v,
        });
      }
    }
  };

  return go;
};

export const getPossibleChartType = ({
  meta,
}: {
  meta: DataCubeMetadata;
}): ChartType[] => {
  const { measures, dimensions } = meta;

  const hasZeroQ = measures.length === 0;
  const hasMultipleQ = measures.length > 1;
  const hasGeo = getGeoDimensions(dimensions).length > 0;
  const hasTime = getTimeDimensions(dimensions).length > 0;

  const geoBased: ChartType[] = ["map"];
  const catBased: ChartType[] = ["bar", "column", "pie", "table"];
  const multipleQ: ChartType[] = ["scatterplot"];
  const timeBased: ChartType[] = ["line", "area"];

  let possibles: ChartType[] = [];
  if (hasZeroQ) {
    possibles = ["table"];
  } else {
    possibles.push(...catBased);

    if (hasMultipleQ) {
      possibles.push(...multipleQ);
    }

    if (hasTime) {
      possibles.push(...timeBased);
    }

    if (hasGeo) {
      possibles.push(...geoBased);
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
