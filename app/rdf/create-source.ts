import { Source } from "rdf-cube-view-query";

export const createSource = ({ endpointUrl }: { endpointUrl: string }) => {
  return new Source({
    endpointUrl,
    queryOperation: "postUrlencoded",
  });
};
