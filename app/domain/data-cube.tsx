import {
  DataCubeEntryPoint,
  DataCube,
  Attribute,
  Dimension,
  Measure
} from "@zazuko/query-rdf-data-cube";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from "react";
import { useRemoteData } from "../lib/remote-data";

const DataCubeContext = createContext<string>("");

export const DataCubeProvider = ({
  endpoint,
  children
}: {
  endpoint: string;
  children?: ReactNode;
}) => (
  <DataCubeContext.Provider value={endpoint}>
    {children}
  </DataCubeContext.Provider>
);

const useDataCube = () => {
  const endpoint = useContext(DataCubeContext);
  return useMemo(() => {
    return new DataCubeEntryPoint(endpoint);
  }, [endpoint]);
};

export const useDataSets = () => {
  const entryPoint = useDataCube();
  console.log({ entryPoint });
  const fetchCb = useCallback(() => entryPoint.dataCubes(), [entryPoint]);
  return useRemoteData(fetchCb);
};

interface Metadata {
  dimensions: Dimension[];
  attributes: Attribute[];
  measures: Measure[];
}
export const useDataSetMetadata = (dataSet: DataCube) => {
  const fetchMeta = useCallback(async () => {
    return {
      dimensions: await dataSet.dimensions(),
      attributes: await dataSet.attributes(),
      measures: await dataSet.measures()
    };
  }, [dataSet]);

  return useRemoteData(fetchMeta);
};

const formatData = ({ data, dimension }: { data: any; dimension: string }) => {
  return data.map((d: any) => ({
    [dimension]: d[dimension].label.value,
    measure: d.measure.value.value
  }));
};

export const useObservations = ({
  dataset,
  dimensions,
  dimension,
  measures
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  dimension: string;
  measures: Measure[];
}) => {
  const fetchData = useCallback(async () => {
    const query = dataset
      .query()
      // .select({
      //   measure: measures[0]
      //   // [dimension]: dimensions //.find(dim => dim.labels.values === dimension)! // FIXME: make sure it exists & remove !
      // })
      .limit(10000);
    const data = await query.execute();
    return {
      results: formatData({ data, dimension })
    };
  }, [dataset, dimensions, dimension]);

  return useRemoteData(fetchData);
};
