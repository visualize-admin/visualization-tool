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

const env = __ENV.ENV;
const cube = __ENV.CUBE;

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 1,
};

export default function Components() {
  exec.vu.metrics.tags.env = env;
  exec.vu.metrics.tags.cube = cube;

  http.post(
    `https://${env === "prod" ? "" : `${env}.`}visualize.admin.ch/api/graphql`,
    JSON.stringify({ query, variables }),
    {
      headers: {
        "Content-Type": "application/json",
        "x-visualize-cache-control": "no-cache",
      },
    }
  );
}
