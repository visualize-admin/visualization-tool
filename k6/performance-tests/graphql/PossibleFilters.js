import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const rootPath = __ENV.ROOT_PATH || "../../../";
const cubes = require(`${rootPath}k6/performance-tests/data.js`);

const query = `query PossibleFilters(
  $iri: String!
  $sourceType: String!
  $sourceUrl: String!
  $filters: Filters!
) {
  possibleFilters(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    filters: $filters
  ) {
    iri
    type
    value
  }
}`;

const env = __ENV.ENV;
const cubeIri = __ENV.CUBE_IRI;
const cubeLabel = __ENV.CUBE_LABEL;
const endpoint = __ENV.ENDPOINT;
const metadata = cubes.find((cube) => cube.iri === cubeIri);
const checkTiming = __ENV.CHECK_TIMING === "true";

const variables = {
  iri: cubeIri,
  locale: "en",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  filters: metadata.filters,
};

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 2,
};

const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};

export default function Observations() {
  exec.vu.metrics.tags.env = env;
  exec.vu.metrics.tags.cube = cubeLabel;

  const res = http.post(endpoint, JSON.stringify({ query, variables }), {
    headers,
  });

  check(res, {
    "Response must have data": (res) => {
      const body = res.json();
      return (
        body.data &&
        body.data.possibleFilters &&
        body.data.possibleFilters.length > 0
      );
    },
    ...(checkTiming
      ? {
          "Response time must be fast": (res) => {
            return (
              res.timings.duration <
              2 * metadata.queries.PossibleFilters.expectedDuration
            );
          },
        }
      : {}),
  });
}
