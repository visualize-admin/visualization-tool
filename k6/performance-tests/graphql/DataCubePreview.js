import exec from "k6/execution";
import http from "k6/http";

const query = `query DataCubePreview(
  $iri: String!
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $latest: Boolean
  $disableValuesLoad: Boolean = true
) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
    disableValuesLoad: $disableValuesLoad
  ) {
    iri
    title
    description
    publicationStatus
    observations(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      preview: true
      limit: 10
    ) {
      data
      sparqlEditorUrl
    }
  }
}`;

const env = __ENV.ENV;
const cubeIri = __ENV.CUBE_IRI;
const cubeLabel = __ENV.CUBE_LABEL;

const variables = {
  iri: cubeIri,
  sourceType: "sparql",
  sourceUrl: `https://${env === "prod" ? "" : `${env}.`}lindas.admin.ch/query`,
  locale: "en",
  latest: false,
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

  http.post(
    `https://${env === "prod" ? "" : `${env}.`}visualize.admin.ch/api/graphql`,
    JSON.stringify({ query, variables }),
    { headers }
  );
}
