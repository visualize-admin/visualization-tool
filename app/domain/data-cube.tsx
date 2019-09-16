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
import { useLocale } from "../lib/use-locale";

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

const useDataCubeEntryPoint = () => {
  const endpoint = useContext(DataCubeContext);
  const locale = useLocale();
  return useMemo(() => {
    return new DataCubeEntryPoint(endpoint, { languages: [locale] });
  }, [endpoint, locale]);
};

export const useDataSets = () => {
  const entryPoint = useDataCubeEntryPoint();
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

const formatData = ({
  data,
  selectedDimension
}: {
  data: any;
  selectedDimension: string;
}) => {
  return data.map((d: any) => ({
    selectedDimension: d.selectedDimension.label.value,
    measure: d.measure.value.value
  }));
};

export const useObservations = ({
  dataset,
  dimensions,
  selectedDimension,
  measures
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  selectedDimension: string;
  measures: Measure[];
}) => {
  const fetchData = useCallback(async () => {
    const query = dataset
      .query()
      .select({
        measure: measures[0],
        selectedDimension: dimensions.find(
          dim => dim.iri.value === selectedDimension
        )! // FIXME: make sure it exists & remove !
      })
      .limit(10000);
    const data = await query.execute();

    return {
      results: formatData({ data, selectedDimension })
    };
  }, [dataset, dimensions, selectedDimension]);

  return useRemoteData(fetchData);
};
