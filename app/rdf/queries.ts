import { ascending, index } from "d3-array";
import { Maybe } from "graphql-tools";
import keyBy from "lodash/keyBy";
import mapKeys from "lodash/mapKeys";
import { CubeDimension, Filter, LookupSource, View } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { Filters, FilterValueMulti } from "@/config-types";
import {
  Observation,
  ObservationValue,
  parseObservationValue,
  shouldLoadMinMaxValues,
} from "@/domain/data";
import { isMostRecentValue } from "@/domain/most-recent-value";
import { PromiseValue, truthy } from "@/domain/types";
import {
  ComponentId,
  parseComponentId,
  stringifyComponentId,
} from "@/graphql/make-component-id";
import { resolveDimensionType } from "@/graphql/resolvers";
import {
  ResolvedDimension,
  ResolvedObservationsQuery,
} from "@/graphql/shared-types";
import { createSource, pragmas } from "@/rdf/create-source";
import { ExtendedCube } from "@/rdf/extended-cube";
import { getDimensionLimits } from "@/rdf/limits";
import * as ns from "@/rdf/namespace";
import { parseCubeDimension, parseRelatedDimensions } from "@/rdf/parse";
import { queryCubeUnversionedIri } from "@/rdf/query-cube-unversioned-iri";
import {
  loadDimensionsValuesWithMetadata,
  loadMaxDimensionValue,
  loadMinMaxDimensionValues,
} from "@/rdf/query-dimension-values";
import { loadUnversionedResources } from "@/rdf/query-sameas";
import { loadUnits } from "@/rdf/query-unit-labels";
import { getQueryLocales } from "@/rdf/query-utils";

const DIMENSION_VALUE_UNDEFINED = ns.cube.Undefined.value;

/** Adds a suffix to an iri to mark its label */
const labelDimensionIri = (iri: string) => `${iri}/__label__`;
const iriDimensionIri = (iri: string) => `${iri}/__iri__`;

const getDimensionUnits = (d: CubeDimension) => {
  // Keeping qudt:unit format for backwards compatibility.
  const t = d.out(ns.qudt.unit).term ?? d.out(ns.qudt.hasUnit).term;

  return t ? [t] : [];
};

export const getCubeDimensions = async ({
  cube,
  locale,
  sparqlClient,
  unversionedCubeIri,
  componentIris,
  cache,
}: {
  cube: ExtendedCube;
  locale: string;
  sparqlClient: ParsingClient;
  unversionedCubeIri: string;
  componentIris?: Maybe<string[]>;
  cache: LRUCache | undefined;
}): Promise<ResolvedDimension[]> => {
  try {
    const dimensions = cube.dimensions
      .filter(isObservationDimension)
      .filter((d) => {
        if (componentIris) {
          const iri = d.path?.value;

          return (
            componentIris.includes(iri) ||
            parseRelatedDimensions(d).some((r) => componentIris.includes(r.iri))
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

    const limits = await createCubeDimensionLimitsLoader({
      locale,
      unversionedCubeIri,
      sparqlClient,
    })(dimensions);

    return dimensions
      .map((dim, i) => {
        return parseCubeDimension({
          dim,
          cube,
          locale,
          units: dimensionUnitIndex,
          limits: limits[i],
        });
      })
      .sort((a, b) => ascending(a.data.order, b.data.order));
  } catch (e) {
    console.error(e);

    return [];
  }
};

export const createCubeDimensionLimitsLoader =
  (options: {
    locale: string;
    unversionedCubeIri: string;
    sparqlClient: ParsingClient;
  }) =>
  async (dimensions: readonly CubeDimension[]) => {
    return Promise.all(
      dimensions.map((dimension) => getDimensionLimits(dimension, options))
    );
  };

export const createCubeDimensionValuesLoader =
  (
    sparqlClient: ParsingClient,
    cache: LRUCache | undefined,
    filters?: Filters
  ) =>
  async (resolvedDimensions: readonly ResolvedDimension[]) => {
    return await getCubeDimensionsValues(resolvedDimensions, {
      sparqlClient,
      filters,
      cache,
    });
  };

const getCubeDimensionsValues = async (
  resolvedDimensions: readonly ResolvedDimension[],
  {
    sparqlClient,
    filters,
    cache,
  }: {
    sparqlClient: ParsingClient;
    filters?: Filters;
    cache: LRUCache | undefined;
  }
) => {
  const dimensionIris = resolvedDimensions.map((d) => d.data.iri);
  const { minMaxDimensions, regularDimensions } = resolvedDimensions.reduce<{
    minMaxDimensions: ResolvedDimension[];
    regularDimensions: ResolvedDimension[];
  }>(
    (acc, dimension) => {
      if (shouldLoadMinMaxValues(dimension)) {
        acc.minMaxDimensions.push(dimension);
      } else {
        acc.regularDimensions.push(dimension);
      }

      return acc;
    },
    { minMaxDimensions: [], regularDimensions: [] }
  );

  const result = await Promise.all([
    getMinMaxDimensionsValues(minMaxDimensions, {
      sparqlClient,
      cache,
    }),
    getRegularDimensionsValues(regularDimensions, {
      sparqlClient,
      filters,
      cache,
    }),
  ]);

  return result
    .flat()
    .sort(
      (a, b) =>
        dimensionIris.indexOf(a.dimensionIri) -
        dimensionIris.indexOf(b.dimensionIri)
    )
    .map(({ values }) => values);
};

const getMinMaxDimensionsValues = async (
  resolvedDimensions: ResolvedDimension[],
  {
    sparqlClient,
    cache,
  }: {
    sparqlClient: ParsingClient;
    cache: LRUCache | undefined;
  }
) => {
  return await Promise.all(
    resolvedDimensions.map(async (resolvedDimension) => {
      return {
        dimensionIri: resolvedDimension.data.iri,
        values: await getMinMaxDimensionValues(resolvedDimension, {
          sparqlClient,
          cache,
        }),
      };
    })
  );
};

const getMinMaxDimensionValues = async (
  resolvedDimension: ResolvedDimension,
  {
    sparqlClient,
    cache,
  }: {
    sparqlClient: ParsingClient;
    cache: LRUCache | undefined;
  }
) => {
  const { dimension, cube } = resolvedDimension;
  const { minInclusive, maxInclusive } = dimension;

  if (
    typeof minInclusive !== "undefined" &&
    typeof maxInclusive !== "undefined"
  ) {
    const min = parseObservationValue({ value: minInclusive }) ?? 0;
    const max = parseObservationValue({ value: maxInclusive }) ?? 0;

    return [
      { value: min, label: `${min}` },
      { value: max, label: `${max}` },
    ];
  }

  // Try to get min/max values from a list of values.
  let listItemPointer = dimension.out(ns.sh.or);

  while (
    listItemPointer.out(ns.rdf.rest).value &&
    // Only try until we reach the end of the list.
    !listItemPointer.out(ns.rdf.rest).term?.equals(ns.rdf.nil)
  ) {
    const item = listItemPointer.out(ns.rdf.first);
    const itemMin = item.out(ns.sh.minInclusive);
    const itemMax = item.out(ns.sh.maxInclusive);

    if (
      typeof itemMin.value !== "undefined" &&
      typeof itemMax.value !== "undefined"
    ) {
      const min = +itemMin.value;
      const max = +itemMax.value;

      return [
        { value: min, label: `${min}` },
        { value: max, label: `${max}` },
      ];
    }
    listItemPointer = listItemPointer.out(ns.rdf.rest);
  }

  if (cube.term && dimension.path) {
    const result = await loadMinMaxDimensionValues({
      datasetIri: cube.term.value,
      dimensionIri: dimension.path.value,
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
};

const getRegularDimensionsValues = async (
  resolvedDimensions: ResolvedDimension[],
  {
    sparqlClient,
    filters,
    cache,
  }: {
    sparqlClient: ParsingClient;
    filters?: Filters;
    cache: LRUCache | undefined;
  }
) => {
  if (resolvedDimensions.length === 0) {
    return [];
  }

  // `cube` and `locale` are the same for all dimensions
  const { cube, locale } = resolvedDimensions[0];
  const cubeIri = cube.term?.value!;

  return await loadDimensionsValuesWithMetadata(cubeIri, {
    dimensionIris: resolvedDimensions.map((d) => d.data.iri),
    cubeDimensions: cube.dimensions,
    sparqlClient,
    filters,
    locale,
    cache,
  });
};

type NonNullableValues<T, K extends keyof T> = Omit<T, K> & {
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

export const dimensionIsVersioned = (dimension: CubeDimension) =>
  !!dimension.out(ns.schema.version)?.value;

export const getCubeObservations = async ({
  cube,
  locale,
  sparqlClient,
  filters,
  preview,
  limit,
  raw,
  componentIris,
  cache,
}: {
  cube: ExtendedCube;
  locale: string;
  sparqlClient: ParsingClient;
  /** Observations filters that should be considered */
  filters?: Filters | null;
  /** Enable performance preview mode. Useful when there is no need to filter or
   * sort the observations to significantly improve performance.
   */
  preview?: boolean | null;
  /** Limit on the number of observations returned */
  limit?: number | null;
  /** Returns IRIs instead of labels for NamedNodes  */
  raw?: boolean;
  componentIris?: Maybe<string[]>;
  cache: LRUCache | undefined;
}): Promise<ResolvedObservationsQuery["data"]> => {
  console.log("getCubeObservations", {
    cube,
    filters,
  });
  const cubeIri = cube.term?.value!;
  const cubeView = View.fromCube(cube, false);
  const unversionedCubeIri =
    (await queryCubeUnversionedIri(sparqlClient, cubeIri)) ?? cubeIri;
  const allResolvedDimensions = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    unversionedCubeIri,
    cache,
  });
  console.log({ allResolvedDimensions, cubeIri: cube.term?.value });
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

  for (const [k, v] of Object.entries(filters ?? {})) {
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
    ? await buildFilters({
        cube,
        view: cubeView,
        filters: dbFilters,
        locale,
        sparqlClient,
        cache,
      })
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

  // In order to fix an error with cartesian products introduced in preview query
  // when using #pragma join.hash off, we need to have a clean source without
  // decorating the sparql client. However we still need to keep the pragmas
  // for the full query, to vastly improve performance.
  observationsView.getMainSource = preview
    ? () => createSource(sparqlClient)
    : cubeView.getMainSource;

  const { query, observationsRaw } = await fetchViewObservations({
    preview,
    limit,
    observationsView,
    disableDistinct: !filters || Object.keys(filters).length === 0,
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
    observations: observations.map((obs) =>
      mapKeys(obs, (_, iri) =>
        stringifyComponentId({
          unversionedCubeIri,
          unversionedComponentIri: iri,
        })
      )
    ),
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
  return dim.out(ns.cubeMeta.inHierarchy).values.length > 0;
};

const buildFilters = async ({
  cube,
  view,
  filters,
  locale,
  sparqlClient,
  cache,
}: {
  cube: ExtendedCube;
  view: View;
  filters: Filters;
  locale: string;
  sparqlClient: ParsingClient;
  cache: LRUCache | undefined;
}): Promise<Filter[]> => {
  const lookupSource = LookupSource.fromSource(cube.source);
  lookupSource.queryPrefix = pragmas;

  return await Promise.all(
    Object.entries(filters).flatMap(async ([filterComponentId, filter]) => {
      const iri =
        parseComponentId(filterComponentId as ComponentId)
          .unversionedComponentIri ?? filterComponentId;
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

      const resolvedDimension = parseCubeDimension({
        dim: cubeDimension,
        cube,
        locale,
        // We don't need to know the limits when filtering.
        limits: [],
      });

      const { dataType, dataKind, scaleType, timeUnit, related } =
        resolvedDimension.data;
      const dimensionType = resolveDimensionType(
        dataKind,
        scaleType,
        timeUnit,
        related
      );

      if (ns.rdf.langString.value === dataType) {
        throw Error(
          `Dimension <${iri}> has dataType 'langString', which is not supported by Visualize. In order to fix it, change the dataType to 'string' in the cube definition.`
        );
      }

      const dimensionHasHierarchy = hasHierarchy(cubeDimension);
      const toRDFValue = (d: string): NamedNode | Literal => {
        return dataType && !dimensionHasHierarchy
          ? resolvedDimension.data.hasUndefinedValues &&
            d === DIMENSION_VALUE_UNDEFINED
            ? rdf.literal("", ns.cube.Undefined)
            : rdf.literal(d, dataType)
          : rdf.namedNode(d);
      };

      switch (filter.type) {
        case "single": {
          if (isMostRecentValue(filter.value)) {
            const maxValue = await loadMaxDimensionValue(cube.term?.value!, {
              dimensionIri: resolvedDimension.data.iri,
              cubeDimensions: cube.dimensions,
              sparqlClient,
              filters,
              cache,
            });

            return [filterDimension.filter.eq(toRDFValue(maxValue))];
          }

          return [filterDimension.filter.eq(toRDFValue(`${filter.value}`))];
        }
        case "multi": {
          // If values is an empty object, we filter by something that doesn't exist
          return [
            filterDimension.filter.in(
              Object.keys(filter.values).length > 0
                ? Object.entries(filter.values).flatMap(([iri, selected]) =>
                    selected ? [toRDFValue(iri)] : []
                  )
                : [rdf.namedNode("EMPTY_VALUE")]
            ),
          ];
        }
        case "range": {
          const isTemporalEntityDimension =
            dimensionType === "TemporalEntityDimension";
          const maxValue = isMostRecentValue(filter.to)
            ? await loadMaxDimensionValue(cube.term?.value!, {
                dimensionIri: resolvedDimension.data.iri,
                cubeDimensions: cube.dimensions,
                sparqlClient,
                filters,
                cache,
              })
            : filter.to;

          if (!isTemporalEntityDimension) {
            return [
              filterDimension.filter.gte(toRDFValue(filter.from)),
              filterDimension.filter.lte(toRDFValue(maxValue)),
            ];
          }

          const filterDimensionPosition = view.createDimension({
            source: lookupSource,
            path: ns.schema.position,
            join: filterDimension,
            as: labelDimensionIri(`${iri}/__position__`),
          });

          return [
            filterDimensionPosition.filter.gte(
              rdf.literal(filter.from, ns.xsd.string)
            ),
            filterDimensionPosition.filter.lte(
              rdf.literal(maxValue, ns.xsd.string)
            ),
          ];
        }
        default:
          const _exhaustiveCheck: never = filter;
          return _exhaustiveCheck;
      }
    })
  ).then((d) => d.flat());
};

type ObservationRaw = Record<string, Literal | NamedNode>;

async function fetchViewObservations({
  preview,
  limit,
  observationsView,
  disableDistinct,
}: {
  preview?: boolean | null;
  limit?: number | null;
  observationsView: View;
  disableDistinct: boolean;
}) {
  /**
   * Add LIMIT to query
   */
  if (!preview && limit !== undefined) {
    // From https://github.com/zazuko/cube-creator/blob/a32a90ff93b2c6c1c5ab8fd110a9032a8d179670/apis/core/lib/domain/observations/lib/index.ts#L41
    observationsView.ptr.addOut(ns.cubeView.projection, (projection: $FixMe) =>
      projection.addOut(ns.cubeView.limit, limit)
    );
  }

  console.log(observationsView);

  const fullQuery = observationsView.observationsQuery({ disableDistinct });
  const query = pragmas
    .concat(
      preview && limit ? fullQuery.previewQuery({ limit }) : fullQuery.query
    )
    .toString();

  let observationsRaw: PromiseValue<ObservationRaw[]> | undefined;

  try {
    observationsRaw = await (preview && limit
      ? observationsView.preview({ limit })
      : observationsView.observations({ disableDistinct }));
  } catch (e) {
    console.warn("Observations query failed!", query);
    throw Error(
      `Could not retrieve data: ${e instanceof Error ? e.message : e}`
    );
  }

  return {
    query,
    observationsRaw,
  };
}

type RDFObservation = Record<string, Literal | NamedNode<string>>;

function parseObservation(
  cubeDimensions: ResolvedDimension[],
  raw: boolean | undefined
): (value: RDFObservation) => Observation {
  return (obs) => {
    const res = {} as Observation;

    for (const d of cubeDimensions) {
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
      res[d.data.iri] = raw ? rawValue : (label ?? value ?? null);
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
  cube: ExtendedCube;
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
