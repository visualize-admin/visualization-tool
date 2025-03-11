import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";

const cubes = JSON.parse(
  open(`${__ENV.WORKSPACE}/k6/performance-tests/data.json`)
);
const query = `query DataCubePreview(
  $sourceType: String!
  $sourceUrl: DataSourceUrl!
  $locale: String!
  $cubeFilter: DataCubePreviewFilter!
) {
  dataCubePreview(
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
  sourceUrl: "https://lindas.admin.ch/query",
  cubeFilter: {
    iri: cubeIri,
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

export default function Components() {
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
        body.data.dataCubePreview &&
        body.data.dataCubePreview.dimensions &&
        body.data.dataCubePreview.dimensions.length > 0 &&
        body.data.dataCubePreview.measures &&
        body.data.dataCubePreview.measures.length > 0 &&
        body.data.dataCubePreview.observations &&
        body.data.dataCubePreview.observations.length > 0
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

export function handleSummary(data) {
  if (durationExceedsThreshold(data.metrics.http_req_duration.values.avg)) {
    return {
      stdout: `${Math.round(
        (100 * data.metrics.http_req_duration.values.avg) /
          metadata.queries.DataCubePreview.expectedDuration
      )}% – DataCubePreview – ${cubeLabel}. `,
    };
  }

  return {
    stdout: "",
  };
}

function durationExceedsThreshold(duration) {
  return duration > 2 * metadata.queries.DataCubePreview.expectedDuration;
}
