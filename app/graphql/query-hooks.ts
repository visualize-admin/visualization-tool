import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Filters: any;
  Observation: any;
  RawObservation: any;
};

export type CategoricalDimension = Dimension & {
  __typename: 'CategoricalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension: Scalars['Boolean'];
  isOrdinal: Scalars['Boolean'];
  values: Array<CategoricalValue>;
};

export type CategoricalValue = {
  __typename: 'CategoricalValue';
  value: Scalars['String'];
  label: Scalars['String'];
  position?: Maybe<Scalars['Int']>;
};

export type DataCube = {
  __typename: 'DataCube';
  iri: Scalars['String'];
  title: Scalars['String'];
  version?: Maybe<Scalars['String']>;
  contactName?: Maybe<Scalars['String']>;
  contactEmail?: Maybe<Scalars['String']>;
  creator?: Maybe<DataCubeOrganization>;
  landingPage?: Maybe<Scalars['String']>;
  publisher?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  datePublished?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['String']>;
  publicationStatus: DataCubePublicationStatus;
  observations: ObservationsQuery;
  dimensions: Array<Dimension>;
  dimensionByIri?: Maybe<Dimension>;
  measures: Array<Measure>;
  themes: Array<DataCubeTheme>;
};


export type DataCubeObservationsArgs = {
  limit?: Maybe<Scalars['Int']>;
  measures?: Maybe<Array<Scalars['String']>>;
  filters?: Maybe<Scalars['Filters']>;
};


export type DataCubeDimensionByIriArgs = {
  iri: Scalars['String'];
};

export type DataCubeOrganization = {
  __typename: 'DataCubeOrganization';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};

export enum DataCubePublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type DataCubeResult = {
  __typename: 'DataCubeResult';
  score?: Maybe<Scalars['Float']>;
  highlightedTitle?: Maybe<Scalars['String']>;
  highlightedDescription?: Maybe<Scalars['String']>;
  dataCube: DataCube;
};

export enum DataCubeResultOrder {
  Score = 'SCORE',
  TitleAsc = 'TITLE_ASC',
  CreatedDesc = 'CREATED_DESC'
}

export type DataCubeSearchFilter = {
  type: Scalars['String'];
  value: Scalars['String'];
};

export type DataCubeTheme = {
  __typename: 'DataCubeTheme';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};

export type DatasetCount = {
  __typename: 'DatasetCount';
  iri: Scalars['String'];
  count: Scalars['Int'];
};

export type Dimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension: Scalars['Boolean'];
};


export type GeoPointDimension = Dimension & {
  __typename: 'GeoPointDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension: Scalars['Boolean'];
  isOrdinal: Scalars['Boolean'];
  values: Array<CategoricalValue>;
};

export type GeoPointValue = {
  __typename: 'GeoPointValue';
  value: Scalars['String'];
  label: Scalars['String'];
  position?: Maybe<Scalars['Int']>;
  lon: Scalars['Float'];
  lat: Scalars['Float'];
};

export type GeoShapeDimension = Dimension & {
  __typename: 'GeoShapeDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension: Scalars['Boolean'];
  isOrdinal: Scalars['Boolean'];
  values: Array<CategoricalValue>;
};

export type GeoShapeValue = {
  __typename: 'GeoShapeValue';
  value: Scalars['String'];
  label: Scalars['String'];
  position?: Maybe<Scalars['Int']>;
  shape: Scalars['String'];
};

export type Measure = Dimension & {
  __typename: 'Measure';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  isKeyDimension: Scalars['Boolean'];
  min: Scalars['Float'];
  max: Scalars['Float'];
};


export type ObservationsQuery = {
  __typename: 'ObservationsQuery';
  /** Observations with their values parsed to native JS types */
  data: Array<Scalars['Observation']>;
  /** Observations with their original RDF-y type */
  rawData: Array<Scalars['RawObservation']>;
  /** The generated SPARQL query string of the current query (doesn't fetch any data) */
  sparql: Scalars['String'];
  /** The generated SPARQL query URL of the current query to run a query on the endpoint's editor directly */
  sparqlEditorUrl?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename: 'Query';
  dataCubeByIri?: Maybe<DataCube>;
  dataCubes: Array<DataCubeResult>;
  themes: Array<DataCubeTheme>;
  subthemes: Array<DataCubeTheme>;
  organizations: Array<DataCubeOrganization>;
  datasetcount?: Maybe<Array<DatasetCount>>;
};


export type QueryDataCubeByIriArgs = {
  locale?: Maybe<Scalars['String']>;
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
};


export type QueryDataCubesArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  order?: Maybe<DataCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Array<DataCubeSearchFilter>>;
};


export type QueryThemesArgs = {
  locale: Scalars['String'];
};


export type QuerySubthemesArgs = {
  locale: Scalars['String'];
  parentIri: Scalars['String'];
};


export type QueryOrganizationsArgs = {
  locale: Scalars['String'];
};


export type QueryDatasetcountArgs = {
  theme?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  subtheme?: Maybe<Scalars['String']>;
};


export type TemporalDimension = Dimension & {
  __typename: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  timeUnit: TimeUnit;
  timeFormat: Scalars['String'];
  isKeyDimension: Scalars['Boolean'];
  from: Scalars['String'];
  to: Scalars['String'];
};

export enum TimeUnit {
  Year = 'Year',
  Month = 'Month',
  Week = 'Week',
  Day = 'Day',
  Hour = 'Hour',
  Minute = 'Minute',
  Second = 'Second'
}

export type DataCubesQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  order?: Maybe<DataCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Array<DataCubeSearchFilter> | DataCubeSearchFilter>;
}>;


export type DataCubesQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCubeResult', highlightedTitle?: Maybe<string>, highlightedDescription?: Maybe<string>, dataCube: { __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, datePublished?: Maybe<string>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }>, themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }> } }> };

type DimensionMetaData_CategoricalDimension_Fragment = { __typename: 'CategoricalDimension', isOrdinal: boolean, iri: string, label: string, isKeyDimension: boolean, values: Array<{ __typename: 'CategoricalValue', value: string, label: string, position?: Maybe<number> }> };

type DimensionMetaData_GeoPointDimension_Fragment = { __typename: 'GeoPointDimension', iri: string, label: string, isKeyDimension: boolean };

type DimensionMetaData_GeoShapeDimension_Fragment = { __typename: 'GeoShapeDimension', iri: string, label: string, isKeyDimension: boolean };

type DimensionMetaData_Measure_Fragment = { __typename: 'Measure', unit?: Maybe<string>, min: number, max: number, iri: string, label: string, isKeyDimension: boolean };

type DimensionMetaData_TemporalDimension_Fragment = { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string, from: string, to: string, iri: string, label: string, isKeyDimension: boolean };

export type DimensionMetaDataFragment = DimensionMetaData_CategoricalDimension_Fragment | DimensionMetaData_GeoPointDimension_Fragment | DimensionMetaData_GeoShapeDimension_Fragment | DimensionMetaData_Measure_Fragment | DimensionMetaData_TemporalDimension_Fragment;

export type DataCubePreviewQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, dimensions: Array<(
      { __typename: 'CategoricalDimension' }
      & DimensionMetaData_CategoricalDimension_Fragment
    ) | (
      { __typename: 'GeoPointDimension' }
      & DimensionMetaData_GeoPointDimension_Fragment
    ) | (
      { __typename: 'GeoShapeDimension' }
      & DimensionMetaData_GeoShapeDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetaData_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    )> }> };

export type DataCubePreviewObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  measures: Array<Scalars['String']> | Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubePreviewObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', observations: { __typename: 'ObservationsQuery', data: Array<any>, sparql: string } }> };

export type DataCubeMetadataQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publisher?: Maybe<string>, version?: Maybe<string>, contactName?: Maybe<string>, contactEmail?: Maybe<string>, landingPage?: Maybe<string>, expires?: Maybe<string>, datePublished?: Maybe<string>, publicationStatus: DataCubePublicationStatus, themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }> }> };

export type DataCubeMetadataWithComponentValuesQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubeMetadataWithComponentValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, publisher?: Maybe<string>, dimensions: Array<(
      { __typename: 'CategoricalDimension' }
      & DimensionMetaData_CategoricalDimension_Fragment
    ) | (
      { __typename: 'GeoPointDimension' }
      & DimensionMetaData_GeoPointDimension_Fragment
    ) | (
      { __typename: 'GeoShapeDimension' }
      & DimensionMetaData_GeoShapeDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetaData_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    )> }> };

export type DimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<(
      { __typename: 'CategoricalDimension' }
      & DimensionMetaData_CategoricalDimension_Fragment
    ) | (
      { __typename: 'GeoPointDimension' }
      & DimensionMetaData_GeoPointDimension_Fragment
    ) | (
      { __typename: 'GeoShapeDimension' }
      & DimensionMetaData_GeoShapeDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetaData_TemporalDimension_Fragment
    )> }> };

export type TemporalDimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type TemporalDimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'CategoricalDimension' } | { __typename: 'GeoPointDimension' } | { __typename: 'GeoShapeDimension' } | { __typename: 'Measure' } | (
      { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string }
      & DimensionMetaData_TemporalDimension_Fragment
    )> }> };

export type DataCubeObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  measures: Array<Scalars['String']> | Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, dimensions: Array<(
      { __typename: 'CategoricalDimension' }
      & DimensionMetaData_CategoricalDimension_Fragment
    ) | (
      { __typename: 'GeoPointDimension' }
      & DimensionMetaData_GeoPointDimension_Fragment
    ) | (
      { __typename: 'GeoShapeDimension' }
      & DimensionMetaData_GeoShapeDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetaData_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    )>, observations: { __typename: 'ObservationsQuery', data: Array<any>, sparqlEditorUrl?: Maybe<string> } }> };

export type ThemesQueryVariables = Exact<{
  locale: Scalars['String'];
}>;


export type ThemesQuery = { __typename: 'Query', themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }> };

export type OrganizationsQueryVariables = Exact<{
  locale: Scalars['String'];
}>;


export type OrganizationsQuery = { __typename: 'Query', organizations: Array<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }> };

export type SubthemesQueryVariables = Exact<{
  locale: Scalars['String'];
  parentIri: Scalars['String'];
}>;


export type SubthemesQuery = { __typename: 'Query', subthemes: Array<{ __typename: 'DataCubeTheme', label?: Maybe<string>, iri: string }> };

export type DatasetCountQueryVariables = Exact<{
  theme?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  subtheme?: Maybe<Scalars['String']>;
}>;


export type DatasetCountQuery = { __typename: 'Query', datasetcount?: Maybe<Array<{ __typename: 'DatasetCount', count: number, iri: string }>> };

export const DimensionMetaDataFragmentDoc = gql`
    fragment dimensionMetaData on Dimension {
  iri
  label
  isKeyDimension
  ... on CategoricalDimension {
    isOrdinal
    values {
      value
      label
      position
    }
  }
  ... on Measure {
    unit
    min
    max
  }
  ... on TemporalDimension {
    timeUnit
    timeFormat
    from
    to
  }
}
    `;
export const DataCubesDocument = gql`
    query DataCubes($locale: String!, $query: String, $order: DataCubeResultOrder, $includeDrafts: Boolean, $filters: [DataCubeSearchFilter!]) {
  dataCubes(
    locale: $locale
    query: $query
    order: $order
    includeDrafts: $includeDrafts
    filters: $filters
  ) {
    highlightedTitle
    highlightedDescription
    dataCube {
      iri
      title
      creator {
        iri
        label
      }
      description
      publicationStatus
      datePublished
      themes {
        iri
        label
      }
    }
  }
}
    `;

export function useDataCubesQuery(options: Omit<Urql.UseQueryArgs<DataCubesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubesQuery>({ query: DataCubesDocument, ...options });
};
export const DataCubePreviewDocument = gql`
    query DataCubePreview($iri: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(iri: $iri, locale: $locale, latest: $latest) {
    iri
    title
    description
    publicationStatus
    dimensions {
      ...dimensionMetaData
    }
    measures {
      ...dimensionMetaData
    }
  }
}
    ${DimensionMetaDataFragmentDoc}`;

export function useDataCubePreviewQuery(options: Omit<Urql.UseQueryArgs<DataCubePreviewQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubePreviewQuery>({ query: DataCubePreviewDocument, ...options });
};
export const DataCubePreviewObservationsDocument = gql`
    query DataCubePreviewObservations($iri: String!, $locale: String!, $measures: [String!]!, $latest: Boolean) {
  dataCubeByIri(iri: $iri, locale: $locale, latest: $latest) {
    observations(limit: 10, measures: $measures) {
      data
      sparql
    }
  }
}
    `;

export function useDataCubePreviewObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubePreviewObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubePreviewObservationsQuery>({ query: DataCubePreviewObservationsDocument, ...options });
};
export const DataCubeMetadataDocument = gql`
    query DataCubeMetadata($iri: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(iri: $iri, locale: $locale, latest: $latest) {
    iri
    title
    description
    publisher
    version
    contactName
    contactEmail
    landingPage
    expires
    datePublished
    publicationStatus
    themes {
      iri
      label
    }
    creator {
      iri
      label
    }
  }
}
    `;

export function useDataCubeMetadataQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataQuery>({ query: DataCubeMetadataDocument, ...options });
};
export const DataCubeMetadataWithComponentValuesDocument = gql`
    query DataCubeMetadataWithComponentValues($iri: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(iri: $iri, locale: $locale, latest: $latest) {
    iri
    title
    publisher
    dimensions {
      ...dimensionMetaData
    }
    measures {
      ...dimensionMetaData
    }
  }
}
    ${DimensionMetaDataFragmentDoc}`;

export function useDataCubeMetadataWithComponentValuesQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataWithComponentValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataWithComponentValuesQuery>({ query: DataCubeMetadataWithComponentValuesDocument, ...options });
};
export const DimensionValuesDocument = gql`
    query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(iri: $dataCubeIri, locale: $locale, latest: $latest) {
    dimensionByIri(iri: $dimensionIri) {
      ...dimensionMetaData
    }
  }
}
    ${DimensionMetaDataFragmentDoc}`;

export function useDimensionValuesQuery(options: Omit<Urql.UseQueryArgs<DimensionValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DimensionValuesQuery>({ query: DimensionValuesDocument, ...options });
};
export const TemporalDimensionValuesDocument = gql`
    query TemporalDimensionValues($dataCubeIri: String!, $dimensionIri: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(iri: $dataCubeIri, locale: $locale, latest: $latest) {
    dimensionByIri(iri: $dimensionIri) {
      ... on TemporalDimension {
        ...dimensionMetaData
        timeUnit
        timeFormat
      }
    }
  }
}
    ${DimensionMetaDataFragmentDoc}`;

export function useTemporalDimensionValuesQuery(options: Omit<Urql.UseQueryArgs<TemporalDimensionValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<TemporalDimensionValuesQuery>({ query: TemporalDimensionValuesDocument, ...options });
};
export const DataCubeObservationsDocument = gql`
    query DataCubeObservations($iri: String!, $locale: String!, $measures: [String!]!, $filters: Filters, $latest: Boolean) {
  dataCubeByIri(iri: $iri, locale: $locale, latest: $latest) {
    iri
    title
    description
    dimensions {
      ...dimensionMetaData
    }
    measures {
      ...dimensionMetaData
    }
    observations(measures: $measures, filters: $filters) {
      data
      sparqlEditorUrl
    }
  }
}
    ${DimensionMetaDataFragmentDoc}`;

export function useDataCubeObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubeObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeObservationsQuery>({ query: DataCubeObservationsDocument, ...options });
};
export const ThemesDocument = gql`
    query Themes($locale: String!) {
  themes(locale: $locale) {
    iri
    label
  }
}
    `;

export function useThemesQuery(options: Omit<Urql.UseQueryArgs<ThemesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ThemesQuery>({ query: ThemesDocument, ...options });
};
export const OrganizationsDocument = gql`
    query Organizations($locale: String!) {
  organizations(locale: $locale) {
    iri
    label
  }
}
    `;

export function useOrganizationsQuery(options: Omit<Urql.UseQueryArgs<OrganizationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<OrganizationsQuery>({ query: OrganizationsDocument, ...options });
};
export const SubthemesDocument = gql`
    query Subthemes($locale: String!, $parentIri: String!) {
  subthemes(locale: $locale, parentIri: $parentIri) {
    label
    iri
  }
}
    `;

export function useSubthemesQuery(options: Omit<Urql.UseQueryArgs<SubthemesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<SubthemesQuery>({ query: SubthemesDocument, ...options });
};
export const DatasetCountDocument = gql`
    query DatasetCount($theme: String, $organization: String, $subtheme: String) {
  datasetcount(theme: $theme, organization: $organization, subtheme: $subtheme) {
    count
    iri
  }
}
    `;

export function useDatasetCountQuery(options: Omit<Urql.UseQueryArgs<DatasetCountQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DatasetCountQuery>({ query: DatasetCountDocument, ...options });
};