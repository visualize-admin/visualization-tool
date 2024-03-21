import RDF from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import keyBy from "lodash/keyBy";
import pickBy from "lodash/pickBy";
import sortBy from "lodash/sortBy";
import { CubeDimension } from "rdf-cube-view-query";
import { Quad, Term } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { ResultRow } from "sparql-http-client/ResultParser";
import { LRUCache } from "typescript-lru-cache";

import { FilterValue, Filters } from "@/config-types";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { DimensionValue, parseObservationValue } from "@/domain/data";
import { isDynamicMaxValue } from "@/domain/max-value";
import { ResolvedDimension } from "@/graphql/shared-types";
import { pragmas } from "@/rdf/create-source";

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
const formatFilterValue = (value: string | number, dataType?: Term) => {
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

const getFilterOrder = (filter: FilterValue) => {
  if (filter.type === "single") {
    // Heuristic to put non discriminant filter at the end
    // Seems like we could also do it based on the column order
    return `${filter.value}`.startsWith("https://ld.admin.ch") ? Infinity : 0;
  }

  return 0;
};

type LoadDimensionValuesProps = {
  dimension: ResolvedDimension;
  cubeDimensions: CubeDimension[];
  sparqlClient: ParsingClient;
  filters?: Filters;
  locale: string;
  cache: LRUCache | undefined;
};

/**
 * Load dimension values.
 *
 * Filters on other dimensions can be passed.
 *
 */
export async function loadDimensionValuesWithMetadata(
  cubeIri: string,
  props: LoadDimensionValuesProps
): Promise<DimensionValue[]> {
  const { dimension, cubeDimensions, sparqlClient, filters, locale, cache } =
    props;
  const dimensionIri = dimension.data.iri;
  const filterList = getFiltersList(filters, dimensionIri);
  const queryFilters = getQueryFilters(
    filterList,
    cubeDimensions,
    dimensionIri
  );

  if (!cubeDimensions.find((d) => d.path?.value === dimensionIri)) {
    throw new Error(`Dimension not found: ${dimensionIri}`);
  }

  const isDimensionVersioned = dimensionIsVersioned(dimension.dimension);
  const query = `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  [ rdf:first ?maybe_unversioned_value ] .
  ?maybe_unversioned_value
    schema:name ?name ;
    schema:alternateName ?alternateName ;
    schema:description ?description ;
    schema:identifier ?identifier ;
    schema:position ?position ;
    schema:color ?color .
} WHERE { 
  ${
    queryFilters
      ? ""
      : `{ #pragma evaluate on
    SELECT ?value WHERE {
      <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
      ?dimension sh:path <${dimensionIri}> .
      ?dimension sh:in/rdf:rest*/rdf:first ?value .
    }
  } UNION`
  } {
    { #pragma evaluate on
      SELECT DISTINCT ?value WHERE {
        ${
          queryFilters
            ? ""
            : `
        <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
        ?dimension sh:path <${dimensionIri}> .
        FILTER(NOT EXISTS{ ?dimension sh:in ?in . })`
        }
        <${cubeIri}> cube:observationSet/cube:observation ?observation .
        ?observation <${dimensionIri}> ?value .
        ${queryFilters}
      }
    }
  }
  ${buildLocalizedSubQuery("value", "schema:name", "name", {
    locale,
  })}
  ${buildLocalizedSubQuery("value", "schema:description", "description", {
    locale,
  })}
  ${buildLocalizedSubQuery("value", "schema:alternateName", "alternateName", {
    locale,
  })}
  OPTIONAL { ?value schema:identifier ?identifier . }
  OPTIONAL { ?value schema:position ?position . }
  OPTIONAL { ?value schema:color ?color . }
  ${
    isDimensionVersioned
      ? `OPTIONAL { ?value schema:sameAs ?unversioned_value . }`
      : ""
  }
  BIND(COALESCE(?unversioned_value, ?value) AS ?maybe_unversioned_value)
}`;

  if (dimensionIri === "https://agriculture.ld.admin.ch/foag/dimension/date") {
    console.log(query);
  }

  return await executeWithCache(
    sparqlClient,
    query,
    () => sparqlClient.query.construct(query, { operation: "postUrlencoded" }),
    (quads) => {
      return quads
        .filter((q) => q.predicate.equals(ns.rdf.first))
        .map((qValue) => parseDimensionValue(qValue, quads));
    },
    cache
  );
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
  const parsedValue: DimensionValue = {
    value,
    label: parseMaybeUndefined(
      value,
      valueQuads[ns.schema.name.value]?.object.value
    ),
    alternateName: valueQuads[ns.schema.alternateName.value]?.object.value,
    description: valueQuads[ns.schema.description.value]?.object.value,
    identifier: valueQuads[ns.schema.identifier.value]?.object.value,
    position: position ? (isNaN(+position) ? position : +position) : undefined,
    color: valueQuads[ns.schema.color.value]?.object.value,
  };

  return pickBy(parsedValue, (v) => v !== undefined) as DimensionValue;
};

const parseMaybeUndefined = (value: string, fallbackValue: string) => {
  return value === ns.cube.Undefined.value ? "-" : fallbackValue ?? value;
};

type LoadMaxDimensionValuesProps = Omit<LoadDimensionValuesProps, "locale">;

/**
 * Load max dimension value.
 *
 * Filters on other dimensions can be passed.
 *
 */
export async function loadMaxDimensionValue(
  cubeIri: string,
  props: LoadMaxDimensionValuesProps
): Promise<string> {
  const { dimension, cubeDimensions, sparqlClient, filters, cache } = props;
  const dimensionIri = dimension.data.iri;
  const filterList = getFiltersList(filters, dimensionIri);
  // The following query works both for numeric, date and ordinal dimensions
  const query = SELECT`?value`.WHERE`
<${cubeIri}> ${ns.cube.observationSet}/${ns.cube.observation} ?observation .
?observation <${dimensionIri}> ?value .
OPTIONAL { ?value <https://www.w3.org/TR/owl-time/hasEnd> ?hasEnd . }
OPTIONAL { ?value ${ns.schema.position} ?position . }
${getQueryFilters(filterList, cubeDimensions, dimensionIri)}`
    .ORDER()
    .BY(RDF.variable("hasEnd"), true)
    .THEN.BY(RDF.variable("value"), true)
    .THEN.BY(RDF.variable("position"), true)
    .LIMIT(1).prologue`${pragmas}`.build();

  try {
    return await executeWithCache(
      sparqlClient,
      query,
      () => sparqlClient.query.select(query, { operation: "postUrlencoded" }),
      (result) => result[0].value.value,
      cache
    );
  } catch {
    throw new Error(
      `Failed to fetch max dimension value for ${cubeIri}, ${dimensionIri}!`
    );
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
  dimensions: CubeDimension[],
  dimensionIri: string
) => {
  if (filtersList.length === 0) {
    return "";
  }

  return filtersList
    .map(([iri, value], i) => {
      const dimension = dimensions.find((d) => d.path?.value === iri);

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
          ? `?dimension${i} <${ns.schema.sameAs.value}> ?dimension_unversioned${i} .`
          : ""
      }
?observation <${iri}> ?dimension${i} .
${formatFilterIntoSparqlFilter(value, dimension, versioned, i)}`;
    })
    .join("\n");
};

const parseMinMax = (result: ResultRow[]) => {
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
    .WHERE`<${datasetIri}> ${ns.cube.observationSet}/${ns.cube.observation} ?observation .
?observation <${dimensionIri}> ?value .
FILTER ( (STRLEN(STR(?value)) > 0) && (STR(?value) != "NaN") )`;

  try {
    return await executeWithCache(
      sparqlClient,
      query.build(),
      () =>
        query.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        }),
      parseMinMax,
      cache
    );
  } catch {
    console.warn(
      `Failed to fetch min max dimension values for ${datasetIri}, ${dimensionIri}.`
    );
  }
};
