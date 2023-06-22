import { sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

const url = "https://test.visualize.admin.ch/api/graphql";
const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};
const query = `query Components(
  $iri: String!
  $sourceType: String!
  $sourceUrl: String!
  $locale: String!
  $latest: Boolean
  $filters: Filters
  $componentIris: [String!]
) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    dimensions(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIris: $componentIris
    ) {
      ...dimensionMetadata
      __typename
    }

    measures(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIris: $componentIris
    ) {
      ...dimensionMetadata
      __typename
    }
    __typename
  }
}

fragment dimensionMetadata on Dimension {
  iri
  label
  description
  isNumerical
  isKeyDimension
  dataType
  order
  values(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    filters: $filters
  )
  unit
  related {
    iri
    type
    __typename
  }
  
  ... on TemporalDimension {
    timeUnit
    timeFormat
    __typename
  }
  
  ... on NumericalMeasure {
    isCurrency
    currencyExponent
    resolution
    isDecimal
    __typename
  }
}`;
const variables = {
  iri: "https://environment.ld.admin.ch/foen/ubd003701/2",
  sourceType: "sparql",
  sourceUrl: "https://lindas.admin.ch/query",
  locale: "en",
  componentIris: [
    "https://environment.ld.admin.ch/foen/ubd003701/beurteilung",
    "https://environment.ld.admin.ch/foen/ubd003701/gemeindetype",
    "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit",
  ],
};

export const options: Options = {
  duration: "40s",
  vus: 75,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
  ext: {
    loadimpact: {
      projectId: 3643757,
      name: "GraphQL - Components (TEST)",
    },
  },
};

export default function Components() {
  http.post(url, JSON.stringify({ query, variables }), { headers });
  sleep(1);
}
