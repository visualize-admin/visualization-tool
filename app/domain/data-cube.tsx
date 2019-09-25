import {
  Attribute,
  DataCube,
  DataCubeEntryPoint,
  Dimension,
  Measure
} from "@zazuko/query-rdf-data-cube";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo
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

export const useObservations = ({
  dataset,
  namedSelection
}: {
  dataset: DataCube;
  namedSelection: Record<string, Dimension>;
  // namedSelection: (string | Dimension)[][];
}) => {
  const fetchData = useCallback(async () => {
    const query = dataset
      .query()
      .select(namedSelection)
      .limit(10000);
    const data = await query.execute();
    return {
      results: data // await query.execute()
    };
  }, [dataset, namedSelection]);

  return useRemoteData(fetchData);
};

export const useFilteredObservations = ({
  dataset,
  namedSelection,
  filters
}: {
  dataset: DataCube;
  namedSelection: Record<string, Dimension>;
  filters: Map<Dimension, string[]>;
}) => {
  const fetchData = useCallback(async () => {
    const query = dataset
      .query()
      .select(namedSelection)
      .limit(100000);
    const data = await query.execute();
    return {
      results: data
    };
  }, [dataset, namedSelection]);

  return useRemoteData(fetchData);
};

/**
 * @fixme use metadata to filter time dimension!
 */
export const getTimeDimensions = ({
  dimensions
}: {
  dimensions: Dimension[];
}) => dimensions.filter(dim => dim.labels[0].value === "Jahr");
/**
 * @fixme use metadata to filter categorical dimension!
 */
export const getCategoricalDimensions = ({
  dimensions
}: {
  dimensions: Dimension[];
}) =>
  dimensions.filter(
    dim => dim.labels[0].value !== "Jahr" && dim.labels[0].value !== "Variable"
  );
/**
 * @fixme This is not correct, problem in the RDF vocabulary
 */
export const getMeasuresDimensions = ({
  dimensions
}: {
  dimensions: Dimension[];
}) => dimensions.filter(dim => dim.labels[0].value === "Variable");

export const getDimensionIri = ({
  dimension
}: {
  dimension: Dimension;
}): Dimension["iri"]["value"] => {
  return dimension.iri.value;
};
export const getDimensionLabel = ({
  dimension
}: {
  dimension: Dimension;
}): string => {
  return dimension.labels[0].value;
};

export const useDimensionValues = ({
  dataset,
  dimension
}: {
  dataset: DataCube;
  dimension: Dimension;
}) => {
  const fetchData = useCallback(async () => {
    return await dataset.componentValues(dimension);
  }, [dataset, dimension]);
  return useRemoteData(fetchData);
};
