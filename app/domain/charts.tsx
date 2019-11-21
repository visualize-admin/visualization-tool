import { ChartFields, ChartType } from "./config-types";
import {
  DimensionWithMeta,
  getCategoricalDimensions,
  getComponentIri,
  isTimeDimension,
  MeasureWithMeta,
  getTimeDimensions
} from "./data";
import { DataSetMetadata } from "./data-cube";

export const getInitialFields = ({
  chartType,
  dimensions,
  measures
}: {
  chartType: ChartType;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}): ChartFields => {
  // FIXME: Should the returned type match the Keys defined above?
  const nonTimeDimensions = dimensions.filter(
    dimension => !isTimeDimension(dimension)
  );
  switch (chartType) {
    case "scatterplot":
      return {
        x: { componentIri: getComponentIri(measures[0])},
        y: { componentIri: getComponentIri(measures.length > 1 ? measures[1] : measures[0])},
        segment: {
          componentIri: getComponentIri(
            getCategoricalDimensions(dimensions)[0]
          ),
          palette: "category10"
        }
        // label: getComponentIri(getCategoricalDimensions(dimensions)[0]),
      };
    case "column":
      return {
        x: { componentIri: getComponentIri(dimensions[0]) },
        y: { componentIri: getComponentIri(measures[0]) },
        segment: {
          componentIri: getComponentIri(
            getCategoricalDimensions(dimensions)[0]
          ),
          type: "stacked",
          palette: "category10"
        }
      };
    case "line":
      return {
        x: { componentIri: getComponentIri(getTimeDimensions(dimensions)[0]) },
        y: { componentIri: getComponentIri(measures[0]) },
        segment: {
          componentIri: getComponentIri(
            getCategoricalDimensions(dimensions)[1]
          ),
          palette: "category10"
        }
      };

    case "area":
      return {
        x: { componentIri: getComponentIri(getTimeDimensions(dimensions)[0]) },
        y: { componentIri: getComponentIri(measures[0]) },
        segment: {
          componentIri: getComponentIri(
            getCategoricalDimensions(dimensions)[1]
          ),
          palette: "category10"
        }
      };

    default:
      return {
        x: { componentIri: getComponentIri(dimensions[0]) },
        y: { componentIri: getComponentIri(measures[0]) },
        segment: {
          componentIri: getComponentIri(
            getCategoricalDimensions(dimensions)[0]
          ),
          type: "stacked",
          palette: "category10"
        }
      };
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

  const catBased: ChartType[] = ["column"];
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
