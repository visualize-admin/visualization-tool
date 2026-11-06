import ParsingClient from "sparql-http-client/ParsingClient";

import { DEFAULT_DATA_SOURCE } from "@/domain/data-source";
import { buildLocalizedSubQuery, iriToNode } from "@/rdf/query-utils";
import {
  chunk,
  IRIS_CHUNK_SIZE,
  isSafeIri,
} from "@/statistics/iris";

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
  { iri: string; unversionedIri: string; title: string; creator?: string }[]
> => {
  const safeCubeIris = cubeIris.filter(isSafeIri);
  const normalize = (
    iri: string,
    unversionedIri?: string,
    title?: string,
    creator?: string
  ): { iri: string; unversionedIri: string; title: string; creator?: string } => ({
    iri,
    unversionedIri: unversionedIri ?? iri,
    title: title ?? iri,
    creator,
  });

  const queryChunk = async (
    iris: string[]
  ): Promise<
    { iri: string; unversionedIri: string; title: string; creator?: string }[]
  > => {
    const query = getCubeMetadataQuery({ cubeIris: iris, locale });

    try {
      const rows = await sparqlClient.query.select(query, {
        operation: "postUrlencoded",
      });

      return rows.flatMap((result) => {
        const iri = result.iri?.value;

        return typeof iri === "string"
          ? [
              normalize(
                iri,
                result.unversionedIri?.value,
                result.title?.value,
                result.creator?.value
              ),
            ]
          : [];
      });
    } catch {
      return iris.map((iri) => normalize(iri));
    }
  };

  return (await Promise.all(chunk(safeCubeIris, IRIS_CHUNK_SIZE).map(queryChunk))).flat();
};
