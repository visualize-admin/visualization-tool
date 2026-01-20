import { sleep } from "k6";
import http from "k6/http";

import { getHeaders, getUrl } from "../../graphql-utils.js";
import { DISTRIBUTION, PROJECT_ID } from "../../k6-utils.js";

const query = `query DataCubeObservations(
  $iri: String!
  $sourceType: String!
  $sourceUrl: DataSourceUrl!
  $locale: String!
  $componentIds: [String!]
  $filters: Filters
  $limit: Int
) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
  ) {
    observations(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIds: $componentIds
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
  sourceUrl: "https://lindas.cz-aws.net/query",
  locale: "en",
  componentIds: [
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

const env = __ENV.ENV;
const enableCache = __ENV.ENABLE_GQL_SERVER_SIDE_CACHE === "true";

/** @type {import("k6/options").Options} */
export const options = {
  duration: "60s",
  vus: 50,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1250"],
  },
  ext: {
    loadimpact: {
      projectId: PROJECT_ID,
      name: `GraphQL - Observations (${env.toUpperCase()}, GQL ${enableCache ? "cache" : "no-cache"
        })`,
      distribution: DISTRIBUTION,
    },
  },
};

export default function Observations () {
  http.post(getUrl(env), JSON.stringify({ query, variables }), {
    headers: getHeaders(enableCache),
  });
  sleep(1);
}
