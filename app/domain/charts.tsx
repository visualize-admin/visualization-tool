import { Dimension } from "@zazuko/query-rdf-data-cube";

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
  xField,
  groupByField,
  heightField
}: {
  observations: any;
  xField: string;
  groupByField: string;
  heightField: string;
}) => {
  console.log({ observations });
  return observations.map((d: any) => {
    return Object.keys(d).reduce((obj: any, key) => {
      if (key === groupByField) {
        obj[key] = (d as any)[key].value.value;
      } else if (key === "measure" || key === xField) {
        obj[key] = +(d as any)[key].value.value;
      }
      return obj;
    }, {});
  });
};
