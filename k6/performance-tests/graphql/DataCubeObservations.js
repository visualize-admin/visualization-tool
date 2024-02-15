import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const rootPath = __ENV.ROOT_PATH || "../../../";
const cubes = require(`${rootPath}k6/performance-tests/data.js`);

const query = `query DataCubeObservations(
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $cubeFilter: DataCubeObservationFilter!
) {
  dataCubeObservations(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}`;

const env = __ENV.ENV;
const cubeIri = __ENV.CUBE_IRI;
const cubeLabel = __ENV.CUBE_LABEL;
const endpoint = __ENV.ENDPOINT;
const metadata = cubes.find((cube) => cube.iri === cubeIri);

const variables = {
  locale: "en",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  cubeFilter: {
    iri: cubeIri,
    filters: metadata.filters,
  },
};

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 2,
  thresholds: {
    http_req_duration: [
      `avg<${2 * metadata.queries.DataCubeObservations.expectedDuration}`,
    ],
  },
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
        body.data.dataCubeObservations &&
        body.data.dataCubeObservations &&
        body.data.dataCubeObservations.data.length > 0 &&
        body.data.dataCubeObservations.sparqlEditorUrl
      );
    },
  });
}
