import { literal } from "@rdfjs/data-model";
import {
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
import { RDState, useRemoteData } from "../lib/remote-data";
import { useLocale } from "../lib/use-locale";
import { Filters, ChartFields } from "./config-types";
import {
  AttributeWithMeta,
  DimensionWithMeta,
  getDataTypeFromDimensionValues,
  MeasureWithMeta,
  Observations,
  parseObservations,
  RawObservations
} from "./data";
import { Component } from "@zazuko/query-rdf-data-cube/dist/node/components";

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
  return useRemoteData(["datasets", entryPoint], fetchCb);
};

export interface DataSetMetadata {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  attributes: AttributeWithMeta[];
  measures: MeasureWithMeta[];
  componentLabels: Record<string, string>;
  componentsByIri: Record<
    string,
    DimensionWithMeta | AttributeWithMeta | MeasureWithMeta
  >;
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

    const componentLabels = [...dimensions, ...measures, ...attributes].reduce<
      Record<string, string>
    >((labels, component) => {
      labels[component.iri.value] = component.labels[0].value;
      return labels;
    }, {});

    const componentsByIri = [
      ...dimensionsWithValues,
      ...measuresWithMinMax,
      ...attributesWithValues
    ].reduce<
      Record<string, DimensionWithMeta | AttributeWithMeta | MeasureWithMeta>
    >((components, component) => {
      components[component.component.iri.value] = component;
      return components;
    }, {});

    return {
      dataSet,
      dimensions: dimensionsWithValues,
      attributes: attributesWithValues,
      measures: measuresWithMinMax,
      componentLabels,
      componentsByIri
    };
  }, [entryPoint, iri]);
  return useRemoteData(["datasetandmeta", entryPoint, iri], fetchCb);
};

export const useObservations = <FieldsType extends ChartFields>({
  dataSet,
  dimensions,
  measures,
  fields,
  filters
}: {
  dataSet: DataCube;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
  fields: FieldsType;
  filters?: Filters;
}): RDState<Observations<FieldsType>> => {
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
      ? Object.entries(filters).flatMap(([dimIri, filter]) => {
          const selectedValues =
            filter.type === "single"
              ? [filter.value]
              : filter.type === "multi"
              ? Object.entries(filter.values).flatMap(([value, selected]) =>
                  selected ? [value] : []
                )
              : [];

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
    // TODO: Maybe explicitly specify all dimension fields? Currently not necessary because they're selected anyway.
    const selectedComponents = Object.entries<{ componentIri: string }>(
      fields
    ).flatMap(([key, field]) => {
      return componentsByIri[field.componentIri] !== undefined
        ? [[key, componentsByIri[field.componentIri].component]]
        : [];
    });

    const query = dataSet
      .query()
      .limit(null)
      .select(selectedComponents)
      .filter(constructedFilters);

    // WARNING! Potentially dangrous/wrong typecast because query.execute() returns Promise<any[]>
    const data: RawObservations<FieldsType> = await query.execute();
    return parseObservations(data);
  }, [filters, dataSet, fields, measures, dimensions]);

  return useRemoteData<Observations<FieldsType>>(
    ["observations", filters, dataSet, fields, measures, dimensions],
    fetchData
  );
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
  return useRemoteData(["dimensionvalues", dimension.iri.value], fetchData);
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
  return useRemoteData(["dimensionminmax", measure.iri.value], fetchData);
};
