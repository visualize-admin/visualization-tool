import { sparql } from "@tpluscode/sparql-builder";

import { cube, schema } from "../../app/rdf/namespace";

export const makeVisualizeDatasetFilter = (options?: {
  includeDrafts?: boolean;
  cubeIriVar?: string;
}) => {
  const cubeIriVar = options?.cubeIriVar ?? "?iri";
  const includeDrafts = options?.includeDrafts ?? false;

  return sparql`
    ${cubeIriVar} ${
    schema.workExample
  } <https://ld.admin.ch/application/visualize> .
    ${
      includeDrafts
        ? ""
        : sparql`${cubeIriVar} ${schema.creativeWorkStatus} <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published> .`
    }
    ${cubeIriVar} ${cube.observationConstraint} ?shape .
    FILTER NOT EXISTS { ${cubeIriVar} ${schema.expires} ?expiryDate }`;
};
