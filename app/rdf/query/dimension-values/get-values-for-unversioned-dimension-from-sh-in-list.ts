import { CONSTRUCT_TEMPLATE, createWhereTemplate, SPARQL_PREFIXES } from "./shared-query-parts";

/**
 * Get all possible values for a dimension that is not versioned and has an sh:in list as constraint.
 * 
 * @param cubeIri the iri of the cube
 * @param dimensionIri the dimension iri
 * @returns a partial sparql query
 */
export function getValuesForUnversionedDimensionFromShInList(cubeIri: string, dimensionIri: string, locale: string): string {
    const query = `
    ${SPARQL_PREFIXES}

    CONSTRUCT {
        ${CONSTRUCT_TEMPLATE}
    }
    WHERE {
        {
        
            SELECT ?dimensionIri ?versionedValue ?unversionedValue WHERE {

                VALUES ?dimensionIri { 
                    <${dimensionIri}> 
                }
                
                <${cubeIri}> cube:observationConstraint/sh:property ?dimension .
                
                ?dimension sh:path ?dimensionIri .
                FILTER NOT EXISTS { ?dimension schema:version ?version . }
                ?dimension sh:in/rdf:rest*/rdf:first ?versionedValue .
                BIND(?versionedValue as ?unversionedValue)
            }
        }        
        ${createWhereTemplate(locale)}
    }
    `;

    return query;
}