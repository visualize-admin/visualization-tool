import { CONSTRUCT } from "@tpluscode/sparql-builder";
import { descending, group, index, rollups } from "d3";
import { Maybe } from "graphql-tools";
import keyBy from "lodash/keyBy";
import {
  Cube,
  CubeDimension,
  Filter,
  LookupSource,
  View,
} from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode, Quad } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { PromiseValue, truthy } from "@/domain/types";
import { pragmas } from "@/rdf/create-source";

import { FilterValueMulti, Filters } from "../configurator";
import {
  DimensionValue,
  Observation,
  ObservationValue,
  parseObservationValue,
  parseRDFLiteral,
  shouldLoadMinMaxValues,
} from "../domain/data";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";

import * as ns from "./namespace";
import { schema } from "./namespace";
import {
  getQueryLocales,
  getScaleType,
  isCubePublished,
  parseCube,
  parseCubeDimension,
  parseRelatedDimensions,
} from "./parse";
import {
  loadDimensionValues,
  loadMinMaxDimensionValues,
} from "./query-dimension-values";
import { loadResourceLabels } from "./query-labels";
import { loadResourceLiterals } from "./query-literals";
import { loadUnversionedResources } from "./query-sameas";
import { loadUnits } from "./query-unit-labels";

const DIMENSION_VALUE_UNDEFINED = ns.cube.Undefined.value;

/** Adds a suffix to an iri to mark its label */
const labelDimensionIri = (iri: string) => `${iri}/__label__`;
const iriDimensionIri = (iri: string) => `${iri}/__iri__`;

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

export const getResolvedCube = async ({
  cube,
  locale,
  latest = true,
}: {
  cube: Cube;
  locale: string;
  latest?: boolean;
}): Promise<ResolvedDataCube | null> => {
  const latestCube = latest === false ? cube : await getLatestCube(cube);
  return parseCube({ cube: latestCube, locale });
};

const getDimensionUnits = (d: CubeDimension) => {
  const t = d.out(ns.qudt.unit).term;
  return t ? [t] : [];
};

export const getCubeDimensions = async ({
  cube,
  locale,
  sparqlClient,
  componentIris,
  cache,
}: {
  cube: Cube;
  locale: string;
  sparqlClient: ParsingClient;
  componentIris?: Maybe<string[]>;
  cache: LRUCache | undefined;
}): Promise<ResolvedDimension[]> => {
  try {
    const dimensions = cube.dimensions
      .filter(isObservationDimension)
      .filter((d) => {
        if (componentIris) {
          return (
            componentIris.includes(d.path.value) ||
            parseRelatedDimensions(d).some((r) =>
              componentIris?.includes(r.iri)
            )
          );
        }

        return true;
      });

    const dimensionUnits = dimensions.flatMap(getDimensionUnits);

    const dimensionUnitIndex = index(
      await loadUnits({
        ids: dimensionUnits,
        locale: "en", // No other locales exist yet
        sparqlClient,
        cache,
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
  (
    sparqlClient: ParsingClient,
    cache: LRUCache | undefined,
    filters?: Filters
  ) =>
  async (dimensions: readonly ResolvedDimension[]) => {
    const result: DimensionValue[][] = [];

    for (const dimension of dimensions) {
      const dimensionValues = await getCubeDimensionValues({
        sparqlClient,
        rdimension: dimension,
        filters,
        cache,
      });
      result.push(dimensionValues);
    }

    return result;
  };

export const getCubeDimensionValues = async ({
  sparqlClient,
  rdimension,
  filters,
  cache,
}: {
  sparqlClient: ParsingClient;
  rdimension: ResolvedDimension;
  filters?: Filters;
  cache: LRUCache | undefined;
}): Promise<DimensionValue[]> => {
  const { dimension, cube, locale, data } = rdimension;

  if (
    typeof dimension.minInclusive !== "undefined" &&
    typeof dimension.maxInclusive !== "undefined" &&
    data.dataKind !== "Time" &&
    data.scaleType !== "Ordinal"
  ) {
    const min = parseObservationValue({ value: dimension.minInclusive }) ?? 0;
    const max = parseObservationValue({ value: dimension.maxInclusive }) ?? 0;

    return [
      { value: min, label: `${min}` },
      { value: max, label: `${max}` },
    ];
  }

  if (shouldLoadMinMaxValues(rdimension)) {
    if (cube.term && dimension.path) {
      const result = await loadMinMaxDimensionValues({
        datasetIri: cube.term,
        dimensionIri: dimension.path,
        sparqlClient,
        cache,
      });

      if (result) {
        const [min, max] = result;

        return [
          { value: min, label: `${min}` },
          { value: max, label: `${max}` },
        ];
      }

      return [];
    }

    return [];
  }

  return await getCubeDimensionValuesWithMetadata({
    dimension,
    cube,
    sparqlClient,
    locale,
    filters,
    cache,
  });
};

export const dimensionIsVersioned = (dimension: CubeDimension) =>
  dimension.out(ns.schema.version)?.value ? true : false;

type DimensionPredicate = keyof DimensionValue | "sameAs";

const getDimensionPredicate = (predicate: string): DimensionPredicate => {
  switch (predicate) {
    case "value":
      return "value";
    case ns.schema.identifier.value:
      return "identifier";
    case ns.schema.name.value:
      return "label";
    case ns.schema.alternateName.value:
      return "alternateName";
    case ns.schema.description.value:
      return "description";
    case ns.schema.position.value:
      return "position";
    case ns.schema.color.value:
      return "color";
    case ns.schema.sameAs.value:
      return "sameAs";
    default:
      throw new Error(`Unknown predicate: ${predicate}`);
  }
};

export const getCubeDimensionValuesWithMetadata = async ({
  dimension,
  cube,
  sparqlClient,
  locale,
  filters,
  cache,
}: {
  dimension: CubeDimension;
  cube: Cube;
  sparqlClient: ParsingClient;
  locale: string;
  filters?: Filters;
  cache: LRUCache | undefined;
}): Promise<DimensionValue[]> => {
  const load = async () => {
    const loaders = [
      filters ? undefined : () => dimension.in ?? [],
      () =>
        loadDimensionValues(
          { datasetIri: cube.term, dimension, cube, sparqlClient },
          filters
        ),
    ].filter(truthy);

    for (const loader of loaders) {
      const dimensionValues = await loader();

      if (dimensionValues.length) {
        const grouped = group(dimensionValues, (d) => {
          if (d.equals(ns.cube.Undefined)) {
            return "undefined";
          }
          return d.termType;
        });

        const namedNodes = (grouped.get("NamedNode") ?? []) as Array<NamedNode>;
        const literals = (grouped.get("Literal") ?? []) as Array<Literal>;
        const undValues = (grouped.get("undefined") ?? []) as Array<NamedNode>;

        if (namedNodes?.length || literals?.length) {
          return { namedNodes, literals, undValues };
        }
      }
    }

    return { namedNodes: [], literals: [], undValues: [] };
  };

  const { namedNodes, literals, undValues } = await load();

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

  const result: DimensionValue[] = [];

  /**
   * If the dimension is versioned, we're loading the "unversioned" values to store in the config,
   * so cubes can be upgraded to newer versions without the filters breaking.
   */

  if (namedNodes.length > 0) {
    const query: any = CONSTRUCT`
    ?s ${ns.schema.identifier} ?identifier .
    ?s ${ns.schema.name} ?name .
    ?s ${ns.schema.alternateName} ?alternateName .
    ?s ${ns.schema.description} ?description .
    ?s ${ns.schema.position} ?position .
    ?s ${ns.schema.color} ?color .
    ?s ${ns.schema.sameAs} ?sameAs .
  `.WHERE`
    VALUES ?s {
      ${namedNodes.map((d) => `<${d.value}>`).join(`\n`)}
    }
    {
      ?s schema:identifier ?identifier .
    }
    UNION {
      ?s schema:name ?name .
      FILTER(LANG(?name) = "${locale}" || LANG(?name) = "")
    }
    UNION {
      ?s schema:alternateName ?alternateName .
      FILTER(LANG(?alternateName) = "${locale}" || LANG(?alternateName) = "")
    }
    UNION {
      ?s schema:description ?description .
      FILTER(LANG(?description) = "${locale}" || LANG(?description) = "")
    }
    UNION {
      ?s schema:position ?position .
    }
    UNION {
      ?s schema:color ?color .
    }
    UNION {
      ?s schema:sameAs ?sameAs .
    }`;

    await executeWithCache(sparqlClient, query, cache, (queryResult) => {
      const parsed: Record<DimensionPredicate, ObservationValue>[] =
        queryResult.map((d: Quad) => {
          const key = getDimensionPredicate(d.predicate.value);

          return {
            value: d.subject.value,
            [key]:
              d.object.termType === "Literal"
                ? parseRDFLiteral(d.object)
                : d.object.value,
          };
        });

      const grouped = rollups(
        parsed,
        (v) => Object.assign({}, ...v),
        (d) => d.value
      ) as [ObservationValue, Record<DimensionPredicate, ObservationValue>][];

      for (const [_, { sameAs, value, ...rest }] of grouped) {
        result.push({
          ...rest,
          value: sameAs ?? value,
        } as DimensionValue);
      }
    });

  } else if (literals.length > 0) {
    literals.forEach(({ value }) =>
      result.push({
        value,
        label: value,
      })
    );
  }

  if (undValues.length > 0) {
    result.push({
      value: DIMENSION_VALUE_UNDEFINED, // We use a known string here because actual null does not work as value in UI inputs.
      label: "–",
    });
  }

  return result;
};

type NonNullableValues<T, K extends keyof T> = Omit<T, K> &
  {
    [P in K]-?: NonNullable<T[P]>;
  };

type CubeDimensionWithPath = NonNullableValues<CubeDimension, "path">;

const isObservationDimension = (
  dim: CubeDimension
): dim is CubeDimensionWithPath =>
  !!(
    dim.path &&
    ![ns.rdf.type.value, ns.cube.observedBy.value].includes(
      dim.path.value ?? ""
    )
  );

export const getCubeObservations = async ({
  cube,
  locale,
  sparqlClient,
  filters,
  limit,
  raw,
  componentIris,
  cache,
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
  componentIris?: Maybe<string[]>;
  cache: LRUCache | undefined;
}): Promise<{
  query: string;
  observations: Observation[];
  observationsRaw: Record<string, Literal | NamedNode>[];
}> => {
  const cubeView = View.fromCube(cube, false);

  const allResolvedDimensions = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    cache,
  });

  const resolvedDimensions = allResolvedDimensions.filter((d) => {
    if (componentIris) {
      return (
        componentIris.includes(d.data.iri) ||
        d.data.related.find((r) => componentIris?.includes(r.iri))
      );
    }

    return true;
  });
  const resolvedDimensionsByIri = keyBy(resolvedDimensions, (d) => d.data.iri);

  componentIris = resolvedDimensions.map((d) => d.data.iri);

  const serverFilters: Record<string, FilterValueMulti> = {};
  let dbFilters: typeof filters = {};

  for (const [k, v] of Object.entries(filters || {})) {
    if (v.type !== "multi") {
      dbFilters[k] = v;
    } else {
      const count = Object.keys(v.values).length;
      if (count > 100) {
        console.log(
          `Will apply server side filter since filter values count is too high, iri: ${k}, count: ${count}`
        );
        serverFilters[k] = v;
      } else {
        dbFilters[k] = v;
      }
    }
  }

  const observationFilters = filters
    ? buildFilters({ cube, view: cubeView, filters: dbFilters, locale })
    : [];

  const observationDimensions = buildDimensions({
    cubeView,
    dimensionIris: componentIris,
    resolvedDimensions,
    cube,
    locale,
    observationFilters,
    raw,
  });

  const observationsView = new View({
    dimensions: observationDimensions,
    filters: observationFilters,
  });

  const { query, observationsRaw } = await fetchViewObservations({
    limit,
    observationsView,
    disableDistinct: !!(!filters || Object.keys(filters).length === 0),
  });

  const serverFilter =
    Object.keys(serverFilters).length > 0
      ? makeServerFilter(serverFilters)
      : null;
  const filteredObservationsRaw: typeof observationsRaw = [];
  const observations: Observation[] = [];
  const observationParser = parseObservation(resolvedDimensions, raw);

  // As we keep unversioned values in the config, and fetch versioned values in the
  // observations, we need to unversion the observations to match the filters.
  const unversionedServerFilters = serverFilter
    ? await unversionServerFilters(serverFilters, {
        observationsRaw,
        resolvedDimensionsByIri,
        sparqlClient,
        cache,
      })
    : null;

  for (const d of observationsRaw) {
    if (
      !serverFilter ||
      serverFilter(d) ||
      (unversionedServerFilters &&
        serverFilter({
          ...d,
          // Unversion the values to match the unversioned filters.
          ...Object.entries(unversionedServerFilters).reduce(
            (acc, [iri, values]) => {
              const value = d[iri];
              const unversionedValue = values[value.value].sameAs;

              return {
                ...acc,
                [iri]: unversionedValue ?? value,
              };
            },
            {}
          ),
        }))
    ) {
      const obs = observationParser(d);
      observations.push(obs);
      filteredObservationsRaw.push(d);
    }
  }

  return {
    query,
    observationsRaw: serverFilter ? filteredObservationsRaw : observationsRaw,
    observations,
  };
};

const makeServerFilter = (filters: Record<string, FilterValueMulti>) => {
  const sets = new Map<string, Set<ObservationValue>>();

  for (const [iri, filter] of Object.entries(filters)) {
    const valueSet = new Set(Object.keys(filter.values));
    sets.set(iri, valueSet);
  }

  return (d: RDFObservation) => {
    for (const [iri, valueSet] of sets.entries()) {
      return valueSet.has(d[iri]?.value);
    }

    return true;
  };
};

const unversionServerFilters = async (
  serverFilters: Record<string, FilterValueMulti>,
  {
    observationsRaw,
    resolvedDimensionsByIri,
    sparqlClient,
    cache,
  }: {
    observationsRaw: RDFObservation[];
    resolvedDimensionsByIri: Record<string, ResolvedDimension>;
    sparqlClient: ParsingClient;
    cache: LRUCache | undefined;
  }
) => {
  const unversionedServerFilters = await Promise.all(
    Object.keys(serverFilters).map(async (iri) => {
      const resolvedDimension = resolvedDimensionsByIri[iri];

      if (
        resolvedDimension &&
        dimensionIsVersioned(resolvedDimension.dimension)
      ) {
        const unversionedValues = await loadUnversionedResources({
          ids: observationsRaw
            .map((d) => rdf.namedNode(d[iri]?.value))
            .filter(truthy),
          sparqlClient,
          cache,
        });
        const unversionedValuesByValue = keyBy(
          unversionedValues,
          (d) => d.iri.value
        );

        return [iri, unversionedValuesByValue] as const;
      }
    })
  ).then((d) => d.filter(truthy));

  return Object.fromEntries(unversionedServerFilters);
};

// Experimental method to unversion a dimension value locally. To be used / removed
// once we have a confirmation from Zazuko that this works.
// https://zulip.zazuko.com/#narrow/stream/32-bar-ld-ext/topic/unversioning.20dimension.20values
// const unversionValue = (
//   d: string,
//   props: {
//     resolvedDimension: ResolvedDimension;
//   }
// ) => {
//   const { resolvedDimension } = props;
//   const { cube, dimension } = resolvedDimension;

//   // If dimension is versioned, the cube must be versioned too.
//   if (dimensionIsVersioned(dimension)) {
//     const versionedCubeIri = cube.term?.value ?? "";
//     const unversionedCubeIri = versionedCubeIri
//       .split("/")
//       // Remove the version number.
//       .slice(0, -1)
//       .join("/");

//     return `${unversionedCubeIri}/${d.replace(versionedCubeIri + "/", "")}`;
//   }

//   return d;
// };

// const unversioned = Object.fromEntries(
//   Object.entries(d).map(([k, v]) => {
//     const dim = cubeDimensionsByIri[k];

//     if (dim) {
//       const unversionedValue = unversionValue(v.value, {
//         resolvedDimension: dim,
//       });

//       return [k, rdf.namedNode(unversionedValue)];
//     }

//     return [k, v];
//   })
// );

export const hasHierarchy = (dim: CubeDimension) => {
  return (
    dim.out(ns.cubeMeta.inHierarchy).values.length > 0 ||
    dim.out(ns.cubeMeta.hasHierarchy).values.length > 0
  );
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

  return Object.entries(filters).flatMap(([iri, filter]) => {
    const cubeDimension = cube.dimensions.find((d) => d.path?.value === iri);

    if (!cubeDimension) {
      console.warn(`WARNING: No cube dimension ${iri}`);
      return [];
    }

    const dimension = view.dimension({ cubeDimension: iri });

    if (!dimension) {
      console.warn(`WARNING: No dimension ${iri}`);
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
          as: labelDimensionIri(`${iri}/__sameAs__`), // Just a made up dimension name that is used in the generated query but nowhere else
        })
      : dimension;

    const parsedCubeDimension = parseCubeDimension({
      dim: cubeDimension,
      cube,
      locale,
    });

    const { dataType } = parsedCubeDimension.data;

    if (ns.rdf.langString.value === dataType) {
      throw new Error(
        `Dimension <${iri}> has dataType 'langString', which is not supported by Visualize. In order to fix it, change the dataType to 'string' in the cube definition.`
      );
    }

    const dimensionHasHierarchy = hasHierarchy(cubeDimension);
    const toRDFValue = (d: string): NamedNode | Literal => {
      return dataType && !dimensionHasHierarchy
        ? parsedCubeDimension.data.hasUndefinedValues &&
          d === DIMENSION_VALUE_UNDEFINED
          ? rdf.literal("", ns.cube.Undefined)
          : rdf.literal(d, dataType)
        : rdf.namedNode(d);
    };

    return filter.type === "single"
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
              ? Object.entries(filter.values).flatMap(([iri, selected]) =>
                  selected ? [toRDFValue(iri)] : []
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
  });
};

async function fetchViewObservations({
  limit,
  observationsView,
  disableDistinct,
}: {
  limit: number | undefined;
  observationsView: View;
  disableDistinct: boolean;
}) {
  /**
   * Add LIMIT to query
   */
  if (limit !== undefined) {
    // From https://github.com/zazuko/cube-creator/blob/a32a90ff93b2c6c1c5ab8fd110a9032a8d179670/apis/core/lib/domain/observations/lib/index.ts#L41
    observationsView.ptr.addOut(ns.cubeView.projection, (projection: $FixMe) =>
      projection.addOut(ns.cubeView.limit, limit)
    );
  }

  const queryOptions = {
    disableDistinct,
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

  return { query, observationsRaw };
}

type RDFObservation = Record<string, Literal | NamedNode<string>>;

function parseObservation(
  cubeDimensions: ResolvedDimension[],
  raw: boolean | undefined
): (value: RDFObservation) => Observation {
  return (obs) => {
    const res = {} as Observation;
    for (let d of cubeDimensions) {
      const label = obs[labelDimensionIri(d.data.iri)]?.value;
      const termType = obs[d.data.iri]?.termType;

      const value =
        termType === "Literal" &&
        ns.cube.Undefined.equals((obs[d.data.iri] as Literal)?.datatype)
          ? null
          : termType === "NamedNode" &&
            ns.cube.Undefined.equals(obs[d.data.iri])
          ? "–"
          : obs[d.data.iri]?.value;

      const rawValue = parseObservationValue({ value: obs[d.data.iri] });
      if (d.data.hasHierarchy) {
        res[iriDimensionIri(d.data.iri)] = obs[d.data.iri]?.value;
      }
      res[d.data.iri] = raw ? rawValue : label ?? value ?? null;
    }
    return res;
  };
}

function buildDimensions({
  cubeView,
  dimensionIris,
  resolvedDimensions,
  cube,
  locale,
  observationFilters,
  raw,
}: {
  cubeView: View;
  dimensionIris: Maybe<string[]>;
  resolvedDimensions: ResolvedDimension[];
  cube: Cube;
  locale: string;
  observationFilters: Filter[];
  raw?: boolean;
}) {
  const observationDimensions = cubeView.dimensions.filter((d) =>
    d.cubeDimensions.every(
      (cd) =>
        isObservationDimension(cd) &&
        (dimensionIris ? dimensionIris.includes(cd.path.value) : true)
    )
  );

  // Find dimensions which are NOT literal
  const namedDimensions = resolvedDimensions.filter(
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

  return observationDimensions;
}
