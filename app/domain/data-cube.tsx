import { literal } from "@rdfjs/data-model";
import {
  DataCube,
  DataCubeEntryPoint,
  Dimension,
  Measure,
  Attribute
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
import { ChartFields, Filters } from "./config-types";
import {
  AttributeWithMeta,
  DimensionWithMeta,
  getDataTypeFromDimensionValues,
  MeasureWithMeta,
  Observations,
  parseObservations,
  ObservationsPreview
} from "./data";
import { locales } from "../locales/locales";

const DataCubeContext = createContext<DataCubeEntryPoint>(
  new DataCubeEntryPoint("")
);

export const DataCubeProvider = ({ children }: { children?: ReactNode }) => {
  if (!process.env.SPARQL_ENDPOINT) {
    throw Error("No SPARQL_ENDPOINT set!");
  }
  const endpoint = process.env.SPARQL_ENDPOINT;
  const locale = useLocale();

  const entryPoint = useMemo(() => {
    return new DataCubeEntryPoint(endpoint, {
      languages: [locale, ...locales.filter(l => l !== locale), ""],
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

  return (
    <DataCubeContext.Provider value={entryPoint}>
      {children}
    </DataCubeContext.Provider>
  );
};

const useDataCubeEntryPoint = () => {
  const entryPoint = useContext(DataCubeContext);
  return entryPoint;
};

export const useDataSets = () => {
  const entryPoint = useDataCubeEntryPoint();
  return useRemoteData(
    ["dataSets", entryPoint],
    (_: string, _entryPoint: DataCubeEntryPoint) => {
      return _entryPoint.dataCubes();
    }
  );
};

const useDataSet = (iri: string | undefined) => {
  const entryPoint = useDataCubeEntryPoint();
  return useRemoteData(
    () => (iri ? ["dataSet", entryPoint, iri] : null),
    () => entryPoint.dataCubeByIri(iri!)
  );
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

const useMetadata = (cube: DataCube | undefined) => {
  return useRemoteData(
    () => (cube ? cube.iri : null),
    async () => ({
      dimensions: await cube!.dimensions(),
      measures: await cube!.measures(),
      attributes: await cube!.attributes()
    })
  );
};

// Alternative implementation of useDataSetAndMetadata which fetches values for multiple components at the same time
// Not used because it's actually slower!
// export const useDataSetAndMetadata2 = (
//   iri: string
// ): RDState<DataSetMetadata> => {
//   const { data: dataSet } = useDataSet(iri);
//   const { data: metaData } = useMetadata(dataSet);

//   return useRemoteData(
//     () => (dataSet && metaData ? [dataSet, metaData] : null),
//     async () => {
//       const { dimensions, attributes, measures } = metaData!;
//       console.time("dimensionValues")
//       const dimensionValues = await dataSet!.componentsValues(dimensions,
//         );
//       console.timeEnd("dimensionValues")
//       const attributeValues = await dataSet!.componentsValues(attributes
//       );
//       const measureMinMax = await dataSet!.componentsMinMax(measures);

//       const dimensionsWithValues = dimensions.map(component => ({
//         component,
//         values: dimensionValues.get(component)!
//       }));
//       const attributesWithValues = attributes.map(component => ({
//         component,
//         values: attributeValues.get(component)!
//       }));
//       const measuresWithMinMax = measures.map(component => ({
//         component,
//         ...measureMinMax.get(component)!
//       }));

//       const componentLabels = [
//         ...dimensions,
//         ...measures,
//         ...attributes
//       ].reduce<Record<string, string>>((labels, component) => {
//         labels[component.iri.value] = component.label.value;
//         return labels;
//       }, {});

//       const componentsByIri = [
//         ...dimensionsWithValues,
//         ...measuresWithMinMax,
//         ...attributesWithValues
//       ].reduce<
//         Record<string, DimensionWithMeta | AttributeWithMeta | MeasureWithMeta>
//       >((components, component) => {
//         components[component.component.iri.value] = component;
//         return components;
//       }, {});

//       return {
//         dataSet: dataSet!,
//         dimensions: dimensionsWithValues,
//         attributes: attributesWithValues,
//         measures: measuresWithMinMax,
//         componentLabels,
//         componentsByIri
//       };
//     }
//   );
// };

export const useDataSetAndMetadata = (
  iri: string | undefined
): RDState<DataSetMetadata> => {
  const { data: dataSet } = useDataSet(iri);
  const { data: metaData } = useMetadata(dataSet);

  const fetchCb = useCallback(
    async (
      dataSet: DataCube,
      metaData: {
        dimensions: Dimension[];
        attributes: Attribute[];
        measures: Measure[];
      }
    ) => {
      const { dimensions, attributes, measures } = metaData;

      console.time("dimensionValues");
      const dimensionsWithValues = await Promise.all(
        dimensions.map(async component => ({
          component,
          values: await dataSet.componentValues(component)
        }))
      );
      console.timeEnd("dimensionValues");

      const attributesWithValues = await Promise.all(
        attributes.map(async component => ({
          component,
          values: await dataSet.componentValues(component)
        }))
      );

      const measuresWithMinMax = await Promise.all(
        measures.map(async component => ({
          component,
          ...(await dataSet.componentMinMax(component))
        }))
      );

      const componentLabels = [
        ...dimensions,
        ...measures,
        ...attributes
      ].reduce<Record<string, string>>((labels, component) => {
        labels[component.iri.value] = component.label.value;
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
    },
    []
  );

  return useRemoteData(
    () => (dataSet && metaData ? [dataSet, metaData] : null),
    fetchCb
  );
};

export const usePreviewObservations = ({
  dataSet,
  selection
}: {
  dataSet: DataCube;
  selection: [string, Dimension | Measure][];
}): RDState<ObservationsPreview> => {
  const fetchData = useCallback(async () => {
    const query = dataSet
      .query()
      .limit(10)
      .select(selection);

    const data = await query.execute();
    return parseObservations(data);
  }, [dataSet, selection]);

  return useRemoteData<ObservationsPreview>(
    ["observationsPreview", dataSet, selection],
    fetchData
  );
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
    const selectedComponents: [string, Dimension | Measure][] = Object.entries<{
      componentIri: string;
    }>(fields).flatMap(([key, field]) => {
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
    const data = await query.execute();
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
