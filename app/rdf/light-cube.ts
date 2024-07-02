import ParsingClient from "sparql-http-client/ParsingClient";

import {
  DataCubeComponents,
  DataCubeMetadata,
  DataCubePreview,
} from "@/domain/data";
import { getCubeMetadata } from "@/rdf/query-cube-metadata";
import { getCubePreview } from "@/rdf/query-cube-preview";
import {
  getCubeComponentTermsets,
  getCubeTermsets,
} from "@/rdf/query-termsets";

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

  public async fetchMetadata() {
    this.metadata = await getCubeMetadata(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });

    return this.metadata;
  }

  public async fetchTermsets() {
    return await getCubeTermsets(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });
  }

  public async fetchComponentTermsets() {
    return await getCubeComponentTermsets(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });
  }

  public async fetchPreview() {
    this.preview = await getCubePreview(this.iri, {
      locale: this.locale,
      sparqlClient: this.sparqlClient,
    });

    return this.preview;
  }
}
