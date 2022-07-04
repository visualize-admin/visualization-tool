import { DatasetCore, Quad, Stream } from "rdf-js";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { SPARQL_ENDPOINT } from "../domain/env";

export const sparqlClient = new ParsingClient({
  endpointUrl: SPARQL_ENDPOINT,
});

export const sparqlClientStream = new StreamClient({
  endpointUrl: SPARQL_ENDPOINT,
});

export const fromStream = (
  dataset: DatasetCore<Quad, Quad>,
  stream: Stream<Quad>
): Promise<DatasetCore<Quad, Quad>> => {
  return new Promise((resolve) => {
    stream.on("data", (quad: Quad) => dataset.add(quad));
    stream.on("end", () => resolve(dataset));
  });
};
