import ParsingClient from "sparql-http-client/ParsingClient";

import {
  DataCubeComponents,
  DataCubeMetadata,
  DataCubePreview,
} from "@/domain/data";
import { getCubeComponents } from "@/rdf/query-cube-components";
import { getCubeMetadata } from "@/rdf/query-cube-metadata";
import { getCubePreview } from "@/rdf/query-cube-preview";

type LightCubeOptions = {
  iri: string;
  locale: string;
  sparqlClient: ParsingClient;
};

/** `LightCube` is a specialized data fetching class containing methods
 * for fetching _just enough_ data related to different aspects of a cube.
 */
export class LightCube {
  public iri: string;
  private locale: string;
  public metadata: DataCubeMetadata | undefined;
  public preview: DataCubePreview | undefined;
  public components: DataCubeComponents | undefined;
  private sparqlClient: ParsingClient;

  constructor(options: LightCubeOptions) {
    const { iri, locale, sparqlClient } = options;
    this.iri = iri;
    this.locale = locale;
    this.sparqlClient = sparqlClient;
  }

  /** Use to potentially promote the cube to newest version. */
  public async init(latest: boolean) {
    if (!latest) {
      return this;
    }

    const query = `PREFIX schema: <http://schema.org/>

SELECT ?iri WHERE {
  VALUES ?oldIri { <${this.iri}> }

  ?versionHistory schema:hasPart ?oldIri .
  ?versionHistory schema:hasPart ?iri .
  ?iri schema:version ?version .
  ?iri schema:creativeWorkStatus ?status .
  ?oldIri schema:creativeWorkStatus ?oldStatus .
  FILTER(NOT EXISTS { ?iri schema:expires ?expires . } && ?status IN (?oldStatus, <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published>))
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

  public async fetchPreview() {
    this.preview = await getCubePreview(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });

    return this.preview;
  }

  public async fetchComponents() {
    this.components = await getCubeComponents(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });

    return this.components;
  }
}
