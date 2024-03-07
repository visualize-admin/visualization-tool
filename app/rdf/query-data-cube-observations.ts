import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { Filters } from "@/config-types";

export const getCubeObservations = (
  cubeIri: string,
  options: {
    locale: string;
    sparqlClient: ParsingClient;
    cache: LRUCache | undefined;
    /** Limit on the number of observations returned */
    componentIris?: string[] | null;
    /** Observations filters that should be considered */
    filters?: Filters | null;
    limit?: number | null;
  }
) => {};
