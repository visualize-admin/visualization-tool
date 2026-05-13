import { CubeDimension } from "rdf-cube-view-query";

import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { isMostRecentValue } from "@/domain/most-recent-value";
import { getFiltersList } from "@/rdf/query-dimension-values";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

import { CubeFilter, CubeMultiFilter, CubeSingleFilter } from "./model/cube-dimension-filter";

export const SPARQL_PREFIXES = `
PREFIX cube: <https://cube.link/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX app: <http://visualize.admin.ch/vocabulary#>
`;


export const CONSTRUCT_TEMPLATE = `
    ?dimensionIri rdf:first ?unversionedValue .

    ?unversionedValue schema:name ?name ;
        schema:alternateName ?alternateName ;
        schema:description ?description ;
        schema:identifier ?identifier ;
        schema:position ?position ;
        schema:color ?color ;
        geo:hasGeometry ?geometry ;
        schema:latitude ?latitude ;
        schema:longitude ?longitude ;
    .

`;

export function createWhereTemplate(locale: string) {
    return ` 
    ${buildLocalizedSubQuery("versionedValue", "schema:name", "name", {
        locale,
    })}
  ${buildLocalizedSubQuery(
        "versionedValue",
        "schema:description",
        "description",
        {
            locale,
        }
    )}
  ${buildLocalizedSubQuery(
        "versionedValue",
        "schema:alternateName",
        "alternateName",
        {
            locale,
        }
    )}
  OPTIONAL { ?versionedValue schema:identifier ?identifier . }
  OPTIONAL { ?versionedValue schema:position ?position . }
  OPTIONAL { ?versionedValue schema:color ?color . }
  OPTIONAL { ?versionedValue geo:hasGeometry ?geometry . }
  OPTIONAL { ?versionedValue schema:latitude ?latitude . }
  OPTIONAL { ?versionedValue schema:longitude ?longitude . }
`;
}


export class QueryTree {
    #nestedFilters: CubeFilter[][];
    #innerObservationSelector: string;
    constructor(nestedFilters: CubeFilter[][], innerObservationSelector: string) {
        this.#nestedFilters = nestedFilters;
        this.#innerObservationSelector = innerObservationSelector;
    }

    getFiltersWithoutEmptyLevels() {
        return this.#nestedFilters.filter(f => f.length > 0);
    }

    trimInnerObservationSelector() {
        const observationSelectorLines = this.#innerObservationSelector.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        return observationSelectorLines.join("\n");
    }

    toSparql() {
        const levels = this.getFiltersWithoutEmptyLevels();

        const formatBlock = (str: string, indent: string) => {
            return str.split("\n")
                .map(l => l.trim())
                .filter(l => l.length > 0)
                .map(l => indent + l)
                .join("\n");
        };

        if (levels.length === 0) {
            return `SELECT ?observation WHERE {\n${formatBlock(this.trimInnerObservationSelector(), "  ")}\n}`;
        }

        let innerSelector = formatBlock(this.trimInnerObservationSelector(), "  ");
        let filters0 = levels[0]
            .map((f, index) => formatBlock(f.toSparqlFilter('observation', 'dimension0_' + index), ""))
            .filter(f => f.length > 0)
            .join("\n");

        let query = `SELECT ?observation WHERE {\n${innerSelector}\n${filters0}\n}`;

        for (let i = 1; i < levels.length; i++) {
            let indentedQuery = query.split("\n").map(l => "    " + l).join("\n");
            let nestedBlock = `  {\n${indentedQuery}\n  }`;
            let filtersI = levels[i]
                .map((f, index) => formatBlock(f.toSparqlFilter('observation', 'dimension' + i + '_' + index), "  "))
                .filter(f => f.length > 0)
                .join("\n");
            query = `SELECT ?observation WHERE {\n${nestedBlock}\n${filtersI}\n}`;
        }

        return query;
    }

}


export function createQueryFilter(
    filtersList: ReturnType<typeof getFiltersList>,
    dimensions: CubeDimension[],
    dimensionIri: string
): CubeFilter[] {

    if (filtersList.length === 0) {
        return [];
    }

    return filtersList
        .flatMap(([iri, value]): CubeFilter[] => {
            const dimension = dimensions.find((d) => d.path?.value === iri);

            if (!dimension) {
                console.warn(`Could not find dimension for filter with iri ${iri}`);
                return [];
            }

            // ignore the current dimension
            if (dimensionIri === iri) {
                return [];
            }

            // ignore filters with no value or with the special value
            if (
                value.type === "single" &&
                (value.value === FIELD_VALUE_NONE || isMostRecentValue(value.value))
            ) {
                return [];
            }

            // ignore range filters for now
            if (value.type === "range") {
                return [];
            }

            if (value.type === "multi") {
                const multiFilter = new CubeMultiFilter(dimension, value.values);
                return [multiFilter];
            }

            if (value.type === "single") {
                const singleFilter = new CubeSingleFilter(dimension, value.value);
                return [singleFilter];
            }
            return [];
        })
};
