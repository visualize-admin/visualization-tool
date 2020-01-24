import { GenericFields, ChartType, ChartConfig } from "./config-types";
import {
  DimensionWithMeta,
  getCategoricalDimensions,
  getComponentIri,
  isTimeDimension,
  MeasureWithMeta,
  getTimeDimensions
} from "./data";
import { DataSetMetadata } from "./data-cube";

const unreachableError = (x: never): Error => {
  return new Error(`This should be unreachable! but got ${x}`);
};

export const getInitialConfig = ({
  chartType,
  dimensions,
  measures
}: {
  chartType: ChartType;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}): ChartConfig => {
  switch (chartType) {
    case "scatterplot":
      return {
        chartType: "scatterplot",
        filters: {},
        fields: {
          x: { componentIri: getComponentIri(measures[0]) },
          y: {
            componentIri: getComponentIri(
              measures.length > 1 ? measures[1] : measures[0]
            )
          },
          segment: {
            componentIri: getComponentIri(
              getCategoricalDimensions(dimensions)[0]
            ),
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
          x: { componentIri: getComponentIri(dimensions[0]) },
          y: { componentIri: getComponentIri(measures[0]) }
        }
      };
    case "line":
      return {
        chartType,
        filters: {},
        fields: {
          x: {
            componentIri: getComponentIri(getTimeDimensions(dimensions)[0])
          },
          y: { componentIri: getComponentIri(measures[0]) }
        }
      };

    case "area":
      return {
        chartType,
        filters: {},
        fields: {
          x: {
            componentIri: getComponentIri(getTimeDimensions(dimensions)[0])
          },
          y: { componentIri: getComponentIri(measures[0]) }
        }
      };

    case "pie":
      return {
        chartType,
        filters: {},
        fields: {
          value: { componentIri: getComponentIri(measures[0]) },
          segment: {
            componentIri: getComponentIri(
              getCategoricalDimensions(dimensions)[0]
            ),
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
