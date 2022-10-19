import { descending, group, index } from "d3";
import { Maybe } from "graphql-tools";
import {
  Cube,
  CubeDimension,
  Filter,
  LookupSource,
  View,
} from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { PromiseValue, truthy } from "@/domain/types";
import { createSource, pragmas } from "@/rdf/create-source";
import { makeCubeFilters } from "@/rdf/cube-filters";

import { Filters } from "../configurator";
import {
  DimensionValue,
  Observation,
  parseObservationValue,
  shouldValuesBeLoadedForResolvedDimension,
} from "../domain/data";
import { SPARQL_EDITOR } from "../domain/env";
import { DataCubeSearchFilter } from "../graphql/query-hooks";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";

import * as ns from "./namespace";
import {
  getQueryLocales,
  getScaleType,
  isCubePublished,
  parseCube,
  parseCubeDimension,
} from "./parse";
import { loadDimensionValues } from "./query-dimension-values";
import { loadResourceLabels } from "./query-labels";
import { loadResourcePositions } from "./query-positions";
import { loadUnversionedResources } from "./query-sameas";
import { loadUnits } from "./query-unit-labels";

const DIMENSION_VALUE_UNDEFINED = ns.cube.Undefined.value;

/** Adds a suffix to an iri to mark its label */
const labelDimensionIri = (iri: string) => `${iri}/__label__`;

const getLatestCube = async (cube: Cube): Promise<Cube> => {
  const source = cube.source;

  const versionHistory = cube.in(ns.schema.hasPart)?.term;
  const isPublished = isCubePublished(cube);
  const version = cube.out(ns.schema.version);
  const isExpired = cube.out(ns.schema.expires)?.value !== undefined;

  // If it's not expired, don't even try to look for newer versions
  if (!isExpired) {
    return cube;
  }

  const filters = [
    // Only cubes from the same version history
    Cube.filter.isPartOf(versionHistory),
    // With a higher version number
    Cube.filter.version.gt(version),
    // If the original cube is published, only select cubes that are also published
    Cube.filter.status(
      isPublished
        ? [ns.adminVocabulary("CreativeWorkStatus/Published")]
        : [
            ns.adminVocabulary("CreativeWorkStatus/Draft"),
            ns.adminVocabulary("CreativeWorkStatus/Published"),
          ]
    ),
  ];

  const newerCubes = await source.cubes({
    noShape: true, // Don't fetch shape on multiple cubes for performance resons. Shape is fetched on the cube that's picked below.
    filters,
  });

  if (newerCubes.length > 0) {
    newerCubes.sort((a, b) =>
      descending(
        +a.out(ns.schema.version)?.value!,
        +b.out(ns.schema.version)?.value!
      )
    );

    // If there's a newer cube that's published, it's preferred over drafts
    // (this only applies if the original cube was in draft status anyway)
    const latestCube =
      newerCubes.find((cube) => isCubePublished(cube)) ?? newerCubes[0];

    // Call cube.fetchShape() to populate dimension metadata
    await latestCube.fetchShape();

    return latestCube;
  }

  // If there are no newer cubes, return the original one
  return cube;
};

export const getCubes = async ({
  includeDrafts,
  sourceUrl,
  locale,
  filters,
}: {
  includeDrafts: boolean;
  sourceUrl: string;
  locale: string;
  filters?: DataCubeSearchFilter[];
}): Promise<ResolvedDataCube[]> => {
  const source = createSource({ endpointUrl: sourceUrl });

  const cubesFilters = makeCubeFilters({ includeDrafts, filters });

  const cubes = await source.cubes({
    noShape: true,
    filters: cubesFilters,
  });

  return cubes.map((cube) => parseCube({ cube, locale }));
};

export const getCube = async ({
  iri,
  sourceUrl,
  locale,
  latest = true,
}: {
  iri: string;
  sourceUrl: string;
  locale: string;
  latest?: boolean;
}): Promise<ResolvedDataCube | null> => {
  const source = createSource({ endpointUrl: sourceUrl });
  const cube = await source.cube(iri);

  if (!cube) {
    return null;
  }

  const latestCube = latest === false ? cube : await getLatestCube(cube);
  return parseCube({ cube: latestCube, locale });
};

export const getCubeDimensions = async ({
  cube,
  locale,
  sparqlClient,
}: {
  cube: Cube;
  locale: string;
  sparqlClient: ParsingClient;
}): Promise<ResolvedDimension[]> => {
  try {
    const dimensions = cube.dimensions.filter(
      (dim) =>
        dim.path &&
        ![ns.rdf.type.value, ns.cube.observedBy.value].includes(
          dim.path.value ?? ""
        )
    );
    const dimensionUnits = dimensions.flatMap((d) => {
      const t = d.out(ns.qudt.unit).term;
      return t ? [t] : [];
    });

    const dimensionUnitIndex = index(
      await loadUnits({
        ids: dimensionUnits,
        locale: "en", // No other locales exist yet
        sparqlClient,
      }),
      (d) => d.iri.value
    );

    return dimensions.map((dim) => {
      return parseCubeDimension({
        dim,
        cube,
        locale,
        units: dimensionUnitIndex,
      });
    });
  } catch (e) {
    console.error(e);

    return [];
  }
};

export const createCubeDimensionValuesLoader =
  (sparqlClient: ParsingClient, filters?: Filters) =>
  async (dimensions: readonly ResolvedDimension[]) => {
    const result: DimensionValue[][] = [];

    for (const dimension of dimensions) {
      const dimensionValues = await getCubeDimensionValues(
        sparqlClient,
        dimension,
        filters
      );
      result.push(dimensionValues);
    }

    return result;
  };

export const getCubeDimensionValues = async (
  sparqlClient: ParsingClient,
  rdimension: ResolvedDimension,
  filters?: Filters
): Promise<DimensionValue[]> => {
  const { dimension, cube, locale, data } = rdimension;
  if (
    typeof dimension.minInclusive !== "undefined" &&
    typeof dimension.maxInclusive !== "undefined" &&
    data.timeUnit !== "Day" &&
    data.timeUnit !== "Month" &&
    data.scaleType !== "Ordinal"
  ) {
    const min = parseObservationValue({ value: dimension.minInclusive }) ?? 0;
    const max = parseObservationValue({ value: dimension.maxInclusive }) ?? 0;

    return [
      { value: min, label: `${min}` },
      { value: max, label: `${max}` },
    ];
  }

  if (!shouldValuesBeLoadedForResolvedDimension(rdimension)) {
    return [];
  }

  return await getCubeDimensionValuesWithLabels({
    dimension,
    cube,
    sparqlClient,
    locale,
    filters,
  });
};

export const dimensionIsVersioned = (dimension: CubeDimension) =>
  dimension.out(ns.schema.version)?.value ? true : false;

const getCubeDimensionValuesWithLabels = async ({
  dimension,
  cube,
  sparqlClient,
  locale,
  filters,
}: {
  dimension: CubeDimension;
  cube: Cube;
  sparqlClient: ParsingClient;
  locale: string;
  filters?: Filters;
}): Promise<DimensionValue[]> => {
  const load = async () => {
    const loaders = [
      !filters ? () => dimension.in || [] : undefined,
      () =>
        loadDimensionValues(
          { datasetIri: cube.term, dimension, cube, sparqlClient },
          filters
        ),
    ].filter(truthy);

    for (const loader of loaders) {
      const dimensionValues = await loader();

      if (dimensionValues.length) {
        const grouped = group(dimensionValues, (d) => d.termType);

        const namedNodes = (grouped.get("NamedNode") || []) as Array<NamedNode>;
        const literals = (grouped.get("Literal") || []) as Array<Literal>;

        if (namedNodes?.length || literals?.length) {
          return { namedNodes, literals };
        }
      }
    }

    return { namedNodes: [], literals: [] };
  };

  const { namedNodes, literals } = await load();

  if (namedNodes.length > 0 && literals.length > 0) {
    console.warn(
      `WARNING: dimension with mixed literals and named nodes <${dimension.path?.value}>`
    );
  }

  if (namedNodes.length === 0 && literals.length === 0) {
    console.warn(
      `WARNING: dimension with NO values <${dimension.path?.value}>`
    );

    return [];
  }

  /**
   * If the dimension is versioned, we're loading the "unversioned" values to store in the config,
   * so cubes can be upgraded to newer versions without the filters breaking.
   */
  if (namedNodes.length > 0) {
    const scaleType = getScaleType(dimension);
    const [labels, positions, unversioned] = await Promise.all([
      loadResourceLabels({ ids: namedNodes, locale, sparqlClient }),
      scaleType === "Ordinal"
        ? loadResourcePositions({ ids: namedNodes, sparqlClient })
        : [],
      dimensionIsVersioned(dimension)
        ? loadUnversionedResources({ ids: namedNodes, sparqlClient })
        : [],
    ]);

    const labelLookup = new Map(
      labels.map(({ iri, label }) => [iri.value, label?.value])
    );

    const positionsLookup = new Map(
      positions.map(({ iri, position }) => [iri.value, position?.value])
    );

    const unversionedLookup = new Map(
      unversioned.map(({ iri, sameAs }) => [iri.value, sameAs?.value])
    );

    return namedNodes.map((iri) => {
      const pos = positionsLookup.get(iri.value);
      return {
        position: pos !== undefined ? parseInt(pos, 10) : undefined,
        value: unversionedLookup.get(iri.value) ?? iri.value,
        label: labelLookup.get(iri.value) ?? "",
      };
    });
  } else if (literals.length > 0) {
    return literals.map((v) => {
      return ns.cube.Undefined.equals(v.datatype)
        ? {
            value: DIMENSION_VALUE_UNDEFINED, // We use a known string here because actual null does not work as value in UI inputs.
            label: "–",
          }
        : {
            value: v.value,
            label: v.value,
          };
    });
  }

  return [];
};

export const getCubeObservations = async ({
  cube,
  locale,
  sparqlClient,
  filters,
  limit,
  raw,
  dimensions,
}: {
  cube: Cube;
  locale: string;
  sparqlClient: ParsingClient;
  /** Observations filters that should be considered */
  filters?: Filters;
  /** Limit on the number of observations returned */
  limit?: number;
  /** Returns IRIs instead of labels for NamedNodes  */
  raw?: boolean;
  dimensions: Maybe<string[]> | undefined;
}): Promise<{
  query: string;
  observations: Observation[];
  observationsRaw: Record<string, Literal | NamedNode>[];
}> => {
  const cubeView = View.fromCube(cube);

  // Only choose dimensions that we really want
  let observationDimensions = cubeView.dimensions.filter((d) =>
    d.cubeDimensions.every(
      (cd) =>
        cd.path &&
        ![ns.rdf.type.value, ns.cube.observedBy.value].includes(
          cd.path.value ?? ""
        ) &&
        (dimensions ? dimensions.includes(cd.path.value) : true)
    )
  );

  let observationFilters = filters
    ? buildFilters({ cube, view: cubeView, filters, locale })
    : [];

  /**
   * Add labels to named dimensions
   */
  const allCubeDimensions = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
  });
  const cubeDimensions = allCubeDimensions.filter((d) =>
    dimensions ? dimensions.includes(d.data.iri) : true
  );

  // Find dimensions which are NOT literal
  const namedDimensions = cubeDimensions.filter(
    ({ data: { isLiteral } }) => !isLiteral
  );

  const lookupSource = LookupSource.fromSource(cube.source);
  lookupSource.queryPrefix = pragmas;

  // Override sourceGraph from cube source, so lookups also work outside of that graph
  lookupSource.ptr.deleteOut(ns.cubeView.graph);
  lookupSource.ptr.addOut(ns.cubeView.graph, rdf.defaultGraph());

  for (const dimension of namedDimensions) {
    if (raw) {
      continue;
    }
    const labelDimension = cubeView.createDimension({
      source: lookupSource,
      path: ns.schema.name,
      join: cubeView.dimension({ cubeDimension: dimension.data.iri }),
      as: labelDimensionIri(dimension.data.iri),
    });

    observationDimensions.push(labelDimension);
    observationFilters.push(
      labelDimension.filter.lang(getQueryLocales(locale))
    );
  }

  const observationsView = new View({
    dimensions: observationDimensions,
    filters: observationFilters,
  });

  /**
   * Add LIMIT to query
   */
  if (limit !== undefined) {
    // From https://github.com/zazuko/cube-creator/blob/a32a90ff93b2c6c1c5ab8fd110a9032a8d179670/apis/core/lib/domain/observations/lib/index.ts#L41
    observationsView.ptr.addOut(
      ns.cubeView.projection,
      (projection: $FixMe) => {
        // const order = projection
        //   .blankNode()
        //   .addOut(ns.cubeView.dimension, view.dimensions[0].ptr)
        //   .addOut(ns.cubeView.direction, ns.cubeView.Ascending);

        // projection.addList(ns.cubeView.orderBy, order)
        projection.addOut(ns.cubeView.limit, limit);
        // projection.addOut(ns.cubeView.offset, offset)
      }
    );
  }

  const queryOptions = {
    disableDistinct: !filters || Object.keys(filters).length === 0,
  };

  const query = observationsView
    .observationsQuery(queryOptions)
    .query.toString();

  let observationsRaw:
    | PromiseValue<ReturnType<typeof observationsView.observations>>
    | undefined;
  try {
    observationsRaw = await observationsView.observations(queryOptions);
  } catch (e) {
    console.warn("Query failed", query);
    throw new Error(
      `Could not retrieve data: ${e instanceof Error ? e.message : e}`
    );
  }
  const observations = observationsRaw.map((obs) => {
    return Object.fromEntries(
      cubeDimensions.map((d) => {
        const label = obs[labelDimensionIri(d.data.iri)]?.value;

        const value =
          obs[d.data.iri]?.termType === "Literal" &&
          ns.cube.Undefined.equals((obs[d.data.iri] as Literal)?.datatype)
            ? null
            : obs[d.data.iri]?.value;

        const rawValue = parseObservationValue({ value: obs[d.data.iri] });
        return [
          d.data.iri,
          raw ? rawValue : label ?? value ?? null,
          // v !== undefined ? parseObservationValue({ value: v }) : null,
        ];
      })
    );
  });

  const result = {
    query,
    observations,
    observationsRaw,
  };

  return result;
};

const buildFilters = ({
  cube,
  view,
  filters,
  locale,
}: {
  cube: Cube;
  view: View;
  filters: Filters;
  locale: string;
}): Filter[] => {
  const lookupSource = LookupSource.fromSource(cube.source);
  lookupSource.queryPrefix = pragmas;

  const filterEntries = Object.entries(filters).flatMap(([dimIri, filter]) => {
    const cubeDimension = cube.dimensions.find((d) => d.path?.value === dimIri);
    if (!cubeDimension) {
      console.warn(`WARNING: No cube dimension ${dimIri}`);
      return [];
    }
    const dimension = view.dimension({ cubeDimension: dimIri });

    if (!dimension) {
      return [];
    }

    // FIXME: Adding this dimension will make the query return nothing for dimensions that don't have it (no way to make it optional)

    /**
     * When dealing with a versioned dimension, the value provided from the config is unversioned
     * The relationship is expressed with schema:sameAs, so we need to look up the *versioned* value to apply the filter
     * If the dimension is not versioned (e.g. if its values are Literals), it can be used directly to filter
     */
    const filterDimension = dimensionIsVersioned(cubeDimension)
      ? view.createDimension({
          source: lookupSource,
          path: ns.schema.sameAs,
          join: dimension,
          as: labelDimensionIri(dimIri + "/__sameAs__"), // Just a made up dimension name that is used in the generated query but nowhere else
        })
      : dimension;

    const parsedCubeDimension = parseCubeDimension({
      dim: cubeDimension,
      cube,
      locale,
    });

    const { dataType } = parsedCubeDimension.data;

    if (ns.rdf.langString.value === dataType) {
      console.warn(
        `WARNING: Dimension <${dimIri}> has dataType 'langString'. Filtering won't work.`
      );
    }

    const hasHierarchy =
      cubeDimension.out(ns.cubeMeta.inHierarchy).values.length > 0 ||
      cubeDimension.out(ns.cubeMeta.hasHierarchy).values.length > 0;
    const toRDFValue = (value: string): NamedNode | Literal => {
      return dataType && !hasHierarchy
        ? parsedCubeDimension.data.hasUndefinedValues &&
          value === DIMENSION_VALUE_UNDEFINED
          ? rdf.literal("", ns.cube.Undefined)
          : rdf.literal(value, dataType)
        : rdf.namedNode(value);
    };

    const selectedValues =
      filter.type === "single"
        ? [
            filterDimension.filter.eq(
              toRDFValue(
                typeof filter.value === "number"
                  ? filter.value.toString()
                  : filter.value
              )
            ),
          ]
        : filter.type === "multi"
        ? // If values is an empty object, we filter by something that doesn't exist
          [
            filterDimension.filter.in(
              Object.keys(filter.values).length > 0
                ? Object.entries(filter.values).flatMap(([value, selected]) =>
                    selected ? [toRDFValue(value)] : []
                  )
                : [rdf.namedNode("EMPTY_VALUE")]
            ),
          ]
        : filter.type === "range"
        ? [
            filterDimension.filter.gte(toRDFValue(filter.from)),
            filterDimension.filter.lte(toRDFValue(filter.to)),
          ]
        : [];

    return selectedValues;
  });

  return filterEntries;
};

export const getSparqlEditorUrl = ({
  query,
}: {
  query: string;
}): string | null => {
  return SPARQL_EDITOR
    ? `${SPARQL_EDITOR}#query=${encodeURIComponent(query)}&requestMethod=POST`
    : null;
};
