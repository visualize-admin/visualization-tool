import RDF from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import keyBy from "lodash/keyBy";
import mapValues from "lodash/mapValues";
import sortBy from "lodash/sortBy";
import { CubeDimension } from "rdf-cube-view-query";
import LiteralExt from "rdf-ext/lib/Literal";
import { Literal, NamedNode, Quad, Term } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { FilterValue, Filters } from "@/config-types";
import { isDynamicMaxValue } from "@/configurator/components/field";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  DimensionValue,
  Observation,
  parseObservationValue,
} from "@/domain/data";
import { pragmas } from "@/rdf/create-source";
import { ExtendedCube } from "@/rdf/extended-cube";

import * as ns from "./namespace";
import { parseDimensionDatatype } from "./parse";
import { dimensionIsVersioned } from "./queries";
import { executeWithCache } from "./query-cache";
import { buildLocalizedSubQuery } from "./query-utils";

/**
 * Formats a filter value into the right format, string literal
 * for dimensions with a datatype, and named node for shared
 * dimensions.
 */
const formatFilterValue = (value: string | number, dataType?: NamedNode) => {
  if (!dataType) {
    return `<${value}>`;
  } else {
    return `"${value}"`;
  }
};

const formatFilterIntoSparqlFilter = (
  filter: FilterValue,
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
  cube: ExtendedCube;
  observation: Observation;
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
  })) as { versioned: NamedNode; unversioned: NamedNode }[];
  const unversionedIndex = result.reduce((acc, item) => {
    acc[item.versioned.value] = item.unversioned.value;
    return acc;
  }, {} as Record<string, string>);

  return mapValues(observation, (v) => (v ? unversionedIndex[v] ?? v : v));
}

const getFilterOrder = (filter: FilterValue) => {
  if (filter.type === "single") {
    // Heuristic to put non discriminant filter at the end
    // Seems like we could also do it based on the column order
    return `${filter.value}`.startsWith("https://ld.admin.ch") ? Infinity : 0;
  }

  return 0;
};

type LoadDimensionValuesProps = {
  datasetIri: string;
  dimensionIri: string;
  cube: ExtendedCube;
  sparqlClient: ParsingClient;
  filters?: Filters;
  locale: string;
};

/**
 * Load dimension values.
 *
 * Filters on other dimensions can be passed.
 *
 */
export async function loadDimensionValues(
  props: LoadDimensionValuesProps
): Promise<DimensionValue[]> {
  const { datasetIri, dimensionIri, cube, sparqlClient, filters, locale } =
    props;
  const filterList = getFiltersList(filters, dimensionIri);
  const queryFilters = getQueryFilters(filterList, cube, dimensionIri);
  const query = `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  [ rdf:first ?value ] .
  ?value
    schema:name ?name ;
    schema:alternateName ?alternateName ;
    schema:description ?description ;
    schema:identifier ?identifier ;
    schema:position ?position ;
    schema:color ?color .
} WHERE { 
  {
    SELECT ?blankNode ?value WHERE {
      <${datasetIri}> cube:observationConstraint/sh:property ?shapeProperty .
      ?shapeProperty sh:path <${dimensionIri}> .
      ?shapeProperty sh:in/rdf:rest* ?blankNode .
      ?blankNode rdf:first ?value .
    }
  } UNION {
    {
      SELECT DISTINCT ?value WHERE {
        <${datasetIri}> cube:observationConstraint/sh:property ?shapeProperty .
        ?shapeProperty sh:path <${dimensionIri}> .
        FILTER(NOT EXISTS{ ?shapeProperty sh:in ?in . })
        <${datasetIri}> cube:observationSet/cube:observation ?observation .
        ?observation <${dimensionIri}> ?value .
        ${queryFilters}
      }
    }
  }
  ${buildLocalizedSubQuery("value", "schema:name", "name", {
    locale,
    fallbackToNonLocalized: true,
  })}
  ${buildLocalizedSubQuery("value", "schema:description", "description", {
    locale,
    fallbackToNonLocalized: true,
  })}
  OPTIONAL { ?value schema:alternateName ?alternateName . }
  OPTIONAL { ?value schema:identifier ?identifier . }
  OPTIONAL { ?value schema:position ?position . }
  OPTIONAL { ?value schema:color ?color . }
}`;

  const quads = await sparqlClient.query.construct(query, {
    operation: "postUrlencoded",
  });
  const valuesQuads = quads.filter((q) => q.predicate.equals(ns.rdf.first));

  return valuesQuads.map((qValue) => parseDimensionValue(qValue, quads));
}

const parseDimensionValue = (
  valueQuad: Quad,
  quads: Quad[]
): DimensionValue => {
  const value = valueQuad.object.value;
  const valueQuads = keyBy(
    quads.filter((q) => q.subject.equals(valueQuad.object)),
    (d) => d.predicate.value
  );
  const position = valueQuads[ns.schema.position.value]?.object.value;

  return {
    value,
    label: valueQuads[ns.schema.name.value]?.object.value ?? value,
    description: valueQuads[ns.schema.description.value]?.object.value,
    identifier: valueQuads[ns.schema.identifier.value]?.object.value,
    position: position ? +position : undefined,
    color: valueQuads[ns.schema.color.value]?.object.value,
  };
};

/**
 * Load max dimension value.
 *
 * Filters on other dimensions can be passed.
 *
 */
export async function loadMaxDimensionValue(
  props: LoadDimensionValuesProps
): Promise<(Literal | NamedNode)[]> {
  const { datasetIri, dimensionIri, cube, sparqlClient, filters } = props;
  const filterList = getFiltersList(filters, dimensionIri);
  // The following query works both for numeric, date and ordinal dimensions
  const query = SELECT`?value`.WHERE`
    ${datasetIri} ${ns.cube.observationSet}/${
    ns.cube.observation
  } ?observation .
    ?observation ${dimensionIri} ?value .
    OPTIONAL {
      ?value <https://www.w3.org/TR/owl-time/hasEnd> ?hasEnd .
    }
    OPTIONAL {
      ?value ${ns.schema.position} ?position .
    }
    ${getQueryFilters(filterList, cube, dimensionIri)}`
    .ORDER()
    .BY(RDF.variable("hasEnd"), true)
    .THEN.BY(RDF.variable("value"), true)
    .THEN.BY(RDF.variable("position"), true)
    .LIMIT(1).prologue`${pragmas}`;

  let result: { value: Literal | NamedNode }[] = [];

  try {
    result = (await query.execute(sparqlClient.query, {
      operation: "postUrlencoded",
    })) as unknown as { value: Literal | NamedNode }[];
  } catch {
    console.warn(`Failed to fetch max dimension value for ${datasetIri}!`);
  } finally {
    return result.map((d) => d.value);
  }
}

const getFiltersList = (filters: Filters | undefined, dimensionIri: string) => {
  if (!filters) {
    return [];
  }

  const entries = Object.entries(filters);
  // Consider filters before the current filter to fetch the values for
  // the current filter
  return sortBy(
    entries.slice(
      0,
      entries.findIndex(([iri]) => iri == dimensionIri)
    ),
    ([, v]) => getFilterOrder(v)
  );
};

export const getQueryFilters = (
  filtersList: ReturnType<typeof getFiltersList>,
  cube: ExtendedCube,
  dimensionIri: string
) => {
  if (filtersList.length === 0) {
    return "";
  }

  let i = 0;
  const filterDimensionIris = filtersList.map(([iri]) => iri);
  // Also include other dimensions to make sure we don't return values that could
  // result in no observations. Inclusion of other dimensions is necessary to
  // filter out unobserved values.
  const otherDimensionFilters = cube.dimensions
    .filter(
      (dim) =>
        dim.path?.value !== dimensionIri &&
        !filterDimensionIris.includes(dim.path?.value ?? "") &&
        !dim.path?.equals(ns.cube.observedBy)
    )
    .map((dim) => `?observation <${dim.path?.value}> ?dimension${i++} .`);
  const filterDimensionFilters = filtersList.map(([iri, value], j) => {
    const dimension = cube.dimensions.find((d) => d.path?.value === iri);

    // Ignore the current dimension
    if (!dimension || dimensionIri === iri) {
      return "";
    }

    // Ignore filters with no value or with the special value
    if (
      value.type === "single" &&
      (value.value === FIELD_VALUE_NONE || isDynamicMaxValue(value.value))
    ) {
      return "";
    }

    // Ignore range filters for now
    if (value.type === "range") {
      return "";
    }

    const versioned = dimension ? dimensionIsVersioned(dimension) : false;

    return `${
      versioned
        ? `?dimension${i + j} <${
            ns.schema.sameAs.value
          }> ?dimension_unversioned${i + j} .`
        : ""
    }
?observation <${iri}> ?dimension${i + j} .
${formatFilterIntoSparqlFilter(value, dimension, versioned, i + j)}`;
  });

  return `
    ${otherDimensionFilters.join("\n")}
    ${filterDimensionFilters.join("\n")}
  `;
};

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
  datasetIri: string;
  dimensionIri: Term;
  sparqlClient: ParsingClient;
  cache: LRUCache | undefined;
}) => {
  const query = SELECT`(MIN(?value) as ?minValue) (MAX(?value) as ?maxValue)`
    .WHERE`
    ${datasetIri} ${ns.cube.observationSet}/${ns.cube.observation} ?observation .
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
