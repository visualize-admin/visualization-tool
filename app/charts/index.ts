import {
  ChartConfig,
  ChartType,
  GenericFields,
  TableColumn,
} from "../configurator";
import { mapColorsToComponentValuesIris } from "../configurator/components/ui-helpers";
import { getCategoricalDimensions, getTimeDimensions } from "../domain/data";
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
          y: { componentIri: measures[0].iri, imputationType: "none" },
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
          areaLayer: {
            componentIri: measures[0].iri,
            show: false,
            label: { componentIri: dimensions[0].iri },
            palette: "oranges",
            nbClass: 5,
            paletteType: "continuous",
          },
          symbolLayer: {
            show: false,
            componentIri: "",
          },
        },
        settings: {
          showRelief: true,
          showLakes: true,
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
  const hasGeo = dimensions.some((dim) => dim.__typename === "GeoDimension");
  const hasTime = dimensions.some(
    (dim) => dim.__typename === "TemporalDimension"
  );

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
