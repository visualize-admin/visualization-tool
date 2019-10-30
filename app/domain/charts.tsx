import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import {
  getDimensionLabelFromIri,
  getMeasureLabelFromIri,
  isTimeDimension,
  getDimensionIri,
  getCategoricalDimensions,
  getTimeDimensions,
  DataSetMetadata
} from "./data-cube";
import { ChartType } from "./config-types";

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

export const getInitialFilters = (dimensions: Dimension[]) => {
  const nonTimeDimensions = dimensions.filter(
    dimension => !isTimeDimension(dimension)
  );
  return nonTimeDimensions.reduce(
    (obj, cur, i) => ({
      ...obj,
      [cur.iri.value]: { [`${cur.iri.value}/0`]: true }
    }),
    {}
  );
};

const visuals = { palette: "category10" };
export const getInitialState = ({
  chartType,
  dimensions,
  measures
}: {
  chartType: ChartType;
  dimensions: Dimension[];
  measures: Measure[];
}): {} => {
  // FIXME: Should the returned type match the Keys defined above?
  const nonTimeDImensions = dimensions.filter(
    dimension => !isTimeDimension(dimension)
  );
  switch (chartType) {
    case "scatterplot":
      return {
        x: getDimensionIri(measures[0]),
        y: getDimensionIri(measures.length > 1 ? measures[1] : measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[0]),
        label: getDimensionIri(getTimeDimensions(dimensions)[0]),
        ...visuals
      };
    case "column":
      return {
        x: getDimensionIri(nonTimeDImensions[0]),
        height: getDimensionIri(measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[0]),
        ...visuals
      };
    case "line":
      return {
        x: getDimensionIri(getTimeDimensions(dimensions)[0]),
        height: getDimensionIri(measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[1]),
        ...visuals
      };
    case "area":
      return {
        x: getDimensionIri(getTimeDimensions(dimensions)[0]),
        height: getDimensionIri(measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[1]),
        ...visuals
      };
    default:
      return {
        x: getDimensionIri(nonTimeDImensions[0]),
        height: getDimensionIri(measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[0]),
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

  const hasMultipleQ = measures.length >= 1;
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

export const formatDataForBarChart = ({
  observations,
  dimensions,
  measures,
  fields
}: {
  observations: any;
  dimensions: Dimension[];
  measures: Measure[];
  fields: BarChartFields;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: fields.xField,
        dimensions
      })]: d.xField.label.value,
      [getDimensionLabelFromIri({
        dimensionIri: fields.groupByField,
        dimensions
      })]: d.groupByField.label.value,
      measure: +d.heightField.value.value
    };
  });
};

export const formatDataForLineChart = ({
  observations,
  dimensions,
  measures,
  fields
}: {
  observations: any;
  dimensions: Dimension[];
  measures: Measure[];
  fields: LineChartFields;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: fields.xField,
        dimensions
      })]: new Date(d.xField.value.value, 1, 1),
      [getDimensionLabelFromIri({
        dimensionIri: fields.groupByField,
        dimensions
      })]: d.groupByField.label.value,
      measure: +d.heightField.value.value
    };
  });
};

export const formatDataForAreaChart = ({
  observations,
  dimensions,
  measures,
  fields
}: {
  observations: any;
  dimensions: Dimension[];
  measures: Measure[];
  fields: AreaChartFields;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: fields.xField,
        dimensions
      })]: new Date(d.xField.value.value, 1, 1),
      [getDimensionLabelFromIri({
        dimensionIri: fields.groupByField,
        dimensions
      })]: d.groupByField.label.value,
      measure: +d.heightField.value.value
    };
  });
};

export const formatDataForScatterplot = ({
  observations,
  dimensions,
  measures,
  fields
}: {
  observations: any;
  dimensions: Dimension[];
  measures: Measure[];
  fields: ScatterPlotFields;
}) => {
  return observations.map((d: any) => {
    return {
      [getMeasureLabelFromIri({
        measureIri: fields.xField,
        measures
      })]: +d.xField.value.value,
      [getMeasureLabelFromIri({
        measureIri: fields.yField,
        measures
      })]: +d.yField.value.value,
      [getDimensionLabelFromIri({
        dimensionIri: fields.groupByField,
        dimensions
      })]: d.groupByField.label.value,
      [getDimensionLabelFromIri({
        dimensionIri: fields.labelField,
        dimensions
      })]: d.labelField.value.value
    };
  });
};
