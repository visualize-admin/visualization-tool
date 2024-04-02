import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import ParsingClient from "sparql-http-client/ParsingClient";
import { topology } from "topojson-server";
import { LRUCache } from "typescript-lru-cache";
import { parse as parseWKT } from "wellknown";

import { Filters } from "@/config-types";
import {
  BaseComponent,
  BaseDimension,
  Dimension,
  DimensionValue,
  GeoFeature,
  GeoProperties,
  GeoShapes,
  Measure,
  TemporalDimension,
  TemporalEntityDimension,
  isMeasure,
} from "@/domain/data";
import { Loaders } from "@/graphql/context";
import {
  QueryResolvers,
  Resolvers,
  SearchCubeResultOrder,
} from "@/graphql/resolver-types";
import { resolveDimensionType, resolveMeasureType } from "@/graphql/resolvers";
import { ResolvedDimension } from "@/graphql/shared-types";
import { LightCube } from "@/rdf/light-cube";
import {
  createCubeDimensionValuesLoader,
  getCubeDimensions,
  getCubeObservations,
  getLatestCube,
} from "@/rdf/queries";
import { RawGeoShape } from "@/rdf/query-geo-shapes";
import { parseHierarchy, queryHierarchies } from "@/rdf/query-hierarchies";
import { getPossibleFilters } from "@/rdf/query-possible-filters";
import { SearchResult, searchCubes as _searchCubes } from "@/rdf/query-search";
import { getSparqlEditorUrl } from "@/rdf/sparql-utils";

const sortResults = (
  results: SearchResult[],
  order: SearchCubeResultOrder | undefined | null,
  locale: string | undefined | null
): SearchResult[] => {
  switch (order) {
    case SearchCubeResultOrder.TitleAsc:
      results.sort((a, b) =>
        a.cube.title.localeCompare(b.cube.title, locale ?? undefined)
      );
      break;
    case SearchCubeResultOrder.CreatedDesc:
    case undefined:
    case null:
      results.sort((a, b) => {
        const ra = a.cube.datePublished ?? "0";
        const rb = b.cube.datePublished ?? "0";

        return descending(ra, rb);
      });
      break;
    case SearchCubeResultOrder.Score:
      break;
    default:
      const _exhaustiveCheck: never = order;
      return _exhaustiveCheck;
  }
  return results;
};

export const searchCubes: NonNullable<QueryResolvers["searchCubes"]> = async (
  _,
  { locale, query, order, includeDrafts, filters },
  { setup },
  info
) => {
  const { sparqlClient } = await setup(info);
  const cubes = await _searchCubes({
    locale,
    includeDrafts,
    filters,
    query,
    sparqlClient,
  });
  sortResults(cubes, order, locale);

  return cubes;
};

export const dataCubeDimensionGeoShapes: NonNullable<
  QueryResolvers["dataCubeDimensionGeoShapes"]
> = async (_, { cubeIri, dimensionIri, locale }, { setup }, info) => {
  const { loaders, sparqlClient, cache } = await setup(info);
  const dimension = await getResolvedDimension(dimensionIri, {
    cubeIri,
    locale,
    sparqlClient,
    loaders,
    cache,
  });
  const dimensionValuesLoader = getDimensionValuesLoader(
    sparqlClient,
    loaders,
    cache
  );
  const dimensionValues = await dimensionValuesLoader.load(dimension);
  const values = dimensionValues.map((d) => `${d.value}`);
  const shapes = await Promise.all(
    values.map((d) => loaders.geoShapes.load(d))
  );
  const geoJSONFeatures = shapes
    .filter(
      (d): d is Exclude<RawGeoShape, "wktString"> & { wktString: string } =>
        d.wktString !== undefined
    )
    .map((d) => ({
      type: "Feature",
      properties: {
        iri: d.iri,
        label: d.label,
      },
      geometry: parseWKT(d.wktString),
    })) as GeoFeature[];

  return {
    topology: topology({
      shapes: {
        type: "FeatureCollection",
        features: geoJSONFeatures,
      } as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoProperties>,
    }) as GeoShapes["topology"],
  };
};

export const dataCubeDimensionGeoCoordinates: NonNullable<
  QueryResolvers["dataCubeDimensionGeoCoordinates"]
> = async (_, { cubeIri, dimensionIri, locale }, { setup }, info) => {
  const { loaders, sparqlClient, cache } = await setup(info);
  const dimension = await getResolvedDimension(dimensionIri, {
    cubeIri,
    locale,
    sparqlClient,
    loaders,
    cache,
  });

  return await loaders.geoCoordinates.load(dimension);
};

// TODO: could be refactored to not fetch the whole cube shape.
const getResolvedDimension = async (
  iri: string,
  options: {
    cubeIri: string;
    locale: string;
    sparqlClient: ParsingClient;
    loaders: Loaders;
    cache: LRUCache | undefined;
  }
): Promise<ResolvedDimension> => {
  const { cubeIri, locale, sparqlClient, loaders, cache } = options;
  const rawCube = await loaders.cube.load(cubeIri);

  if (!rawCube) {
    throw new Error(`Cube ${cubeIri} not found!`);
  }

  const cube = await getLatestCube(rawCube);
  await cube.fetchShape();
  const dimensions = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    componentIris: [iri],
    cache,
  });

  const dimension = dimensions.find((d) => iri === d.data.iri);

  if (!dimension) {
    throw new Error(`Dimension ${iri} not found!`);
  }

  return dimension;
};

export const possibleFilters: NonNullable<
  QueryResolvers["possibleFilters"]
> = async (_, { iri, filters }, { setup }, info) => {
  const { sparqlClient, loaders, cache } = await setup(info);
  const rawCube = await loaders.cube.load(iri);
  // Currently we always default to the latest cube.
  const cube = await getLatestCube(rawCube);
  const cubeIri = cube.term?.value;

  if (!cubeIri) {
    return [];
  }

  return await getPossibleFilters(cubeIri, { filters, sparqlClient, cache });
};

export const dataCubeComponents: NonNullable<
  QueryResolvers["dataCubeComponents"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { loaders, sparqlClient, sparqlClientStream, cache } =
    await setup(info);
  const { iri, latest = true, componentIris, filters, loadValues } = cubeFilter;
  const rawCube = await loaders.cube.load(iri);

  if (!rawCube) {
    throw new Error(`Cube ${iri} not found!`);
  }

  const cube = latest ? await getLatestCube(rawCube) : rawCube;
  await cube.fetchShape();

  const rawComponents = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    componentIris,
    cache,
  });
  const components = await Promise.all(
    rawComponents.map(async (component) => {
      const { data } = component;
      const dimensionValuesLoader = getDimensionValuesLoader(
        sparqlClient,
        loaders,
        cache,
        filters
      );
      const [values, rawHierarchies] = await Promise.all(
        loadValues
          ? [
              dimensionValuesLoader.load(component),
              queryHierarchies(component, {
                locale,
                sparqlClientStream,
              }),
            ]
          : [[] as DimensionValue[], null]
      );
      values.sort((a, b) =>
        ascending(
          a.position ?? a.value ?? undefined,
          b.position ?? b.value ?? undefined
        )
      );
      const baseComponent: BaseComponent = {
        // We need to use original iri here, as the cube iri might have changed.
        cubeIri: iri,
        iri: data.iri,
        label: data.name,
        description: data.description,
        unit: data.unit,
        scaleType: data.scaleType,
        dataType: data.dataType,
        order: data.order,
        isNumerical: data.isNumerical,
        isKeyDimension: data.isKeyDimension,
        values,
        related: data.related,
      };

      if (data.isMeasureDimension) {
        const measure: Measure = {
          __typename: resolveMeasureType(component.data.scaleType),
          isCurrency: data.isCurrency,
          isDecimal: data.isDecimal,
          currencyExponent: data.currencyExponent,
          resolution: data.resolution,
          ...baseComponent,
        };
        return measure;
      } else {
        const { dataKind, scaleType, timeUnit, related } = component.data;
        const dimensionType = resolveDimensionType(
          dataKind,
          scaleType,
          timeUnit,
          related
        );
        const hierarchy = rawHierarchies
          ? parseHierarchy(rawHierarchies, {
              dimensionIri: data.iri,
              locale,
              dimensionValues: values,
            })
          : null;

        const baseDimension: BaseDimension = {
          ...baseComponent,
          hierarchy,
        };

        switch (dimensionType) {
          case "TemporalDimension":
          case "TemporalEntityDimension": {
            if (!data.timeFormat || !data.timeUnit) {
              throw new Error(
                `${dimensionType} ${data.iri} is missing timeFormat or timeUnit!`
              );
            }

            const dimension: TemporalDimension | TemporalEntityDimension = {
              __typename: dimensionType,
              timeFormat: data.timeFormat,
              timeUnit: data.timeUnit,
              ...baseDimension,
            };
            return dimension;
          }
          default: {
            const dimension: Exclude<
              Dimension,
              TemporalDimension | TemporalEntityDimension
            > = {
              __typename: dimensionType,
              ...baseDimension,
            };
            return dimension;
          }
        }
      }
    })
  );

  const dimensions = components.filter((d) => !isMeasure(d)) as Dimension[];
  const measures = components.filter(isMeasure);

  return {
    dimensions,
    measures,
  };
};

export const dataCubeMetadata: NonNullable<
  QueryResolvers["dataCubeMetadata"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  const { iri, latest = true } = cubeFilter;
  const cube = await new LightCube({ iri, locale, sparqlClient }).init(
    !!latest
  );

  return await cube.fetchMetadata();
};

export const dataCubeObservations: NonNullable<
  QueryResolvers["dataCubeObservations"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { loaders, sparqlClient, cache } = await setup(info);
  const { iri, latest = true, filters, componentIris } = cubeFilter;
  const rawCube = await loaders.cube.load(iri);

  if (!rawCube) {
    throw new Error("Cube not found!");
  }

  const cube = latest ? await getLatestCube(rawCube) : rawCube;
  await cube.fetchShape();

  const { query, observations } = await getCubeObservations({
    cube,
    locale,
    sparqlClient,
    filters,
    componentIris,
    cache,
  });

  return {
    data: observations,
    sparqlEditorUrl: getSparqlEditorUrl({
      query,
      dataSource: {
        type: info.variableValues.sourceType,
        url: info.variableValues.sourceUrl,
      },
    }),
  };
};

export const dataCubePreview: NonNullable<
  QueryResolvers["dataCubePreview"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  const { iri, latest = true } = cubeFilter;
  const cube = await new LightCube({ iri, locale, sparqlClient }).init(
    !!latest
  );

  return await cube.fetchPreview();
};

const getDimensionValuesLoader = (
  sparqlClient: ParsingClient,
  loaders: Loaders,
  cache: LRUCache | undefined,
  filters?: Filters | null
): DataLoader<ResolvedDimension, DimensionValue[]> => {
  let loader: typeof loaders.dimensionValues | undefined;

  if (filters) {
    const filterKey = JSON.stringify(filters);
    const existingLoader = loaders.filteredDimensionValues.get(filterKey);

    if (existingLoader) {
      return existingLoader;
    }

    loader = new DataLoader(
      createCubeDimensionValuesLoader(sparqlClient, cache, filters)
    );
    loaders.filteredDimensionValues.set(filterKey, loader);

    return loader;
  } else {
    return loaders.dimensionValues;
  }
};

export const dimensionValues: NonNullable<
  NonNullable<Resolvers["Dimension"]>["values"]
> = async (resolvedDimension, { filters, disableLoad }, { setup }, info) => {
  if (disableLoad) {
    return [];
  }

  const { loaders, sparqlClient, cache } = await setup(info);
  const loader = getDimensionValuesLoader(
    sparqlClient,
    loaders,
    cache,
    filters
  );
  const values = await loader.load(resolvedDimension);

  return values.sort((a, b) =>
    ascending(
      a.position ?? a.value ?? undefined,
      b.position ?? b.value ?? undefined
    )
  );
};
