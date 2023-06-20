import { sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";

const url = "https://int.visualize.admin.ch/api/graphql";
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
  stages: [
    { duration: "10s", target: 20 },
    { duration: "10s", target: 10 },
    { duration: "10s", target: 0 },
  ],
};

export default function () {
  http.post(url, JSON.stringify({ query, variables }), { headers });
  sleep(1);
}
