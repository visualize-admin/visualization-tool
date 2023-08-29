import { SELECT, sparql } from "@tpluscode/sparql-builder";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import sortBy from "lodash/sortBy";
import { Cube, CubeDimension } from "rdf-cube-view-query";
import LiteralExt from "rdf-ext/lib/Literal";
import { Literal, NamedNode, Term } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { parseObservationValue } from "@/domain/data";
import { pragmas } from "@/rdf/create-source";

import { Filters } from "../configurator";

import * as ns from "./namespace";
import { cube as cubeNs } from "./namespace";
import { parseDimensionDatatype } from "./parse";
import { dimensionIsVersioned } from "./queries";
import { executeWithCache } from "./query-cache";

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
  const versionedDimensions = Object.keys(observation).filter((x) => {
    // Ignore the artificial __iri__ dimensions.
    if (x.endsWith("/__iri__")) {
      return false;
    }

    return dimensionIsVersioned(dimensionsByPath[x]);
  });
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

const getFilterOrder = (filter: Filters[number]) => {
  if (filter.type === "single") {
    // Heuristic to put non discriminant filter at the end
    // Seems like we could also do it based on the column order
    return filter.value.toString().startsWith("https://ld.admin.ch")
      ? Infinity
      : 0;
  } else {
    return 0;
  }
};

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
  const allFiltersList = filters ? Object.entries(filters) : [];
  const filterList =
    // Consider filters before the current filter to fetch the values for
    // the current filter
    sortBy(
      allFiltersList.slice(
        0,
        allFiltersList.findIndex(([iri]) => iri == dimensionIri?.value)
      ),
      ([, filterValue]) => getFilterOrder(filterValue)
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

type MinMaxResult = [{ minValue: LiteralExt; maxValue: LiteralExt }];

const parseMinMax = (result: MinMaxResult) => {
  const { minValue, maxValue } = result[0];
  const min = parseObservationValue({ value: minValue }) ?? 0;
  const max = parseObservationValue({ value: maxValue }) ?? 0;
  return [min, max] as const;
};

export const loadMinMaxDimensionValues = async ({
  datasetIri,
  dimensionIri,
  sparqlClient,
  cache,
}: {
  datasetIri: Term;
  dimensionIri: Term;
  sparqlClient: ParsingClient;
  cache: LRUCache | undefined;
}) => {
  const query = SELECT`(MIN(?value) as ?minValue) (MAX(?value) as ?maxValue)`
    .WHERE`
    ${datasetIri} ${cubeNs.observationSet} ?observationSet .
    ?observationSet ${cubeNs.observation} ?observation .
    ?observation ${dimensionIri} ?value .

    FILTER (
      (STRLEN(STR(?value)) > 0) && (STR(?value) != "NaN")
    )
  `;

  try {
    const result = await executeWithCache(
      sparqlClient,
      query,
      cache,
      parseMinMax
    );
    return result;
  } catch {
    console.warn(
      `Failed to fetch min max dimension values for ${datasetIri}, ${dimensionIri}.`
    );
  }
};
