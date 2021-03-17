import {
  ChartConfig,
  ChartType,
  GenericFields,
  TableColumn,
} from "../configurator";
import { getCategoricalDimensions, getTimeDimensions } from "../domain/data";
import { mapColorsToComponentValuesIris } from "../configurator/components/ui-helpers";
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
];

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
        interactiveFiltersConfig: {
          legend: { active: false, componentIri: "" },
          time: {
            active: false,
            componentIri: "",
            presets: { type: "range", from: "", to: "" },
          },
          dataFilters: {
            active: false,
            componentIris: [],
          },
        },
        fields: {
          x: { componentIri: measures[0].iri },
          y: {
            componentIri: dimensions[0].iri,
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
        },
      };
    case "column":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: {
          legend: { active: false, componentIri: "" },
          time: {
            active: false,
            componentIri: "",
            presets: { type: "range", from: "", to: "" },
          },
          dataFilters: {
            active: false,
            componentIris: [],
          },
        },
        fields: {
          x: {
            componentIri: dimensions[0].iri,
            sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
          },
          y: { componentIri: measures[0].iri },
        },
      };
    case "line":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: {
          legend: { active: false, componentIri: "" },
          time: {
            active: false,
            componentIri: "",
            presets: { type: "range", from: "", to: "" },
          },
          dataFilters: {
            active: false,
            componentIris: [],
          },
        },
        fields: {
          x: {
            componentIri: getTimeDimensions(dimensions)[0].iri,
          },
          y: { componentIri: measures[0].iri },
        },
      };

    case "area":
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: {
          legend: { active: false, componentIri: "" },
          time: {
            active: false,
            componentIri: "",
            presets: { type: "range", from: "", to: "" },
          },
          dataFilters: {
            active: false,
            componentIris: [],
          },
        },
        fields: {
          x: {
            componentIri: getTimeDimensions(dimensions)[0].iri,
          },
          y: { componentIri: measures[0].iri },
        },
      };
    case "scatterplot":
      return {
        chartType: "scatterplot",
        filters: {},
        interactiveFiltersConfig: {
          legend: { active: false, componentIri: "" },
          time: {
            active: false,
            componentIri: "",
            presets: { type: "range", from: "", to: "" },
          },
          dataFilters: {
            active: false,
            componentIris: [],
          },
        },
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
        interactiveFiltersConfig: {
          legend: { active: false, componentIri: "" },
          time: {
            active: false,
            componentIri: "",
            presets: { type: "range", from: "", to: "" },
          },
          dataFilters: {
            active: false,
            componentIris: [],
          },
        },
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
              isFiltered: false,
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
      return {
        chartType,
        filters: {},
        interactiveFiltersConfig: {
          legend: { active: false, componentIri: "" },
          time: {
            active: false,
            componentIri: "",
            presets: { type: "range", from: "", to: "" },
          },
          dataFilters: {
            active: false,
            componentIris: [],
          },
        },
        fields: {
          baseLayer: {
            componentIri: dimensions[0].iri,
            relief: true,
            lakes: true,
          },
          areaLayer: {
            componentIri: measures[0].iri,
            show: false,
            label: { componentIri: dimensions[0].iri },
            palette: "oranges",
            nbSteps: 5,
            paletteType: "continuous",
          },
          symbolLayer: {
            show: false,
            componentIri: measures[0].iri,
          },
          // FIXME: unused fields
          x: { componentIri: dimensions[0].iri },
          y: {
            componentIri: measures[0].iri,
          },
          segment: {
            componentIri: dimensions[0].iri,
          },
        },
      };

    // This code *should* be unreachable! If it's not, it means we haven't checked all cases (and we should get a TS error).
    default:
      throw unreachableError(chartType);
  }
};

export const getPossibleChartType = ({
  chartTypes = enabledChartTypes,
  meta,
}: {
  chartTypes?: ChartType[];
  meta: DataCubeMetadata;
}): ChartType[] => {
  const { measures, dimensions } = meta;

  const hasZeroQ = measures.length === 0;
  const hasMultipleQ = measures.length > 1;
  const hasTime = dimensions.some(
    (dim) => dim.__typename === "TemporalDimension"
  );

  // const geoBased: ChartType[] = ["map"];
  const catBased: ChartType[] = ["bar", "column", "pie", "table"];
  const multipleQ: ChartType[] = ["scatterplot"];
  const timeBased: ChartType[] = ["line", "area"];

  let possibles: ChartType[] = [];
  if (hasZeroQ) {
    possibles = ["table"];
  } else if (hasMultipleQ && hasTime) {
    possibles = [...multipleQ, ...timeBased, ...catBased];
  } else if (hasMultipleQ && !hasTime) {
    possibles = [...multipleQ, ...catBased];
  } else if (!hasMultipleQ && hasTime) {
    possibles = [...catBased, ...timeBased];
  } else if (!hasMultipleQ && !hasTime) {
    possibles = [...catBased];
  } else {
    // Tables should always be possible
    possibles = ["table"];
  }
  return possibles;
};

export const getFieldComponentIris = (fields: GenericFields) => {
  return new Set(
    Object.values(fields).flatMap((f) => (f ? [f.componentIri] : []))
  );
};

export const getFilteredFieldIris = (fields: GenericFields) => {
  return new Set(
    Object.values(fields).flatMap((f) =>
      f && (f as $IntentionalAny).isFiltered ? [f.componentIri] : []
    )
  );
};

export const getFieldComponentIri = (fields: GenericFields, field: string) => {
  return fields[field]?.componentIri;
};
