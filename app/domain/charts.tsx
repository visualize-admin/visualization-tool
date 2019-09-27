import { Dimension } from "@zazuko/query-rdf-data-cube";
import { getDimensionLabelFromIri } from "./data-cube";

export const formatData = ({ observations }: { observations: any }) => {
  return observations.map((d: any) => {
    return Object.keys(d).reduce((obj: any, key) => {
      obj[key] = (d as any)[key].value.value;
      return obj;
    }, {});
  });
};

export const formatDataForBarChart = ({
  observations,
  xField,
  heightField
}: {
  observations: any;
  xField: Dimension;
  heightField: Dimension;
}) => {
  return observations.map((d: any) => {
    return Object.keys(d).reduce((obj: any, key) => {
      if (key === xField.labels[0].value) {
        obj[key] = (d as any)[key].label.value;
      } else if (key === "measure") {
        obj[key] = +(d as any)[key].value.value;
      }
      return obj;
    }, {});
  });
};

//TODO: replace generic names by actual labels
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
      // are nested in dim.value.value,
      // whereas categorical value is under dim.label.value.
      [getDimensionLabelFromIri({ dimensionIri: xField, dimensions })]: d.xField
        .value.value,
      [getDimensionLabelFromIri({ dimensionIri: groupByField, dimensions })]: d
        .groupByField.label.value,
      [getDimensionLabelFromIri({ dimensionIri: heightField, dimensions })]: +d
        .measure.value.value
    };
  });
};
