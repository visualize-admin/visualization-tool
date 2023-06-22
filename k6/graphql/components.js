export const query = `query Components(
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

export const variables = {
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
