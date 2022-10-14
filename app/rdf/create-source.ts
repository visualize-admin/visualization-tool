import { Source } from "rdf-cube-view-query";
import rdf from "rdf-ext";

export const pragmas = `#pragma describe.strategy cbd
#pragma join.hash off
`;

export const createSource = ({ endpointUrl }: { endpointUrl: string }) => {
  return new Source({
    endpointUrl,
    queryOperation: "postUrlencoded",
    queryPrefix: pragmas,
    sourceGraph: rdf.defaultGraph(),
  });
};
