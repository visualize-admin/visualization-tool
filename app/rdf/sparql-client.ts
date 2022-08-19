import { DatasetCore, Quad, Stream } from "rdf-js";
import StreamClient from "sparql-http-client";

import { DEFAULT_DATA_SOURCE } from "@/domain/datasource";

export const sparqlClientStream = new StreamClient({
  endpointUrl: DEFAULT_DATA_SOURCE.url,
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
