import { check, fail } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const query = `query DataCubeComponents(
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $cubeFilter: DataCubeComponentFilter!
) {
  dataCubeComponents(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}`;

const env = __ENV.ENV;
const cubeIri = __ENV.CUBE_IRI;
const cubeLabel = __ENV.CUBE_LABEL;

const variables = {
  locale: "en",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  cubeFilter: {
    iri: cubeIri,
  },
};

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 1,
};

const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};

export default function Components() {
  exec.vu.metrics.tags.env = env;
  exec.vu.metrics.tags.cube = cubeLabel;

  const res = http.post(
    `https://${env === "prod" ? "" : `${env}.`}visualize.admin.ch/api/graphql`,
    JSON.stringify({ query, variables }),
    { headers }
  );

  if (!check(res, { "Status code must be 200": (res) => res.status == 200 })) {
    fail("Status code was *not* 200!");
  }
}
