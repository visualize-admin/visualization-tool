import { atom } from "jotai";

import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

export const dataSourceAtom = atom(DEFAULT_DATA_SOURCE);
