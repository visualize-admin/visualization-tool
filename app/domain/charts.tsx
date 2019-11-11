import { ChartType } from "./config-types";
import {
  DimensionWithMeta,
  getCategoricalDimensions,
  getComponentIri,
  getTimeDimensions,
  isTimeDimension,
  MeasureWithMeta
} from "./data";
import { DataSetMetadata } from "./data-cube";

export interface BarChartFields {
  xField: string;
  heightField: string;
  groupByField: string;
}
export interface LineChartFields {
  xField: string;
  heightField: string;
  groupByField: string;
}
export interface AreaChartFields {
  xField: string;
  heightField: string;
  groupByField: string;
}
export interface ScatterPlotFields {
  xField: string;
  yField: string;
  groupByField: string;
  labelField: string;
}

export type Fields =
  | BarChartFields
  | LineChartFields
  | AreaChartFields
  | ScatterPlotFields;

export const getInitialFilters = (dimensions: DimensionWithMeta[]) => {
  const nonTimeDimensions = dimensions.filter(
    dimension => !isTimeDimension(dimension)
  );
  return nonTimeDimensions.reduce((obj, cur, i) => {
    return cur.values.length > 0
      ? {
          ...obj,
          [cur.component.iri.value]: { [cur.values[0].value.value]: true }
        }
      : obj;
  }, {});
};

const visuals = { palette: "category10" };
export const getInitialState = ({
  chartType,
  dimensions,
  measures
}: {
  chartType: ChartType;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}): {} => {
  // FIXME: Should the returned type match the Keys defined above?
  const nonTimeDimensions = dimensions.filter(
    dimension => !isTimeDimension(dimension)
  );
  switch (chartType) {
    case "scatterplot":
      return {
        x: getComponentIri(measures[0]),
        y: getComponentIri(measures.length > 1 ? measures[1] : measures[0]),
        color: getComponentIri(getCategoricalDimensions(dimensions)[0]),
        label: getComponentIri(getCategoricalDimensions(dimensions)[0]),
        ...visuals
      };
    case "column":
      return {
        x: getComponentIri(nonTimeDimensions[0]),
        height: getComponentIri(measures[0]),
        color: getComponentIri(getCategoricalDimensions(dimensions)[0]),
        ...visuals
      };
    case "line":
      return {
        x: getComponentIri(getTimeDimensions(dimensions)[0]),
        height: getComponentIri(measures[0]),
        color: getComponentIri(getCategoricalDimensions(dimensions)[1]),
        ...visuals
      };
    case "area":
      return {
        x: getComponentIri(getTimeDimensions(dimensions)[0]),
        height: getComponentIri(measures[0]),
        color: getComponentIri(getCategoricalDimensions(dimensions)[1]),
        ...visuals
      };
    default:
      return {
        x: getComponentIri(nonTimeDimensions[0]),
        height: getComponentIri(measures[0]),
        color: getComponentIri(getCategoricalDimensions(dimensions)[0]),
        ...visuals
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
