import { atomWithStorage } from "jotai/utils";

import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

export const dataSourceAtom = atomWithStorage(
  "dataSource",
  DEFAULT_DATA_SOURCE
);
