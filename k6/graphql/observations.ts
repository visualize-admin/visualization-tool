import { sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

const url = "https://test.visualize.admin.ch/api/graphql";
const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};
const query = `query DataCubeObservations(
  $iri: String!
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $componentIris: [String!]
  $filters: Filters
  $latest: Boolean
  $limit: Int
) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    observations(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIris: $componentIris
      filters: $filters
      limit: $limit
    ) {
      data
      sparqlEditorUrl
      __typename
    }
    __typename
  }
}`;
const variables = {
  iri: "https://culture.ld.admin.ch/sfa/StateAccounts_Office/4/",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  locale: "en",
  componentIris: [
    "http://www.w3.org/2006/time#Year",
    "http://schema.org/amount",
    "https://culture.ld.admin.ch/sfa/StateAccounts_Office/operationcharacter",
    "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office",
  ],
  filters: {
    "https://culture.ld.admin.ch/sfa/StateAccounts_Office/office": {
      type: "single",
      value: "https://culture.ld.admin.ch/sfa/StateAccounts_Office/Office/O7",
    },
  },
};

export const options: Options = {
  duration: "40s",
  vus: 75,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  http.post(url, JSON.stringify({ query, variables }), { headers });
  sleep(1);
}
