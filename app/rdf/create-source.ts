import { Source } from "rdf-cube-view-query";
import rdf from "rdf-ext";

export const createSource = ({ endpointUrl }: { endpointUrl: string }) => {
  return new Source({
    endpointUrl,
    queryOperation: "postUrlencoded",
    sourceGraph: rdf.defaultGraph(),
  });
};
