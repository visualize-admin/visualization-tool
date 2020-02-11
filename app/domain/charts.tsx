import { DataCubeMetadata } from "../graphql/types";
import { unreachableError } from "../lib/unreachable";
import { ChartConfig, ChartType, GenericFields } from "./config-types";
import {
  getCategoricalDimensions,
  getTimeDimensions,
  isTimeDimension
} from "./data";
import { DataSetMetadata } from "./data-cube";

export const getInitialConfig = ({
  chartType,
  dimensions,
  measures
}: {
  chartType: ChartType;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}): ChartConfig => {
  switch (chartType) {
    case "scatterplot":
      return {
        chartType: "scatterplot",
        filters: {},
        fields: {
          x: { componentIri: measures[0].iri },
          y: {
            componentIri:
              measures.length > 1 ? measures[1].iri : measures[0].iri
          },
          segment: {
            componentIri: getCategoricalDimensions(dimensions)[0].iri,
            palette: "category10"
          }
        }
      };
    case "bar":
    case "column":
      return {
        chartType,
        filters: {},
        fields: {
          x: { componentIri: dimensions[0].iri },
          y: { componentIri: measures[0].iri }
        }
      };
    case "line":
      return {
        chartType,
        filters: {},
        fields: {
          x: {
            componentIri: getTimeDimensions(dimensions)[0].iri
          },
          y: { componentIri: measures[0].iri }
        }
      };

    case "area":
      return {
        chartType,
        filters: {},
        fields: {
          x: {
            componentIri: getTimeDimensions(dimensions)[0].iri
          },
          y: { componentIri: measures[0].iri }
        }
      };

    case "pie":
      return {
        chartType,
        filters: {},
        fields: {
          value: { componentIri: measures[0].iri },
          segment: {
            componentIri: getCategoricalDimensions(dimensions)[0].iri,
            palette: "category10"
          }
        }
      };

    // This code *should* be unreachable! If it's not, it means we haven't checked all cases (and we should get a TS error).
    default:
      throw unreachableError(chartType);
  }
};

export const getPossibleChartType = ({
  chartTypes,
  meta
}: {
  chartTypes: ChartType[];
  meta: DataSetMetadata;
}): ChartType[] | null => {
  const { measures, dimensions } = meta;

  const hasMultipleQ = measures.length > 1;
  const hasTime = dimensions.some(dim => isTimeDimension(dim));

  const catBased: ChartType[] = ["column", "pie"];
  const multipleQ: ChartType[] = ["scatterplot"];
  const timeBased: ChartType[] = ["line", "area"];

  let possibles: ChartType[] | null = [];

  if (hasMultipleQ && hasTime) {
    possibles = [...multipleQ, ...timeBased, ...catBased];
  } else if (hasMultipleQ && !hasTime) {
    possibles = [...multipleQ, ...catBased];
  } else if (!hasMultipleQ && !hasTime) {
    possibles = [...catBased];
  } else {
    possibles = null;
  }
  return possibles;
};

export const getFieldComponentIris = (fields: GenericFields) => {
  return new Set(
    Object.values(fields).flatMap(f => (f ? [f.componentIri] : []))
  );
};

export const getFieldComponentIri = (fields: GenericFields, field: string) => {
  return fields[field]?.componentIri;
};
