import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import { getDimensionLabelFromIri, getMeasureLabelFromIri } from "./data-cube";

export type BarChartFieldKey = "xField" | "heightField" | "groupByField";
export type LineChartFieldKey = "xField" | "heightField" | "groupByField";
export type AreaChartFieldKey = "xField" | "heightField" | "groupByField";
export type ScatterplotFieldKey =
  | "xField"
  | "yField"
  | "groupByField"
  | "labelField";
export type Fields<K> = Map<K, string>;

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
