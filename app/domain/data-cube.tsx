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
import { useRemoteData, RDState } from "../lib/remote-data";
import { useLocale } from "../lib/use-locale";

const DataCubeContext = createContext<string>("");

export const DataCubeProvider = ({ children }: { children?: ReactNode }) => {
  if (!process.env.SPARQL_ENDPOINT) {
    throw Error("No SPARQL_ENDPOINT set!");
  }
  return (
    <DataCubeContext.Provider value={process.env.SPARQL_ENDPOINT}>
      {children}
    </DataCubeContext.Provider>
  );
};

const useDataCubeEntryPoint = () => {
  const endpoint = useContext(DataCubeContext);
  const locale = useLocale();
  return useMemo(() => {
    return new DataCubeEntryPoint(endpoint, {
      languages: [locale, "de"],
      extraMetadata: [
        {
          variable: "contact",
          iri: "https://pcaxis.described.at/contact",
          multilang: true
        },
        {
          variable: "source",
          iri: "https://pcaxis.described.at/source",
          multilang: true
        },
        {
          variable: "survey",
          iri: "https://pcaxis.described.at/survey",
          multilang: true
        },
        {
          variable: "database",
          iri: "https://pcaxis.described.at/database",
          multilang: true
        },
        {
          variable: "unit",
          iri: "https://pcaxis.described.at/unit",
          multilang: true
        },
        {
          variable: "note",
          iri: "https://pcaxis.described.at/note",
          multilang: true
        },
        {
          variable: "dateCreated",
          iri: "http://schema.org/dateCreated",
          multilang: false
        },
        { variable: "dateModified", iri: "http://schema.org/dateModified" },
        {
          variable: "description",
          iri: "http://www.w3.org/2000/01/rdf-schema#comment",
          multilang: true
        }
      ]
    });
  }, [endpoint, locale]);
};

export const useDataSets = () => {
  const entryPoint = useDataCubeEntryPoint();
  const fetchCb = useCallback(() => entryPoint.dataCubes(), [entryPoint]);
  return useRemoteData(fetchCb);
};

export interface DataSetMetadata {
  dataSet: DataCube;
  dimensions: Dimension[];
  attributes: Attribute[];
  measures: Measure[];
}

export const useDataSetAndMetadata = (
  iri: string
): RDState<DataSetMetadata> => {
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
  fields,
  filters
}: {
  dataSet: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
  fields: any;
  filters?: Record<string, Record<string, boolean>>;
}) => {
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

    let query = dataSet.query().limit(100000);

    for (const [key, value] of fields) {
      query = query.select({
        [key]: [...measures, ...dimensions].find(m => m.iri.value === value)!
      });
    }

    for (const f of constructedFilters) {
      query = query.filter(f);
    }

    const data = await query.execute();
    return {
      results: data
    };
  }, [filters, dataSet, fields, measures, dimensions]);

  return useRemoteData(fetchData);
};

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

export const isTimeDimension = (dimension: Dimension) => {
  const scaleOfMeasure = dimension.extraMetadata.scaleOfMeasure;

  if (scaleOfMeasure) {
    return /cube\/scale\/Temporal\/?$/.test(scaleOfMeasure.value);
  }

  // FIXME: Remove this once we're sure that scaleOfMeasure always works
  return ["Jahr", "Année", "Anno", "Year"].includes(dimension.labels[0].value);
};

export const isCategoricalDimension = (dimension: Dimension) => {
  const scaleOfMeasure = dimension.extraMetadata.scaleOfMeasure;

  if (scaleOfMeasure) {
    return /cube\/scale\/Nominal\/?$/.test(scaleOfMeasure.value);
  }

  // FIXME: Don't just assume all non-time dimensions are categorical
  return !isTimeDimension(dimension);
};

/**
 * @fixme use metadata to filter time dimension!
 */
export const getTimeDimensions = (dimensions: Dimension[]) =>
  dimensions.filter(isTimeDimension);
/**
 * @fixme use metadata to filter categorical dimension!
 */
export const getCategoricalDimensions = (dimensions: Dimension[]) =>
  dimensions.filter(isCategoricalDimension);

export const getDimensionIri = (
  dimension: Dimension
): Dimension["iri"]["value"] => {
  return dimension.iri.value;
};
export const getDimensionLabel = (dimension: Dimension): string => {
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
  return dimension ? getDimensionLabel(dimension) : dimensionIri;
};
export const getMeasureLabelFromIri = ({
  measureIri,
  measures
}: {
  measureIri: string;
  measures: Measure[];
}): string => {
  const measure = measures.find(m => m.iri.value === measureIri);
  // FIXME: Is measureIri the right thing to return?
  return measure ? getMeasureLabel({ measure }) : measureIri;
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
export const useDimensionMinMax = ({
  dataSet,
  measure
}: {
  dataSet: DataCube;
  measure: Measure;
}) => {
  const fetchData = useCallback(async () => {
    return await dataSet.componentMinMax(measure);
  }, [dataSet, measure]);
  return useRemoteData(fetchData);
};

// Measure
export const getMeasureLabel = ({ measure }: { measure: Measure }): string => {
  return measure.labels[0].value;
};
