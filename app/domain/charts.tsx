import { Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import { getDimensionLabelFromIri } from "./data-cube";

/**
 * FIXME: These functions are not reliable, time value ("Jahr") and measure
 * are nested in dim.VALUE.value,
 * whereas categorical value is under dim.LABEL.value.
 */

export const formatDataForBarChart = ({
  observations,
  dimensions,
  measures,
  xField,
  groupByField,
  heightField
}: {
  observations: any;
  dimensions: Dimension[];
  measures: Measure[];
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({ dimensionIri: xField, dimensions })]: d.xField
        .label.value,
      [getDimensionLabelFromIri({ dimensionIri: groupByField, dimensions })]: d
        .groupByField.label.value,
      measure: +d.measure.value.value
    };
  });
};

export const formatDataForLineChart = ({
  observations,
  dimensions,
  measures,

  xField,
  groupByField,
  heightField
}: {
  observations: any;
  dimensions: Dimension[];
  measures: Measure[];

  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: xField,
        dimensions
      })]: new Date(d.xField.value.value, 1, 1),
      [getDimensionLabelFromIri({ dimensionIri: groupByField, dimensions })]: d
        .groupByField.label.value,
      measure: +d.measure.value.value
    };
  });
};

export const formatDataForAreaChart = ({
  observations,
  dimensions,
  measures,

  xField,
  groupByField,
  heightField
}: {
  observations: any;
  dimensions: Dimension[];
  measures: Measure[];

  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  return observations.map((d: any) => {
    return {
      [getDimensionLabelFromIri({
        dimensionIri: xField,
        dimensions
      })]: new Date(d.xField.value.value, 1, 1),
      [getDimensionLabelFromIri({ dimensionIri: groupByField, dimensions })]: d
        .groupByField.label.value,
      measure: +d.measure.value.value
    };
  });
};
