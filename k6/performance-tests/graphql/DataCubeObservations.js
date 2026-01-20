import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const cubes = JSON.parse(
  open(`${__ENV.WORKSPACE}/k6/performance-tests/data.json`)
);
const query = `query DataCubeObservations(
  $sourceType: String!
  $sourceUrl: DataSourceUrl!
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
const checkTiming = __ENV.CHECK_TIMING === "true";

const variables = {
  locale: "en",
  sourceType: "sparql",
  sourceUrl: "https://lindas.cz-aws.net/query",
  cubeFilter: {
    iri: cubeIri,
    filters: metadata.filters,
  },
};

/** @type {import("k6/options").Options} */
export const options = {
  iterations: 2,
};

const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};

export default function Observations () {
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

  if (checkTiming) {
    check(res, {
      "Response time must be fast": (res) => {
        return !durationExceedsThreshold(res.timings.duration);
      },
    });
  }
}

export function handleSummary (data) {
  if (durationExceedsThreshold(data.metrics.http_req_duration.values.avg)) {
    return {
      stdout: `${Math.round(
        (100 * data.metrics.http_req_duration.values.avg) /
        metadata.queries.DataCubeObservations.expectedDuration
      )}% – DataCubeObservations – ${cubeLabel}. `,
    };
  }

  return {
    stdout: "",
  };
}

function durationExceedsThreshold (duration) {
  return duration > 2 * metadata.queries.DataCubeObservations.expectedDuration;
}
