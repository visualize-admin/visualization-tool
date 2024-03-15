import ParsingClient from "sparql-http-client/ParsingClient";
import { ResultRow } from "sparql-http-client/ResultParser";

import { SingleFilters } from "@/config-types";

export const getPossibleFilters = async (
  cubeIri: string,
  options: {
    filters: SingleFilters;
    sparqlClient: ParsingClient;
  }
) => {
  const { filters, sparqlClient } = options;
  const dimensionIris = Object.keys(filters);
  const versionedDimensionIris = await getVersionedDimensionIris(
    cubeIri,
    dimensionIris,
    sparqlClient
  );
  const queryFilters = getQueryFilters(filters, versionedDimensionIris);
  const query = getQuery(cubeIri, queryFilters);
  const [observation] = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return parsePossibleFilters(observation, queryFilters);
};

const getVersionedDimensionIris = async (
  cubeIri: string,
  dimensionIris: string[],
  sparqlClient: ParsingClient
) => {
  const DIMENSION_IRI = "dimensionIri";
  const query = `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>

SELECT ?${DIMENSION_IRI} WHERE {
  <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
  ?dimension sh:path ?dimensionIri .
  ?dimension schema:version ?version .
  FILTER(?${DIMENSION_IRI} IN (${dimensionIris.map((iri) => `<${iri}>`).join(", ")}))
}`;
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return results.map((result) => result[DIMENSION_IRI].value);
};

const DIMENSION = "dimension";

const getQueryDimension = (i: number, versioned: boolean) => {
  return `${DIMENSION}${i}${versioned ? "_v" : ""}`;
};

export const getQuery = (cubeIri: string, queryFilters: QueryFilter[]) => {
  return `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n
SELECT ${queryFilters.map(({ i, versioned }) => `?${getQueryDimension(i, versioned)}`).join(" ")} WHERE {
  <${cubeIri}> cube:observationSet/cube:observation ?observation .
${queryFilters
  .map(
    ({ i, iri, versioned }) =>
      `  ?observation <${iri}> ?${DIMENSION}${i} .${versioned ? `\n  ?${getQueryDimension(i, false)} schema:sameAs ?${getQueryDimension(i, true)} .` : ""}`
  )
  .join("\n")}
${queryFilters
  .map(({ i, value, versioned }) => {
    const queryDimension = getQueryDimension(i, versioned);
    return i === 0
      ? // A value for the first dimension must always be found, as it's a root
        // filter.
        `  VALUES ?${queryDimension} { <${value}> }`
      : // For other dimensions, we try to find their values, but fall back in
        // case there is none.
        `  BIND(?${queryDimension} = <${value}> AS ?d${i})`;
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

type QueryFilter = {
  i: number;
  iri: string;
  value: string;
  versioned: boolean;
};

export const getQueryFilters = (
  filters: SingleFilters,
  versionedDimensionIris: string[]
): QueryFilter[] => {
  return Object.entries(filters).map(([iri, value], i) => {
    return {
      i,
      iri,
      value: `${value.value}`,
      versioned: versionedDimensionIris.includes(iri),
    };
  });
};

const parsePossibleFilters = (
  observation: ResultRow,
  queryFilters: QueryFilter[]
) => {
  return queryFilters.map(({ i, iri, versioned }) => ({
    type: "single",
    iri,
    value: observation[getQueryDimension(i, versioned)].value,
  }));
};
