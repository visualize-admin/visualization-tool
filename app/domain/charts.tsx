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
}): ChartType[] => {
  const { measures, dimensions } = meta;

  const scatterplotFilter = (ct: ChartType) => ct !== "scatterplot";
  const lineFilter = (ct: ChartType) => ct !== "line";
  const areaFilter = (ct: ChartType) => ct !== "area";

  if (measures.length <= 1 && dimensions.some(dim => !isTimeDimension(dim))) {
    return chartTypes
      .filter(scatterplotFilter)
      .filter(lineFilter)
      .filter(areaFilter);
  } else if (measures.length <= 1) {
    return chartTypes.filter(scatterplotFilter);
  } else if (dimensions.some(dim => !isTimeDimension(dim))) {
    chartTypes.filter(lineFilter).filter(areaFilter);
  } else {
    return chartTypes;
  }
  return chartTypes;
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
