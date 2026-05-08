import { CubeDimensionFilterType, CubeFilter } from "./model/cube-dimension-filter";
import { CONSTRUCT_TEMPLATE, createWhereTemplate, QueryTree, SPARQL_PREFIXES } from "./shared-query-parts";

/**
 * Gets the values for a versioned dimension from the observations of a cube.
 *
 * @param cubeIri the cube iri
 * @param dimensionIri the dimensionIri
 * @param locale the locale for which to load the labels and descriptions
 * @returns a partial sparql query
 */
export function getValuesForVersionedDimensionFromObservations(cubeIri: string, dimensionIri: string, filters: CubeFilter[], locale: string): string {

    if (filters.length === 0) {
        const innerObservationSelector = `VALUES (?dimensionIri) { (<${dimensionIri}>) }
            <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
            ?dimension sh:path <${dimensionIri}> .
            ?dimension schema:version ?version .
            
            # if there are no filters, we need to make sure to only get values from dimensions
            # that dont have ah sh:in in the dimension matadata.
            FILTER NOT EXISTS { ?dimension sh:in ?in . }
            <${cubeIri}> cube:observationSet/cube:observation ?observation .`;

        return `
${SPARQL_PREFIXES}

CONSTRUCT {
${CONSTRUCT_TEMPLATE}
?dimensionIri app:versionedValuesFromObservations ?versionedValue .
}
WHERE {
    # 1 - no filters - get versioned values for dimensions
    {
        SELECT ?dimensionIri ?versionedValue ?unversionedValue WHERE {
            {
                SELECT DISTINCT ?versionedValue WHERE {
                    ${innerObservationSelector}   
                    ?observation ?dimensionIri ?versionedValue .
                }
            }  
            VALUES ?dimensionIri { <${dimensionIri}> }
            ?versionedValue schema:sameAs ?unversionedValue .
        }
    }
    ${createWhereTemplate(locale)}
}`;
    }

    const innerObservationSelector = `VALUES (?dimensionIri) { (<${dimensionIri}>) }
            <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
            ?dimension sh:path <${dimensionIri}> .
            ?dimension schema:version ?version .
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
# 1 - with F - get versioned values for dimensions 
# singleNonLiteralFilters: ${singleNonLiteralFilters.length}
# multiNonLiteralFilters: ${multiNonLiteralFilters.length}
# singleLiteralFilters: ${singleLiteralFilters.length}
# multiLiteralFilters: ${multiLiteralFilters.length}

${SPARQL_PREFIXES}

CONSTRUCT {
    ${CONSTRUCT_TEMPLATE}
    ?dimensionIri app:versionedValuesFromObservations ?versionedValue .
}
WHERE {
    {
        SELECT ?dimensionIri ?versionedValue ?unversionedValue WHERE {
            {
                SELECT DISTINCT ?versionedValue WHERE {
                    {
                    ${observationFilterPartialQuery}
                    }
                    BIND (<${dimensionIri}> AS ?dimensionIri)
                    <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
                    ?dimension sh:path ?dimensionIri .
                    ?observation ?dimensionIri ?versionedValue .
                }
            }
            VALUES ?dimensionIri { <${dimensionIri}> }
            ?versionedValue schema:sameAs ?unversionedValue .
        }
            
    }
    ${createWhereTemplate(locale)}        
}
    `;
    return query;
}