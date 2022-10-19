import { SELECT, sparql } from "@tpluscode/sparql-builder";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import { Cube, CubeDimension } from "rdf-cube-view-query";
import { Literal, NamedNode, Term } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { pragmas } from "@/rdf/create-source";

import { Filters } from "../configurator";

import { cube as cubeNs } from "./namespace";
import * as ns from "./namespace";
import { parseDimensionDatatype } from "./parse";
import { dimensionIsVersioned } from "./queries";
interface DimensionValue {
  value: Literal | NamedNode<string>;
}

/**
 * Formats a filter value into the right format, string literal
 * for dimensions with a datatype, and named node for shared
 * dimensions.
 */
const formatFilterValue = (
  value: string | number,
  dataType?: NamedNode<string>
) => {
  if (!dataType) {
    return `<${value}>`;
  } else {
    return `"${value}"`;
  }
};

const formatFilterIntoSparqlFilter = (
  filter: Filters[string],
  dimension: CubeDimension,
  versioned: boolean,
  index: number
) => {
  const suffix = versioned ? "_unversioned" : "";
  const dimensionVar = `?dimension${suffix}${index}`;
  const { dataType } = parseDimensionDatatype(dimension);

  // Shared dimensions have no dataType and the filter for values will be
  // done with a named node ?dimension1 = <value>, whereas for literal dimensions,
  // we use the str function to match on the string value of the value
  // (discarding the type information), since the type information is
  // not stored in the chart config filters
  const leftSide = dataType ? `str(${dimensionVar})` : dimensionVar;
  if (filter.type === "single") {
    const rightSide = formatFilterValue(filter.value, dataType);
    return `FILTER ( (${leftSide} = ${rightSide}) )`;
  } else if (filter.type === "multi") {
    return `FILTER ( (${leftSide} in (${Object.keys(filter.values)
      .map((x) => formatFilterValue(x, dataType))
      .join(",")}) ) )`;
  } else {
    return "";
  }
};

export async function unversionObservation({
  cube,
  observation,
  sparqlClient,
}: {
  cube: Cube;
  observation: Record<string, string | number | undefined | null>;
  sparqlClient: ParsingClient;
}) {
  const dimensionsByPath = keyBy(
    cube.dimensions,
    (x) => x.path?.value
  ) as Record<string, CubeDimension>;
  const versionedDimensions = Object.keys(observation).filter((x) =>
    dimensionIsVersioned(dimensionsByPath[x])
  );
  const query = SELECT.DISTINCT`?versioned ?unversioned`.WHERE`
    VALUES (?versioned) {
      ${versionedDimensions.map((x) => `(<${observation[x]}>)\n`)}
    }
    ?versioned ${ns.schema.sameAs} ?unversioned.
  `.prologue`${pragmas}`;

  const result = (await query.execute(sparqlClient.query, {
    operation: "postUrlencoded",
  })) as unknown as Array<{
    versioned: NamedNode<string>;
    unversioned: NamedNode<string>;
  }>;

  const unversionedIndex = result.reduce((prev, item) => {
    prev[item.versioned.value] = item.unversioned.value;
    return prev;
  }, {} as Record<string, string>);

  return mapValues(observation, (v) => (v ? unversionedIndex[v] || v : v));
}

/**
 * Load dimension values.
 *
 * Filters on other dimensions can be passed.
 *
 */
export async function loadDimensionValues(
  {
    datasetIri,
    dimension,
    cube,
    sparqlClient,
  }: {
    datasetIri: Term | undefined;
    dimension: CubeDimension;
    cube: Cube;
    sparqlClient: ParsingClient;
  },
  filters?: Filters
): Promise<Array<Literal | NamedNode>> {
  const dimensionIri = dimension.path;

  let allFiltersList = filters ? Object.entries(filters) : [];

  // Consider filters before the current filter to fetch the values for
  // the current filter
  const filterList = allFiltersList.slice(
    0,
    allFiltersList.findIndex(([iri]) => iri == dimensionIri?.value)
  );

  const query = SELECT.DISTINCT`?value`.WHERE`
    ${datasetIri} ${cubeNs.observationSet} ?observationSet .
    ?observationSet ${cubeNs.observation} ?observation .
    ?observation ${dimensionIri} ?value .
    ${
      filters
        ? filterList.map(([iri, value], idx) => {
            const filterDimension = cube.dimensions.find(
              (d) => d.path?.value === iri
            );
            if (!filterDimension || dimensionIri?.value === iri) {
              return "";
            }

            if (value.type === "range") {
              console.log("Ignoring filter range for iri", iri);
              return "";
            }
            const versioned = filterDimension
              ? dimensionIsVersioned(filterDimension)
              : false;
            return sparql`${
              versioned
                ? sparql`?dimension${idx} ${ns.schema.sameAs} ?dimension_unversioned${idx}.`
                : ""
            }
            ?observation <${iri}> ?dimension${idx}.
            ${formatFilterIntoSparqlFilter(
              value,
              filterDimension,
              versioned,
              idx
            )}`;
          })
        : ""
    }
  `.prologue`${pragmas}`;

  let result: Array<DimensionValue> = [];

  try {
    result = (await query.execute(sparqlClient.query, {
      operation: "postUrlencoded",
    })) as unknown as Array<DimensionValue>;
  } catch {
    console.warn(`Failed to fetch dimension values for ${datasetIri}.`);
  } finally {
    return result.map((d) => d.value);
  }
}
