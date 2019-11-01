import {
  Attribute,
  DataCube,
  DataCubeEntryPoint,
  Dimension,
  Measure
} from "@zazuko/query-rdf-data-cube";
import { literal } from "@rdfjs/data-model";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo
} from "react";
import { useRemoteData, RDState } from "../lib/remote-data";
import { useLocale } from "../lib/use-locale";
import { Fields } from "./charts";
import { Literal, NamedNode } from "rdf-js";
import { Filters } from "./config-types";

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
      languages: [locale, "de", ""],
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

export interface DimensionWithMeta {
  component: Dimension;
  values: {
    label: Literal;
    value: NamedNode | Literal;
  }[];
}
export interface AttributeWithMeta {
  component: Attribute;
  values: {
    label: Literal;
    value: NamedNode | Literal;
  }[];
}
export interface MeasureWithMeta {
  component: Measure;
  min: Literal | null;
  max: Literal | null;
}

export type ComponentWithMeta =
  | DimensionWithMeta
  | AttributeWithMeta
  | MeasureWithMeta;

export interface DataSetMetadata {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  attributes: AttributeWithMeta[];
  measures: MeasureWithMeta[];
}

export const useDataSetAndMetadata = (
  iri: string
): RDState<DataSetMetadata> => {
  const entryPoint = useDataCubeEntryPoint();
  const fetchCb = useCallback(async () => {
    const dataSet = await entryPoint.dataCubeByIri(iri);

    const dimensions = await dataSet.dimensions();

    const dimensionsWithValues = await Promise.all(
      dimensions.map(async component => ({
        component,
        values: await dataSet.componentValues(component)
      }))
    );

    const attributes = await dataSet.attributes();

    const attributesWithValues = await Promise.all(
      attributes.map(async component => ({
        component,
        values: await dataSet.componentValues(component)
      }))
    );

    const measures = await dataSet.measures();

    const measuresWithMinMax = await Promise.all(
      measures.map(async component => ({
        component,
        ...(await dataSet.componentMinMax(component))
      }))
    );

    return {
      dataSet,
      dimensions: dimensionsWithValues,
      attributes: attributesWithValues,
      measures: measuresWithMinMax
    };
  }, [entryPoint, iri]);
  return useRemoteData(fetchCb);
};

export type Observations<T extends Fields> = Record<
  keyof T,
  Literal | NamedNode
>[];

export const useObservations = <FieldsType extends Fields>({
  dataSet,
  dimensions,
  measures,
  fields,
  filters
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: Fields;
  filters?: Filters;
}): RDState<{ results: Observations<FieldsType> }> => {
  const fetchData = useCallback(async () => {
    const componentsByIri = [...measures, ...dimensions].reduce<
      Record<string, DimensionWithMeta | MeasureWithMeta>
    >((comps, c) => {
      comps[c.component.iri.value] = c;
      return comps;
    }, {});

    const dimensionsByIri = dimensions.reduce<
      Record<string, DimensionWithMeta>
    >((comps, c) => {
      comps[c.component.iri.value] = c;
      return comps;
    }, {});

    const constructedFilters = filters
      ? Object.entries(filters).flatMap(([dimIri, values]) => {
          const selectedValues = Object.entries(values).flatMap(
            ([value, selected]) => (selected ? [value] : [])
          );

          const dimension = dimensionsByIri[dimIri];

          if (!dimension) {
            return [];
          }

          const dataType = getDataTypeFromDimensionValues(dimension);

          const toTypedValue = (value: string) => {
            return dataType ? literal(value, dataType) : value;
          };

          return selectedValues.length === 1
            ? [dimension.component.equals(toTypedValue(selectedValues[0]))]
            : selectedValues.length > 0
            ? [dimension.component.in(selectedValues.map(toTypedValue))]
            : [];
        })
      : [];

    const selectedComponents = Object.entries(fields).flatMap(([key, iri]) =>
      componentsByIri[iri] !== undefined
        ? [[key, componentsByIri[iri].component]]
        : []
    );

    const query = dataSet
      .query()
      .limit(null)
      .select(selectedComponents)
      .filter(constructedFilters);

    const data = await query.execute();
    return {
      results: data
    };
  }, [filters, dataSet, fields, measures, dimensions]);

  return useRemoteData<{ results: Observations<FieldsType> }>(fetchData);
};

export const isTimeDimension = ({ component }: DimensionWithMeta) => {
  const scaleOfMeasure = component.extraMetadata.scaleOfMeasure;

  if (scaleOfMeasure) {
    return /cube\/scale\/Temporal\/?$/.test(scaleOfMeasure.value);
  }

  // FIXME: Remove this once we're sure that scaleOfMeasure always works
  return ["Jahr", "Année", "Anno", "Year"].includes(component.labels[0].value);
};

const getDataTypeFromDimensionValues = ({
  component,
  values
}: DimensionWithMeta): NamedNode | undefined => {
  if (values[0] && values[0].value.termType === "Literal") {
    return values[0].value.datatype;
  }

  return undefined;
};

export const isCategoricalDimension = ({
  component,
  values
}: DimensionWithMeta) => {
  const scaleOfMeasure = component.extraMetadata.scaleOfMeasure;

  if (scaleOfMeasure) {
    return /cube\/scale\/Nominal\/?$/.test(scaleOfMeasure.value);
  }

  // FIXME: Don't just assume all non-time dimensions are categorical
  return !isTimeDimension({ component, values });
};

/**
 * @fixme use metadata to filter time dimension!
 */
export const getTimeDimensions = (dimensions: DimensionWithMeta[]) =>
  dimensions.filter(isTimeDimension);
/**
 * @fixme use metadata to filter categorical dimension!
 */
export const getCategoricalDimensions = (dimensions: DimensionWithMeta[]) =>
  dimensions.filter(isCategoricalDimension);

export const getComponentIri = ({ component }: ComponentWithMeta): string => {
  return component.iri.value;
};
export const getDimensionLabel = ({ component }: DimensionWithMeta): string => {
  return component.labels[0].value;
};

export const getDimensionLabelFromIri = ({
  dimensionIri,
  dimensions
}: {
  dimensionIri: string;
  dimensions: DimensionWithMeta[];
}): string => {
  const dimension = dimensions.find(
    ({ component }) => component.iri.value === dimensionIri
  );
  // FIXME: Is dimensionIri the right thing to return?
  return dimension ? getDimensionLabel(dimension) : dimensionIri;
};
export const getMeasureLabelFromIri = ({
  measureIri,
  measures
}: {
  measureIri: string;
  measures: MeasureWithMeta[];
}): string => {
  const measure = measures.find(
    ({ component }) => component.iri.value === measureIri
  );
  // FIXME: Is measureIri the right thing to return?
  return measure ? getMeasureLabel(measure) : measureIri;
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
export const getMeasureLabel = ({ component }: MeasureWithMeta): string => {
  return component.labels[0].value;
};
