import { CubeDimensionFilterType, CubeFilter } from "./model/cube-dimension-filter";
import { CONSTRUCT_TEMPLATE, createWhereTemplate, QueryTree, SPARQL_PREFIXES } from "./shared-query-parts";

/**
 * Gets the values for an unversioned dimension from the observations of a cube.
 *  
 * @param cubeIri the cube iri
 * @param dimensionIri the dimensionIri
 * @returns a partial sparql query
 */
export function getValuesForUnversionedDimensionFromObservations(cubeIri: string, dimensionIri: string, filters: CubeFilter[], locale: string): string {

    if (filters.length === 0) {
        const innerObservationSelector = `VALUES (?dimensionIri) { (<${dimensionIri}>) }
            <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
            ?dimension sh:path <${dimensionIri}> .
            FILTER NOT EXISTS { ?dimension schema:version ?version . }
            FILTER NOT EXISTS { ?dimension sh:in ?in . }
            <${cubeIri}> cube:observationSet/cube:observation ?observation .`;

        return `
${SPARQL_PREFIXES}

# 2 - no filters - get unversioned  values for dimensions from observations

CONSTRUCT {
${CONSTRUCT_TEMPLATE}
}
WHERE {
    {
        SELECT ?dimensionIri ?versionedValue ?unversionedValue WHERE {
            {
            SELECT DISTINCT ?versionedValue WHERE {
                ${innerObservationSelector}   
                ?observation ?dimensionIri ?versionedValue .
            }
            }
            VALUES ?dimensionIri { <${dimensionIri}> }
            BIND(?versionedValue as ?unversionedValue)
        }
    }
    ${createWhereTemplate(locale)}
}`;

    }

    // here we have filters 
    const innerObservationSelector = `VALUES (?dimensionIri) { (<${dimensionIri}>) }
            <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
            ?dimension sh:path  ?dimensionIri .
            FILTER NOT EXISTS { ?dimension schema:version ?version . }
            <${cubeIri}> cube:observationSet/cube:observation ?observation .`;

    const singleNonLiteralFilters = filters.filter(filter => filter.filterType === CubeDimensionFilterType.single && !filter.isLiteralFilter()) as CubeFilter[];
    const multiNonLiteralFilters = filters.filter(filter => filter.filterType === CubeDimensionFilterType.multi && !filter.isLiteralFilter()) as CubeFilter[];
    const singleLiteralFilters = filters.filter(filter => filter.filterType === CubeDimensionFilterType.single && filter.isLiteralFilter()) as CubeFilter[];
    const multiLiteralFilters = filters.filter(filter => filter.filterType === CubeDimensionFilterType.multi && filter.isLiteralFilter()) as CubeFilter[];

    const nestingLevel1 = [...singleNonLiteralFilters];
    const nestingLevel2 = [...multiNonLiteralFilters];
    const nestingLevel3 = [...singleLiteralFilters];
    const nestingLevel4 = [...multiLiteralFilters];

    const queryTree = new QueryTree([nestingLevel1, nestingLevel2, nestingLevel3, nestingLevel4], innerObservationSelector);
    const observationFilterPartialQuery = queryTree.toSparql();

    const query = `
    ${SPARQL_PREFIXES}

    CONSTRUCT {
        ${CONSTRUCT_TEMPLATE}

        ?dimensionIri app:unversionedValuesFromObservations ?unversionedValue .
    }
    WHERE { 
        {
            SELECT ?dimensionIri ?versionedValue ?unversionedValue WHERE {
                {
                    SELECT DISTINCT ?versionedValue WHERE {
                        {
                        ${observationFilterPartialQuery}
                        }
                        BIND(<${dimensionIri}> as ?dimensionIri)
                        <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
                        ?dimension sh:path ?dimensionIri .
                        ?observation ?dimensionIri ?versionedValue .
                    }
                }
                VALUES ?dimensionIri { <${dimensionIri}> }
                BIND(?versionedValue as ?unversionedValue)
            }
        }
        ${createWhereTemplate(locale)}
    }
    `;
    return query;
}