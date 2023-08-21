import { DatasetCore, Quad, Stream } from "rdf-js";

export const fromStream = (
  dataset: DatasetCore<Quad, Quad>,
  stream: Stream<Quad>
): Promise<DatasetCore<Quad, Quad>> => {
  return new Promise((resolve) => {
    stream.on("data", (quad: Quad) => dataset.add(quad));
    stream.on("end", () => resolve(dataset));
  });
};
