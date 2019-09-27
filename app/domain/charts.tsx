import { Dimension } from "@zazuko/query-rdf-data-cube";
import { getDimensionLabelFromIri } from "./data-cube";

export const formatDataForBarChart = ({
  observations,
  dimensions,
  xField,
  groupByField,
  heightField
}: {
  observations: any;
  dimensions: Dimension[];
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  return observations.map((d: any) => {
    return {
      // FIXME: this is not robust, time value ("Jahr") and measure
      // are nested in dim.VALUE.value,
      // whereas categorical value is under dim.LABEL.value.
      [getDimensionLabelFromIri({ dimensionIri: xField, dimensions })]: d.xField
        .label.value,
      [getDimensionLabelFromIri({ dimensionIri: groupByField, dimensions })]: d
        .groupByField.label.value,
      [getDimensionLabelFromIri({ dimensionIri: heightField, dimensions })]: +d
        .measure.value.value
    };
  });
};
export const formatDataForLineChart = ({
  observations,
  dimensions,
  xField,
  groupByField,
  heightField
}: {
  observations: any;
  dimensions: Dimension[];
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  return observations.map((d: any) => {
    return {
      // FIXME: this is not robust, time value ("Jahr") and measure
      // are nested in dim.VALUE.value,
      // whereas categorical value is under dim.LABEL.value.
      [getDimensionLabelFromIri({ dimensionIri: xField, dimensions })]: d.xField
        .value.value,
      [getDimensionLabelFromIri({ dimensionIri: groupByField, dimensions })]: d
        .groupByField.label.value,
      [getDimensionLabelFromIri({ dimensionIri: heightField, dimensions })]: +d
        .measure.value.value
    };
  });
};
