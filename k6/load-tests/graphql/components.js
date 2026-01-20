import { sleep } from "k6";
import http from "k6/http";

import { getHeaders, getUrl } from "../../graphql-utils.js";
import { DISTRIBUTION, PROJECT_ID } from "../../k6-utils.js";

const query = `query Components(
  $iri: String!
  $sourceType: String!
  $sourceUrl: DataSourceUrl!
  $locale: String!
  $filters: Filters
  $componentIds: [String!]
) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
  ) {
    dimensions(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIds: $componentIds
    ) {
      ...dimensionMetadata
      __typename
    }

    measures(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIds: $componentIds
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
  sourceUrl: "https://lindas.cz-aws.net/query",
  locale: "en",
  componentIds: [
    "https://environment.ld.admin.ch/foen/ubd003701/beurteilung",
    "https://environment.ld.admin.ch/foen/ubd003701/gemeindetype",
    "https://environment.ld.admin.ch/foen/ubd003701/laermbelasteteeinheit",
  ],
};

const env = __ENV.ENV;
const enableCache = __ENV.ENABLE_GQL_SERVER_SIDE_CACHE === "true";

/** @type {import("k6/options").Options} */
export const options = {
  duration: "60s",
  vus: 50,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
  ext: {
    loadimpact: {
      projectId: PROJECT_ID,
      name: `GraphQL - Components (${env.toUpperCase()}, GQL ${enableCache ? "cache" : "no-cache"
        })`,
      distribution: DISTRIBUTION,
    },
  },
};

export default function Components () {
  http.post(getUrl(env), JSON.stringify({ query, variables }), {
    headers: getHeaders(enableCache),
  });
  sleep(1);
}
