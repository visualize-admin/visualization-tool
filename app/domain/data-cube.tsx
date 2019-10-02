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

export const useDataSetAndMetadata = (iri: string) => {
  const entryPoint = useDataCubeEntryPoint();
  const fetchCb = useCallback(async () => {
    const dataSet = await entryPoint.dataCubeByIri(iri);

    return {
      dataSet,
      dimensions: await dataSet.dimensions(),
      attributes: await dataSet.attributes(),
      measures: await dataSet.measures()
    };
  }, [entryPoint, iri]);
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
  dataSet,
  dimensions,
  measures,
  xField,
  heightField,
  groupByField,
  filters
}: {
  dataSet: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  xField: string;
  heightField: string;
  groupByField: string;
  filters?: Record<string, Record<string, boolean>>;
}) => {
  const xDimension = dimensions.find(dim => dim.iri.value === xField);
  const groupByDimension = dimensions.find(
    dim => dim.iri.value === groupByField
  );

  const fetchData = useCallback(async () => {
    const constructedFilters = filters
      ? Object.entries(filters).flatMap(([dim, values]) => {
          const selectedValues = Object.entries(values).flatMap(
            ([value, selected]) => (selected ? [value] : [])
          );
          return selectedValues.length === 1
            ? [new Dimension({ iri: dim }).equals(selectedValues[0])]
            : selectedValues.length > 0
            ? [new Dimension({ iri: dim }).in(selectedValues)]
            : [];
        })
      : [];

    let query = dataSet
      .query()
      .select({
        xField: xDimension!,
        measure: measures[0],
        groupByField: groupByDimension!
      })
      .limit(100000);

    for (const f of constructedFilters) {
      query = query.filter(f);
    }

    const data = await query.execute();
    return {
      results: data
    };
  }, [dataSet, groupByDimension, measures, xDimension, filters]);

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
export const getDimensionLabelFromIri = ({
  dimensionIri,
  dimensions
}: {
  dimensionIri: string;
  dimensions: Dimension[];
}): string => {
  const dimension = dimensions.find(dim => dim.iri.value === dimensionIri);
  // FIXME: Is dimensionIri the right thing to return?
  return dimension ? getDimensionLabel({ dimension }) : dimensionIri;
};

export const useDimensionValues = ({
  dataSet,
  dimension
}: {
  dataSet: DataCube;
  dimension: Dimension;
}) => {
  const fetchData = useCallback(async () => {
    return await dataSet.componentValues(dimension);
  }, [dataSet, dimension]);
  return useRemoteData(fetchData);
};
