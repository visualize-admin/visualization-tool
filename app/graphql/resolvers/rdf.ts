import { ascending, descending } from "d3-array";
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
  GeoProperties,
  GeoShapes,
  isMeasure,
  Measure,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { Loaders } from "@/graphql/context";
import {
  ComponentId,
  getFiltersByComponentIris,
  parseComponentId,
  stringifyComponentId,
} from "@/graphql/make-component-id";
import {
  QueryResolvers,
  SearchCubeResultOrder,
} from "@/graphql/resolver-types";
import { resolveDimensionType, resolveMeasureType } from "@/graphql/resolvers";
import { ResolvedDimension } from "@/graphql/shared-types";
import { LightCube } from "@/rdf/light-cube";
import {
  createCubeDimensionValuesLoader,
  getCubeDimensions,
  getCubeObservations,
} from "@/rdf/queries";
import { queryCubeUnversionedIri } from "@/rdf/query-cube-unversioned-iri";
import { GeoShape } from "@/rdf/query-geo-shapes";
import { parseHierarchy, queryHierarchies } from "@/rdf/query-hierarchies";
import { queryLatestCubeIri } from "@/rdf/query-latest-cube-iri";
import { getPossibleFilters } from "@/rdf/query-possible-filters";
import { searchCubes as _searchCubes, SearchResult } from "@/rdf/query-search";
import { getSparqlEditorUrl } from "@/rdf/sparql-utils";

export const dataCubeLatestIri: NonNullable<
  QueryResolvers["dataCubeLatestIri"]
> = async (_, { cubeFilter }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  return (
    (await queryLatestCubeIri(sparqlClient, cubeFilter.iri)) ?? cubeFilter.iri
  );
};

export const dataCubeUnversionedIri: NonNullable<
  QueryResolvers["dataCubeUnversionedIri"]
> = async (_, { cubeFilter }, { setup }, info) => {
  const { iri } = cubeFilter;
  const { sparqlClient } = await setup(info);
  return (await queryCubeUnversionedIri(sparqlClient, iri)) ?? iri;
};

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
  { locale, query, order, includeDrafts, fetchDimensionTermsets, filters },
  { setup },
  info
) => {
  const { sparqlClient } = await setup(info);
  const cubes = await _searchCubes({
    locale,
    includeDrafts,
    fetchDimensionTermsets,
    filters,
    query,
    sparqlClient,
  });
  sortResults(cubes, order, locale);

  return cubes;
};

export const dataCubeDimensionGeoShapes: NonNullable<
  QueryResolvers["dataCubeDimensionGeoShapes"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { iri, dimensionId } = cubeFilter;
  const { unversionedComponentIri = dimensionId } = parseComponentId(
    dimensionId as ComponentId
  );
  const { loaders, sparqlClient, cache } = await setup(info);
  const dimension = await getResolvedDimension(unversionedComponentIri, {
    cubeIri: iri,
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
  const geometries = dimensionValues.map((d) => d.geometry).filter(truthy);

  if (geometries.length === 0) {
    throw Error(
      `No geometries found for dimension ${unversionedComponentIri}!`
    );
  }

  const dimensionValuesByGeometry = new Map(
    dimensionValues.map((d) => [d.geometry, d.value])
  );
  const dimensionValuesByValue = new Map(
    dimensionValues.map((d) => [d.value, d.label])
  );
  const shapes = await loaders.geoShapes.loadMany(geometries);
  const geoJSONFeatures = shapes
    .filter(
      (
        shape
      ): shape is Exclude<GeoShape, "wktString"> & { wktString: string } =>
        !(shape instanceof Error) && shape.wktString !== undefined
    )
    .map((shape) => {
      const value = dimensionValuesByGeometry.get(shape.geometryIri) as string;
      return {
        type: "Feature",
        properties: {
          iri: value,
          label: dimensionValuesByValue.get(value),
        },
        geometry: parseWKT(shape.wktString),
      };
    });

  return {
    topology: topology({
      shapes: {
        type: "FeatureCollection",
        features: geoJSONFeatures,
      } as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoProperties>,
    }) as GeoShapes["topology"],
  };
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
  const cube = await loaders.cube.load(cubeIri);

  if (!cube) {
    throw Error(`Cube ${cubeIri} not found!`);
  }

  const [unversionedCubeIri = cubeIri] = await Promise.all([
    queryCubeUnversionedIri(sparqlClient, cubeIri),
    cube.fetchShape(),
  ]);
  const dimensions = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    unversionedCubeIri,
    componentIris: [iri],
    cache,
  });

  const dimension = dimensions.find((d) => iri === d.data.iri);

  if (!dimension) {
    throw Error(`Dimension ${iri} not found!`);
  }

  return dimension;
};

export const possibleFilters: NonNullable<
  QueryResolvers["possibleFilters"]
> = async (_, { cubeFilter }, { setup }, info) => {
  const { iri, filters: _filters } = cubeFilter;
  const { sparqlClient, loaders, cache } = await setup(info);
  const cube = await loaders.cube.load(iri);
  const cubeIri = cube.term?.value;

  if (!cubeIri) {
    return [];
  }

  const filters = getFiltersByComponentIris(_filters);

  return await getPossibleFilters(cubeIri, { filters, sparqlClient, cache });
};

export const dataCubeComponents: NonNullable<
  QueryResolvers["dataCubeComponents"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { loaders, sparqlClient, sparqlClientStream, cache } =
    await setup(info);
  const { iri, componentIds, filters: _filters, loadValues } = cubeFilter;
  const cube = await loaders.cube.load(iri);

  if (!cube) {
    throw Error(`Cube ${iri} not found!`);
  }

  await cube.fetchShape();

  const filters = _filters ? getFiltersByComponentIris(_filters) : undefined;
  const componentIris = componentIds?.map(
    (id) => parseComponentId(id as ComponentId).unversionedComponentIri ?? id
  );

  const unversionedCubeIri =
    (await queryCubeUnversionedIri(sparqlClient, iri)) ?? iri;
  const rawComponents = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    unversionedCubeIri,
    componentIris,
    cache,
  });
  const allRelatedLimitValues = rawComponents.flatMap((rc) =>
    (rc.data.limits ?? []).flatMap((limit) => limit.related)
  );
  const components = await Promise.all(
    rawComponents.map(async (component) => {
      const { data } = component;
      const id = stringifyComponentId({
        unversionedCubeIri,
        unversionedComponentIri: data.iri,
      });
      const dimensionValuesLoader = getDimensionValuesLoader(
        sparqlClient,
        loaders,
        cache,
        filters
      );

      const [rawValues, rawHierarchies] = await Promise.all(
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
      const values = rawValues.sort((a, b) =>
        ascending(
          a.position ?? a.value ?? undefined,
          b.position ?? b.value ?? undefined
        )
      );
      const relatedLimitValues = allRelatedLimitValues
        .filter((r) => r.dimensionId === id)
        .map((r) => ({
          value: r.value,
          label: r.label,
          position: r.position,
        }));
      const baseComponent: BaseComponent = {
        // We need to use original iri here, as the cube iri might have changed.
        cubeIri: iri,
        id,
        label: data.name,
        description: data.description,
        unit: data.unit,
        scaleType: data.scaleType,
        dataType: data.dataType,
        order: data.order,
        isNumerical: data.isNumerical,
        isKeyDimension: data.isKeyDimension,
        values,
        relatedLimitValues,
        related: data.related.map((r) => ({
          type: r.type,
          id: stringifyComponentId({
            unversionedCubeIri,
            unversionedComponentIri: r.iri,
          }),
        })),
      };

      if (data.isMeasureDimension) {
        const measure: Measure = {
          __typename: resolveMeasureType(component.data.scaleType),
          isCurrency: data.isCurrency,
          isDecimal: data.isDecimal,
          currencyExponent: data.currencyExponent,
          resolution: data.resolution,
          limits: data.limits ?? [],
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
              dimensionId: data.iri,
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
              throw Error(
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

export const dataCubeComponentTermsets: NonNullable<
  QueryResolvers["dataCubeComponentTermsets"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  const { iri } = cubeFilter;
  const unversionedIri =
    (await queryCubeUnversionedIri(sparqlClient, iri)) ?? iri;
  const cube = new LightCube({ iri, unversionedIri, locale, sparqlClient });

  return await cube.fetchComponentTermsets();
};

export const dataCubeMetadata: NonNullable<
  QueryResolvers["dataCubeMetadata"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  const { iri } = cubeFilter;
  const unversionedIri =
    (await queryCubeUnversionedIri(sparqlClient, iri)) ?? iri;
  const cube = new LightCube({ iri, unversionedIri, locale, sparqlClient });

  return await cube.fetchMetadata();
};

export const dataCubeObservations: NonNullable<
  QueryResolvers["dataCubeObservations"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { loaders, sparqlClient, cache } = await setup(info);
  const { iri, filters: _filters, componentIds } = cubeFilter;
  const cube = await loaders.cube.load(iri);

  if (!cube) {
    throw Error("Cube not found!");
  }

  await cube.fetchShape();

  const filters = _filters ? getFiltersByComponentIris(_filters) : undefined;
  const componentIris = componentIds?.map(
    (id) => parseComponentId(id as ComponentId).unversionedComponentIri ?? id
  );

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
  const { iri } = cubeFilter;
  const unversionedIri =
    (await queryCubeUnversionedIri(sparqlClient, iri)) ?? iri;
  const cube = new LightCube({ iri, unversionedIri, locale, sparqlClient });

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
