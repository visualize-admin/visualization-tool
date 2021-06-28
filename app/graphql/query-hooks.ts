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
  DimensionValue: any;
  Filters: any;
  Observation: any;
  RawObservation: any;
};

export type DataCube = {
  __typename: 'DataCube';
  iri: Scalars['String'];
  title: Scalars['String'];
  version?: Maybe<Scalars['String']>;
  contactName?: Maybe<Scalars['String']>;
  contactEmail?: Maybe<Scalars['String']>;
  publisher?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  datePublished?: Maybe<Scalars['String']>;
  publicationStatus: DataCubePublicationStatus;
  observations: ObservationsQuery;
  dimensions: Array<Dimension>;
  dimensionByIri?: Maybe<Dimension>;
  measures: Array<Measure>;
};


export type DataCubeObservationsArgs = {
  limit?: Maybe<Scalars['Int']>;
  measures?: Maybe<Array<Scalars['String']>>;
  filters?: Maybe<Scalars['Filters']>;
};


export type DataCubeDimensionByIriArgs = {
  iri: Scalars['String'];
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

export type Dimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
};



export type Measure = Dimension & {
  __typename: 'Measure';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
};

export type NominalDimension = Dimension & {
  __typename: 'NominalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
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

export type OrdinalDimension = Dimension & {
  __typename: 'OrdinalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
};

export type Query = {
  __typename: 'Query';
  dataCubeByIri?: Maybe<DataCube>;
  dataCubes: Array<DataCubeResult>;
};


export type QueryDataCubeByIriArgs = {
  locale?: Maybe<Scalars['String']>;
  iri: Scalars['String'];
};


export type QueryDataCubesArgs = {
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  order?: Maybe<DataCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
};


export type TemporalDimension = Dimension & {
  __typename: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  timeUnit: TimeUnit;
  timeFormat: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
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
}>;


export type DataCubesQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCubeResult', highlightedTitle?: Maybe<string>, highlightedDescription?: Maybe<string>, dataCube: { __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus } }> };

type DimensionFields_Measure_Fragment = { __typename: 'Measure', iri: string, label: string };

type DimensionFields_NominalDimension_Fragment = { __typename: 'NominalDimension', iri: string, label: string };

type DimensionFields_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', iri: string, label: string };

type DimensionFields_TemporalDimension_Fragment = { __typename: 'TemporalDimension', iri: string, label: string };

export type DimensionFieldsFragment = DimensionFields_Measure_Fragment | DimensionFields_NominalDimension_Fragment | DimensionFields_OrdinalDimension_Fragment | DimensionFields_TemporalDimension_Fragment;

type DimensionFieldsWithValues_Measure_Fragment = { __typename: 'Measure', iri: string, label: string, isKeyDimension: boolean, values: Array<any> };

type DimensionFieldsWithValues_NominalDimension_Fragment = { __typename: 'NominalDimension', iri: string, label: string, isKeyDimension: boolean, values: Array<any> };

type DimensionFieldsWithValues_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', iri: string, label: string, isKeyDimension: boolean, values: Array<any> };

type DimensionFieldsWithValues_TemporalDimension_Fragment = { __typename: 'TemporalDimension', iri: string, label: string, isKeyDimension: boolean, values: Array<any> };

export type DimensionFieldsWithValuesFragment = DimensionFieldsWithValues_Measure_Fragment | DimensionFieldsWithValues_NominalDimension_Fragment | DimensionFieldsWithValues_OrdinalDimension_Fragment | DimensionFieldsWithValues_TemporalDimension_Fragment;

export type DataCubePreviewQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, dimensions: Array<(
      { __typename: 'Measure' }
      & DimensionFields_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionFields_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFields_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionFields_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionFields_Measure_Fragment
    )> }> };

export type DataCubePreviewObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  measures: Array<Scalars['String']> | Scalars['String'];
}>;


export type DataCubePreviewObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', observations: { __typename: 'ObservationsQuery', data: Array<any>, sparql: string } }> };

export type DataCubeMetadataQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publisher?: Maybe<string>, version?: Maybe<string>, contactName?: Maybe<string>, contactEmail?: Maybe<string>, datePublished?: Maybe<string>, publicationStatus: DataCubePublicationStatus }> };

export type DataCubeMetadataWithComponentsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubeMetadataWithComponentsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, dimensions: Array<(
      { __typename: 'Measure' }
      & DimensionFields_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionFields_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFields_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionFields_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionFields_Measure_Fragment
    )> }> };

export type DataCubeMetadataWithComponentValuesQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubeMetadataWithComponentValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, publisher?: Maybe<string>, dimensions: Array<(
      { __typename: 'Measure' }
      & DimensionFieldsWithValues_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionFieldsWithValues_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFieldsWithValues_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string }
      & DimensionFieldsWithValues_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionFieldsWithValues_Measure_Fragment
    )> }> };

export type DimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<(
      { __typename: 'Measure' }
      & DimensionFieldsWithValues_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionFieldsWithValues_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFieldsWithValues_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string }
      & DimensionFieldsWithValues_TemporalDimension_Fragment
    )> }> };

export type TemporalDimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type TemporalDimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'Measure' } | { __typename: 'NominalDimension' } | { __typename: 'OrdinalDimension' } | (
      { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string }
      & DimensionFieldsWithValues_TemporalDimension_Fragment
    )> }> };

export type DataCubeObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  measures: Array<Scalars['String']> | Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, dimensions: Array<(
      { __typename: 'Measure' }
      & DimensionFieldsWithValues_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionFieldsWithValues_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFieldsWithValues_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionFieldsWithValues_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionFields_Measure_Fragment
    )>, observations: { __typename: 'ObservationsQuery', data: Array<any>, sparqlEditorUrl?: Maybe<string> } }> };

export const DimensionFieldsFragmentDoc = gql`
    fragment dimensionFields on Dimension {
  iri
  label
}
    `;
export const DimensionFieldsWithValuesFragmentDoc = gql`
    fragment dimensionFieldsWithValues on Dimension {
  iri
  label
  isKeyDimension
  values
}
    `;
export const DataCubesDocument = gql`
    query DataCubes($locale: String!, $query: String, $order: DataCubeResultOrder, $includeDrafts: Boolean) {
  dataCubes(
    locale: $locale
    query: $query
    order: $order
    includeDrafts: $includeDrafts
  ) {
    highlightedTitle
    highlightedDescription
    dataCube {
      iri
      title
      description
      publicationStatus
    }
  }
}
    `;

export function useDataCubesQuery(options: Omit<Urql.UseQueryArgs<DataCubesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubesQuery>({ query: DataCubesDocument, ...options });
};
export const DataCubePreviewDocument = gql`
    query DataCubePreview($iri: String!, $locale: String!) {
  dataCubeByIri(iri: $iri, locale: $locale) {
    iri
    title
    description
    publicationStatus
    dimensions {
      ...dimensionFields
    }
    measures {
      ...dimensionFields
    }
  }
}
    ${DimensionFieldsFragmentDoc}`;

export function useDataCubePreviewQuery(options: Omit<Urql.UseQueryArgs<DataCubePreviewQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubePreviewQuery>({ query: DataCubePreviewDocument, ...options });
};
export const DataCubePreviewObservationsDocument = gql`
    query DataCubePreviewObservations($iri: String!, $locale: String!, $measures: [String!]!) {
  dataCubeByIri(iri: $iri, locale: $locale) {
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
    query DataCubeMetadata($iri: String!, $locale: String!) {
  dataCubeByIri(iri: $iri, locale: $locale) {
    iri
    title
    description
    publisher
    version
    contactName
    contactEmail
    datePublished
    publicationStatus
  }
}
    `;

export function useDataCubeMetadataQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataQuery>({ query: DataCubeMetadataDocument, ...options });
};
export const DataCubeMetadataWithComponentsDocument = gql`
    query DataCubeMetadataWithComponents($iri: String!, $locale: String!) {
  dataCubeByIri(iri: $iri, locale: $locale) {
    iri
    title
    dimensions {
      ...dimensionFields
    }
    measures {
      ...dimensionFields
    }
  }
}
    ${DimensionFieldsFragmentDoc}`;

export function useDataCubeMetadataWithComponentsQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataWithComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataWithComponentsQuery>({ query: DataCubeMetadataWithComponentsDocument, ...options });
};
export const DataCubeMetadataWithComponentValuesDocument = gql`
    query DataCubeMetadataWithComponentValues($iri: String!, $locale: String!) {
  dataCubeByIri(iri: $iri, locale: $locale) {
    iri
    title
    publisher
    dimensions {
      ...dimensionFieldsWithValues
      ... on TemporalDimension {
        timeUnit
        timeFormat
      }
    }
    measures {
      ...dimensionFieldsWithValues
    }
  }
}
    ${DimensionFieldsWithValuesFragmentDoc}`;

export function useDataCubeMetadataWithComponentValuesQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataWithComponentValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataWithComponentValuesQuery>({ query: DataCubeMetadataWithComponentValuesDocument, ...options });
};
export const DimensionValuesDocument = gql`
    query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $locale: String!) {
  dataCubeByIri(iri: $dataCubeIri, locale: $locale) {
    dimensionByIri(iri: $dimensionIri) {
      ...dimensionFieldsWithValues
      ... on TemporalDimension {
        timeUnit
        timeFormat
      }
    }
  }
}
    ${DimensionFieldsWithValuesFragmentDoc}`;

export function useDimensionValuesQuery(options: Omit<Urql.UseQueryArgs<DimensionValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DimensionValuesQuery>({ query: DimensionValuesDocument, ...options });
};
export const TemporalDimensionValuesDocument = gql`
    query TemporalDimensionValues($dataCubeIri: String!, $dimensionIri: String!, $locale: String!) {
  dataCubeByIri(iri: $dataCubeIri, locale: $locale) {
    dimensionByIri(iri: $dimensionIri) {
      ... on TemporalDimension {
        ...dimensionFieldsWithValues
        timeUnit
        timeFormat
      }
    }
  }
}
    ${DimensionFieldsWithValuesFragmentDoc}`;

export function useTemporalDimensionValuesQuery(options: Omit<Urql.UseQueryArgs<TemporalDimensionValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<TemporalDimensionValuesQuery>({ query: TemporalDimensionValuesDocument, ...options });
};
export const DataCubeObservationsDocument = gql`
    query DataCubeObservations($iri: String!, $locale: String!, $measures: [String!]!, $filters: Filters) {
  dataCubeByIri(iri: $iri, locale: $locale) {
    iri
    title
    description
    dimensions {
      ...dimensionFieldsWithValues
    }
    measures {
      ...dimensionFields
    }
    observations(measures: $measures, filters: $filters) {
      data
      sparqlEditorUrl
    }
  }
}
    ${DimensionFieldsWithValuesFragmentDoc}
${DimensionFieldsFragmentDoc}`;

export function useDataCubeObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubeObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeObservationsQuery>({ query: DataCubeObservationsDocument, ...options });
};