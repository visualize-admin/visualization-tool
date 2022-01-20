import { SELECT } from "@tpluscode/sparql-builder";
import { Literal, NamedNode, Term } from "rdf-js";
import { Filters } from "../configurator";
import { cube as cubeNs } from "./namespace";
import { sparqlClient } from "./sparql-client";
import { Cube, CubeDimension } from "rdf-cube-view-query";
import { dimensionIsVersioned } from "./queries";
import * as ns from "./namespace";

interface DimensionValue {
  value: Literal | NamedNode<string>;
}

/**
 * Formats a filter value into the right format given
 * the datatype of the dimension
 *
 * Seems a bit fragile, we should find a way to directly add the ^^xsd
 * given the datatype instead of handling everycase
 */
const formatFilterValue = (
  value: string | number,
  dimension: CubeDimension
) => {
  if (!dimension.datatype) {
    return `<${value}>`;
  } else {
    // Seems fragile
    if (dimension.datatype.value === ns.xsd.gYear.value) {
      return `"${value}"^^xsd:gYear`;
    } else if (dimension.datatype.value === ns.xsd.date.value) {
      return `"${value}"^^xsd:date`;
    } else if (dimension.datatype.value === ns.xsd.dateTime.value) {
      return `"${value}"^^xsd:dateTime`;
    } else {
      return `"${value}"`;
    }
  }
};

const formatFilterIntoSparqlFilter = (
  filter: Filters[string],
  dimension: CubeDimension,
  versioned: boolean,
  index: number
) => {
  const suffix = versioned ? "_unversioned" : "";
  if (filter.type === "single") {
    return `FILTER ( (?dimension${suffix}${index} = ${formatFilterValue(
      filter.value,
      dimension
    )}) )`;
  } else if (filter.type === "multi") {
    return `FILTER ( (?dimension${suffix}${index} in (${Object.keys(
      filter.values
    )
      .map((x) => formatFilterValue(x, dimension))
      .join(",")}) ) )`;
  } else {
    return "";
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
  }: {
    datasetIri: Term | undefined;
    dimension: CubeDimension;
    cube: Cube;
  },
  filters?: Filters
): Promise<Array<Literal | NamedNode>> {
  const dimensionIri = dimension.path;

  let filterList = filters ? Object.entries(filters) : [];
  filterList = filterList.slice(
    0,
    filterList.findIndex(([iri]) => iri == dimensionIri?.value) + 1
  );

  let query = SELECT.DISTINCT`?value`.WHERE`
    ${datasetIri} ${cubeNs.observationSet} ?observationSet .
    ?observationSet ${cubeNs.observation} ?observation .
    ?observation ${dimensionIri} ?value .
    ${
      filters
        ? filterList
            .map(([iri, value], idx) => {
              const filterDimension = cube.dimensions.find(
                (d) => d.path?.value === iri
              );
              if (
                !filterDimension ||
                value.type === "range" ||
                dimensionIri?.value === iri
              ) {
                return "";
              }
              const versioned = filterDimension
                ? dimensionIsVersioned(filterDimension)
                : false;
              return `${
                versioned
                  ? `?dimension${idx} <http://schema.org/sameAs> ?dimension_unversioned${idx}.`
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
            .join("\n")
        : ""
    }
  `;

  let result: Array<DimensionValue> = [];
  console.log(query.build());

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
