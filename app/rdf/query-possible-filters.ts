import { CubeDimension } from "rdf-cube-view-query";
import { NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { ResultRow } from "sparql-http-client/ResultParser";
import { LRUCache } from "typescript-lru-cache";

import { SingleFilters } from "@/config-types";
import { isMostRecentValue } from "@/domain/most-recent-value";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { PossibleFilterValue } from "@/graphql/query-hooks";
import * as ns from "@/rdf/namespace";
import { queryCubeUnversionedIri } from "@/rdf/query-cube-unversioned-iri";
import { loadMaxDimensionValue } from "@/rdf/query-dimension-values";
import { iriToNode } from "@/rdf/query-utils";

export const getPossibleFilters = async (
  cubeIri: string,
  options: {
    filters: SingleFilters;
    sparqlClient: ParsingClient;
    cache?: LRUCache;
  }
) => {
  const { filters, sparqlClient, cache } = options;
  const dimensionIris = Object.keys(filters);

  if (dimensionIris.length === 0) {
    console.warn("No filters provided, returning empty possible filters.");
    return [];
  }

  const [unversionedCubeIri = cubeIri, dimensionsMetadata] = await Promise.all([
    queryCubeUnversionedIri(sparqlClient, cubeIri),
    getDimensionsMetadata(cubeIri, dimensionIris, sparqlClient),
  ]);
  const queryFilters = await getQueryFilters(filters, {
    cubeIri,
    dimensionsMetadata,
    sparqlClient,
    cache,
  });
  const query = getQuery(cubeIri, queryFilters);
  const [observation] = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return parsePossibleFilters(observation, {
    unversionedCubeIri,
    queryFilters,
  });
};

export type DimensionMetadata = {
  iri: string;
  isVersioned: boolean;
  isLiteral: boolean;
};

const getDimensionsMetadata = async (
  cubeIri: string,
  dimensionIris: string[],
  sparqlClient: ParsingClient
): Promise<DimensionMetadata[]> => {
  const DIMENSION_IRI = "dimensionIri";
  const VERSION = "version";
  const NODE_KIND = "nodeKind";
  const query = `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>

SELECT ?${DIMENSION_IRI} ?${VERSION} ?${NODE_KIND} WHERE {
  <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
  ?dimension sh:path ?${DIMENSION_IRI} .
  OPTIONAL { ?dimension schema:version ?${VERSION} . }
  OPTIONAL { ?dimension sh:nodeKind ?${NODE_KIND} . }
  ${dimensionIris.length > 0 ? `FILTER(?${DIMENSION_IRI} IN (${dimensionIris.map(iriToNode).join(", ")}))` : ""}
}`;
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return results.map((result) => ({
    iri: result[DIMENSION_IRI].value,
    isVersioned: Boolean(result[VERSION]),
    isLiteral: result[NODE_KIND]?.value === ns.sh.Literal.value,
  }));
};

export const getQuery = (cubeIri: string, queryFilters: QueryFilter[]) => {
  return `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n
SELECT ${queryFilters.map(({ i, isVersioned }) => `?${getQueryDimension(i, isVersioned)}`).join(" ")} WHERE {
  <${cubeIri}> cube:observationSet/cube:observation ?observation .
${queryFilters
  .map(
    ({ i, iri, isVersioned, isLiteral }) =>
      `  ?observation <${iri}> ?${getQueryDimension(i)} .${isVersioned ? `\n  ${unversionDimension(i)} .` : ""}${isLiteral ? `\n  ${stringifyDimension(i, isVersioned)}` : ""}`
  )
  .join("\n")}
${queryFilters
  .map(({ i, value, isVersioned, isLiteral }) => {
    const queryDimension = getQueryDimension(i, isVersioned, isLiteral);
    return i === 0
      ? // A value for the first dimension must always be found, as it's a root
        // filter.
        `  VALUES ?${queryDimension} { ${getQueryValue(value, isLiteral)} }`
      : // For other dimensions, we try to find their values, but fall back in
        // case there is none.
        `  BIND(?${queryDimension} = ${getQueryValue(value, isLiteral)} AS ?d${i})`;
  })
  .join("\n")}
}
${
  // Ordering by the dimensions is only necessary if there at least one `d` variable.
  queryFilters.length > 1
    ? `ORDER BY ${
        // Order by the boolean `d` variables, so that the first result is the one
        // with the most matching dimensions, keeping the order of the dimensions
        // in mind, to mirror the cascading behavior of the filters.
        queryFilters
          .slice(1)
          .map(({ i }) => `DESC(?d${i})`)
          .join(" ")
      }`
    : ""
}
LIMIT 1`;
};

const getQueryDimension = (
  i: number,
  versioned?: boolean,
  literal?: boolean
) => {
  return `dimension${i}${versioned ? "_v" : ""}${literal ? "_str" : ""}`;
};

const unversionDimension = (i: number) => {
  return `?${getQueryDimension(i)} schema:sameAs ?${getQueryDimension(i, true)}`;
};

const stringifyDimension = (i: number, isVersioned: boolean) => {
  return `BIND(STR(?${getQueryDimension(i, isVersioned)}) AS ?${getQueryDimension(i, isVersioned, true)})`;
};

const getQueryValue = (value: string, isLiteral: boolean) => {
  return isLiteral ? `"${value}"` : iriToNode(value);
};

type QueryFilter = {
  i: number;
  iri: string;
  value: string;
  isVersioned: boolean;
  isLiteral: boolean;
};

export const getQueryFilters = async (
  filters: SingleFilters,
  options: {
    cubeIri: string;
    dimensionsMetadata: DimensionMetadata[];
    sparqlClient: ParsingClient;
    cache?: LRUCache;
  }
): Promise<QueryFilter[]> => {
  const { cubeIri, dimensionsMetadata, sparqlClient, cache } = options;

  return Promise.all(
    Object.entries(filters).map(async ([iri, { value }], i) => {
      const metadata = dimensionsMetadata.find((d) => d.iri === iri);
      const isVersioned = metadata?.isVersioned ?? false;
      const isLiteral = metadata?.isLiteral ?? false;

      return {
        i,
        iri,
        value: isMostRecentValue(value)
          ? await loadMaxDimensionValue(cubeIri, {
              dimensionIri: iri,
              // TODO: refactor dimension parsing to avoid "mocking" the cubeDimensions
              cubeDimensions: Object.keys(filters).map((iri) => ({
                path: { value: iri },
                datatype: isLiteral ? { value: ns.xsd.string } : null,
                out: (p: NamedNode) => {
                  switch (p.value) {
                    case ns.sh.nodeKind.value: {
                      return isLiteral
                        ? { value: ns.sh.Literal }
                        : { value: ns.sh.IRI };
                    }
                    case ns.sh.or.value: {
                      return {
                        terms: [],
                        list() {
                          return [];
                        },
                        toArray() {
                          return [];
                        },
                      };
                    }
                    case ns.sh.datatype.value: {
                      return {
                        terms: [],
                      };
                    }
                    case ns.schema.version.value: {
                      return isVersioned ? { value: true } : { value: false };
                    }
                  }
                },
              })) as any as CubeDimension[],
              filters,
              sparqlClient,
              cache,
            })
          : `${value}`,
        isVersioned,
        isLiteral,
      };
    })
  );
};

const parsePossibleFilters = (
  observation: ResultRow,
  {
    unversionedCubeIri,
    queryFilters,
  }: {
    unversionedCubeIri: string;
    queryFilters: QueryFilter[];
  }
): PossibleFilterValue[] => {
  return queryFilters.map(({ i, iri, isVersioned }) => ({
    __typename: "PossibleFilterValue",
    type: "single",
    id: stringifyComponentId({
      unversionedCubeIri,
      unversionedComponentIri: iri,
    }),
    value: observation[getQueryDimension(i, isVersioned)].value,
  }));
};
