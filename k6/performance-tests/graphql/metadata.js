import exec from "k6/execution";
import http from "k6/http";

const query = `query DataCubeMetadata(
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $cubeFilter: DataCubeMetadataFilter!
) {
  dataCubeMetadata(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}`;

const variables = {
  locale: "en",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  cubeFilter: {
    iri: "https://culture.ld.admin.ch/sfa/StateAccounts_Office/4/",
  },
};

const env = __ENV.ENV || "prod";
const enableCache = __ENV.ENABLE_GQL_SERVER_SIDE_CACHE === "true";

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 1,
  ext: {
    loadimpact: {
      name: `GraphQL - DataCubeMetadata (${env.toUpperCase()}, GQL ${
        enableCache ? "cache" : "no-cache"
      })`,
    },
  },
};

export default function Components() {
  // Set tags for metrics
  exec.vu.metrics.tags.env = "int";
  exec.vu.metrics.tags.cube = "StateAccounts_Office/4/";

  http.post(
    "https://int.visualize.admin.ch/api/graphql",
    JSON.stringify({ query, variables }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
