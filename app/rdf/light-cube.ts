import ParsingClient from "sparql-http-client/ParsingClient";

import { DataCubeMetadata } from "@/domain/data";
import { getCubeMetadata } from "@/rdf/query-cube-metadata";

type LightCubeOptions = {
  iri: string;
  locale: string;
  sparqlClient: ParsingClient;
};

export class LightCube {
  public iri: string;
  private locale: string;
  public metadata: DataCubeMetadata | undefined;
  private sparqlClient: ParsingClient;

  constructor(options: LightCubeOptions) {
    const { iri, locale, sparqlClient } = options;
    this.iri = iri;
    this.locale = locale;
    this.sparqlClient = sparqlClient;
  }

  /** Use to promote the cube to newest version. */
  public async promote(latest: boolean) {
    if (!latest) {
      return this;
    }

    const query = `PREFIX schema: <http://schema.org/>

SELECT ?iri WHERE {
  ?versionHistory schema:hasPart  <${this.iri}> .
  ?versionHistory schema:hasPart ?iri .
  ?iri schema:version ?version .
}
ORDER BY DESC(?version)
LIMIT 1`;

    const result = await this.sparqlClient.query.select(query);
    const latestIri = result[0]?.iri?.value;

    if (latestIri && latestIri !== this.iri) {
      return new LightCube({
        iri: latestIri,
        locale: this.locale,
        sparqlClient: this.sparqlClient,
      });
    }

    return this;
  }

  public async fetchMetadata() {
    this.metadata = await getCubeMetadata(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });

    return this.metadata;
  }
}
