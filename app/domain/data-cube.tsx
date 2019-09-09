import { DataCube } from "@zazuko/query-rdf-data-cube";
import {
  Attribute,
  Dimension,
  Measure
} from "@zazuko/query-rdf-data-cube/dist/node/components";
import DataSet from "@zazuko/query-rdf-data-cube/dist/node/dataset";
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
    return new DataCube(endpoint);
  }, [endpoint]);
};

export const useDataSets = () => {
  const cube = useDataCube();
  const fetchCb = useCallback(() => cube.datasets(), [cube]);
  return useRemoteData(fetchCb);
};

interface Metadata {
  dimensions: Dimension[];
  attributes: Attribute[];
  measures: Measure[];
}
export const useDataSetMetadata = (dataSet: DataSet) => {
  const fetchMeta = useCallback(async () => {
    return {
      dimensions: await dataSet.dimensions(),
      attributes: await dataSet.attributes(),
      measures: await dataSet.measures()
    };
  }, [dataSet]);

  return useRemoteData(fetchMeta);
};
