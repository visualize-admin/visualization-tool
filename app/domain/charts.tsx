import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import {
  getDimensionLabelFromIri,
  getMeasureLabelFromIri,
  isTimeDimension,
  getDimensionIri,
  getCategoricalDimensions,
  getTimeDimensions
} from "./data-cube";
import { ChartType } from "./config-types";

export type BarChartFieldKey = "xField" | "heightField" | "groupByField";
export type LineChartFieldKey = "xField" | "heightField" | "groupByField";
export type AreaChartFieldKey = "xField" | "heightField" | "groupByField";
export type ScatterplotFieldKey =
  | "xField"
  | "yField"
  | "groupByField"
  | "labelField";
export type Fields<K> = Map<K, string>;

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

export const getInitialState = ({
  chartType,
  dimensions,
  measures
}: {
  chartType: ChartType;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
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
        palette: "category10"
      };
    case "column":
      return {
        x: getDimensionIri(nonTimeDImensions[0]),
        height: getDimensionIri(measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[0]),
        palette: "category10"
      };
    case "line":
      return {
        x: getDimensionIri(getTimeDimensions(dimensions)[0]),
        height: getDimensionIri(measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[1]),
        palette: "category10"
      };
    case "area":
      return {
        x: getDimensionIri(getTimeDimensions(dimensions)[0]),
        height: getDimensionIri(measures[0]),
        color: getDimensionIri(getCategoricalDimensions(dimensions)[1]),
        palette: "category10"
      };
    default:
      return null;
  }
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
  fields: Fields<BarChartFieldKey>;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("xField")!,
        dimensions
      })]: d.xField.label.value,
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("groupByField")!,
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
  fields: Fields<LineChartFieldKey>;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("xField")!,
        dimensions
      })]: new Date(d.xField.value.value, 1, 1),
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("groupByField")!,
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
  fields: Fields<AreaChartFieldKey>;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("xField")!,
        dimensions
      })]: new Date(d.xField.value.value, 1, 1),
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("groupByField")!,
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
  fields: Fields<ScatterplotFieldKey>;
}) => {
  return observations.map((d: any) => {
    return {
      [getMeasureLabelFromIri({
        measureIri: fields.get("xField")!,
        measures
      })]: +d.xField.value.value,
      [getMeasureLabelFromIri({
        measureIri: fields.get("yField")!,
        measures
      })]: +d.yField.value.value,
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("groupByField")!,
        dimensions
      })]: d.groupByField.label.value,
      [getDimensionLabelFromIri({
        dimensionIri: fields.get("labelField")!,
        dimensions
      })]: d.labelField.value.value
    };
  });
};
