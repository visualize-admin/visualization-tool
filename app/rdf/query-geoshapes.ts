import { SELECT } from "@tpluscode/sparql-builder";
import { groups } from "d3";
import { CubeDimension } from "rdf-cube-view-query";
import ParsingClient from "sparql-http-client/ParsingClient";
import { SPARQL_GEO_ENDPOINT } from "../domain/env";
import * as ns from "./namespace";
import { sparqlClient } from "./sparql-client";

const BATCH_SIZE = 500;

/**
 * Load WKT coords for a list of IDs (e.g. dimension values)
 *
 * @param dimensionIri geoDimension IRI
 * @param client SparqlClient
 */
export async function loadGeoShapes({
  dimension,
  locale,
  client = sparqlClient,
}: {
  dimension: CubeDimension;
  locale: string;
  client?: ParsingClient;
}): Promise<{ iri: string; label: string; wktString: string }[]> {
  if (dimension.in) {
    // We query in batches because we might run into "413 – Error: Payload Too Large"
    const batched = groups(dimension.in, (_, i) => Math.floor(i / BATCH_SIZE));
    const results = await Promise.all(
      batched.map(async ([, values]) => {
        const query = SELECT`?geoShapeIri ?WKT ?label`.WHERE`
        values ?geoShapeIri {
            ${values}
        }

        ?geoShapeIri
          ${ns.geo.hasGeometry} ?geometry ;
          ${ns.schema.name} ?label .

        SERVICE <${SPARQL_GEO_ENDPOINT}> {
          ?geometry ${ns.geo.asWKT} ?WKT
        }

        FILTER(LANG(?label) = '${locale}')
      `;

        let result: any[] = [];
        try {
          result = await query.execute(client.query, {
            operation: "postUrlencoded",
          });
        } catch (e) {
          console.error(e);
        }

        return result.map((d) => ({
          iri: d.geoShapeIri.value,
          label: d.label?.value,
          wktString: d.WKT.value,
        }));
      })
    );

    return results.flat();
  } else {
    return [];
  }
}
