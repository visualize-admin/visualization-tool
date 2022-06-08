import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { SPARQL_ENDPOINT } from "../domain/env";

export const sparqlClient = new ParsingClient({
  endpointUrl: SPARQL_ENDPOINT,
});

export const sparqlClientStream = new StreamClient({
  endpointUrl: SPARQL_ENDPOINT,
});
