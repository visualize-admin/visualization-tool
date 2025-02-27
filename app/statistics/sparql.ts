import ParsingClient from "sparql-http-client/ParsingClient";

import { DEFAULT_DATA_SOURCE } from "@/domain/datasource";
import { buildLocalizedSubQuery, iriToNode } from "@/rdf/query-utils";

const sparqlClient = new ParsingClient({
  endpointUrl: DEFAULT_DATA_SOURCE.url,
});

const getCubeMetadataQuery = ({
  cubeIris,
  locale,
}: {
  cubeIris: string[];
  locale: string;
}) => {
  return `PREFIX schema: <http://schema.org/>
PREFIX dcterms: <http://purl.org/dc/terms/>

SELECT ?iri ?unversionedIri ?title ?creator WHERE {
  VALUES ?iri { ${cubeIris.map(iriToNode).join(" ")} }
  OPTIONAL {
    ?maybeUnversionedIri schema:hasPart ?iri .
  }
  BIND(COALESCE(?maybeUnversionedIri, ?iri) AS ?unversionedIri)
  ${buildLocalizedSubQuery("iri", "schema:name", "title", {
    locale,
  })}
  OPTIONAL {
    ?iri dcterms:creator ?creatorIri .
    GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
      ?creatorIri a schema:Organization ;
        schema:inDefinedTermSet <https://register.ld.admin.ch/opendataswiss/org> .
        ${buildLocalizedSubQuery("creatorIri", "schema:name", "creator", {
          locale,
        })}
    }
  }
}`;
};

export const queryCubesMetadata = async ({
  cubeIris,
  locale,
}: {
  cubeIris: string[];
  locale: string;
}): Promise<
  { iri: string; unversionedIri: string; title: string; creator: string }[]
> => {
  const query = getCubeMetadataQuery({ cubeIris, locale });
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return results.map((result) => {
    const iri = result.iri.value;

    return {
      iri,
      unversionedIri: result.unversionedIri.value ?? iri,
      title: result.title?.value ?? iri,
      creator: result.creator?.value,
    };
  });
};
