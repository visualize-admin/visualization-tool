import { CONSTRUCT_TEMPLATE, createWhereTemplate, SPARQL_PREFIXES } from "./shared-query-parts";

/**
 * Gets the values for a versioned dimension from a SHACL in list constraint on the cube.
 * 
 * @param cubeIri the cube iri
 * @param dimensionIri the dimension iri
 * @param locale the locale for which to load the labels and descriptions
 * @returns a partial sparql query
 */
export function getValuesForVersionedDimensionFromShInList(cubeIri: string, dimensionIri: string, locale: string): string {
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
            

                ?dimension sh:path ?dimensionIri ;
                    schema:version ?version ;
                .
                
                ?dimension sh:in/rdf:rest*/rdf:first ?versionedValue .

                ?versionedValue schema:sameAs ?unversionedValue .
            }
        }
        ${createWhereTemplate(locale)}
    }`;

    return query;
}