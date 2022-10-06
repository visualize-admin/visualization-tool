import { sparql } from "@tpluscode/sparql-builder";
import { Source } from "rdf-cube-view-query";
import rdf from "rdf-ext";

const pragmas = `#pragma describe.strategy cbd
#pragma join.hash off
`;

export const withPragma = (t: any) => {
  return sparql`${pragmas}${t.toString()}`;
};

export const createSource = ({ endpointUrl }: { endpointUrl: string }) => {
  return new Source({
    endpointUrl,
    queryOperation: "postUrlencoded",
    queryPrefix: pragmas,
    sourceGraph: rdf.defaultGraph(),
  });
};
