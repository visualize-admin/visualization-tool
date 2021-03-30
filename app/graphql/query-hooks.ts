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
  Observation: any;
  RawObservation: any;
  Filters: any;
};




export type ObservationsQuery = {
  __typename: 'ObservationsQuery';
  /** Observations with their values parsed to native JS types */
  data: Array<Scalars['Observation']>;
  /** Observations with their original RDF-y type */
  rawData: Array<Scalars['RawObservation']>;
  /** The generated SPARQL query string of the current query (doesn't fetch any data) */
  sparql: Scalars['String'];
};

export enum DataCubePublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type DataCube = {
  __typename: 'DataCube';
  iri: Scalars['String'];
  title: Scalars['String'];
  contact?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
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

export type DimensionValue = {
  __typename: 'DimensionValue';
  value?: Maybe<Scalars['String']>;
  label: Scalars['String'];
};

export type Component = {
  iri: Scalars['String'];
  label: Scalars['String'];
};

export type Dimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  values: Array<DimensionValue>;
};

export type NominalDimension = Component & Dimension & {
  __typename: 'NominalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  values: Array<DimensionValue>;
};

export type OrdinalDimension = Component & Dimension & {
  __typename: 'OrdinalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  values: Array<DimensionValue>;
};

export type TemporalDimension = Component & Dimension & {
  __typename: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  values: Array<DimensionValue>;
};

export type Measure = Component & Dimension & {
  __typename: 'Measure';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  values: Array<DimensionValue>;
};

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

export type DataCubesQueryVariables = Exact<{
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  order?: Maybe<DataCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubesQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCubeResult', highlightedTitle?: Maybe<string>, highlightedDescription?: Maybe<string>, dataCube: { __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus } }> };

type ComponentFields_NominalDimension_Fragment = { __typename: 'NominalDimension', iri: string, label: string };

type ComponentFields_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', iri: string, label: string };

type ComponentFields_TemporalDimension_Fragment = { __typename: 'TemporalDimension', iri: string, label: string };

type ComponentFields_Measure_Fragment = { __typename: 'Measure', iri: string, label: string };

export type ComponentFieldsFragment = ComponentFields_NominalDimension_Fragment | ComponentFields_OrdinalDimension_Fragment | ComponentFields_TemporalDimension_Fragment | ComponentFields_Measure_Fragment;

type DimensionFieldsWithValues_NominalDimension_Fragment = { __typename: 'NominalDimension', iri: string, label: string, values: Array<{ __typename: 'DimensionValue', value?: Maybe<string>, label: string }> };

type DimensionFieldsWithValues_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', iri: string, label: string, values: Array<{ __typename: 'DimensionValue', value?: Maybe<string>, label: string }> };

type DimensionFieldsWithValues_TemporalDimension_Fragment = { __typename: 'TemporalDimension', iri: string, label: string, values: Array<{ __typename: 'DimensionValue', value?: Maybe<string>, label: string }> };

type DimensionFieldsWithValues_Measure_Fragment = { __typename: 'Measure', iri: string, label: string, values: Array<{ __typename: 'DimensionValue', value?: Maybe<string>, label: string }> };

export type DimensionFieldsWithValuesFragment = DimensionFieldsWithValues_NominalDimension_Fragment | DimensionFieldsWithValues_OrdinalDimension_Fragment | DimensionFieldsWithValues_TemporalDimension_Fragment | DimensionFieldsWithValues_Measure_Fragment;

export type DataCubePreviewQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, dimensions: Array<(
      { __typename: 'NominalDimension' }
      & ComponentFields_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & ComponentFields_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & ComponentFields_TemporalDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & ComponentFields_Measure_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & ComponentFields_Measure_Fragment
    )> }> };

export type DataCubePreviewObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  measures: Array<Scalars['String']>;
}>;


export type DataCubePreviewObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', observations: { __typename: 'ObservationsQuery', data: Array<any>, sparql: string } }> };

export type DataCubeMetadataQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, source?: Maybe<string>, datePublished?: Maybe<string>, publicationStatus: DataCubePublicationStatus }> };

export type DataCubeMetadataWithComponentsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubeMetadataWithComponentsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, dimensions: Array<(
      { __typename: 'NominalDimension' }
      & ComponentFields_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & ComponentFields_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & ComponentFields_TemporalDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & ComponentFields_Measure_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & ComponentFields_Measure_Fragment
    )> }> };

export type DataCubeMetadataWithComponentValuesQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubeMetadataWithComponentValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, source?: Maybe<string>, dimensions: Array<(
      { __typename: 'NominalDimension' }
      & DimensionFieldsWithValues_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFieldsWithValues_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionFieldsWithValues_TemporalDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionFieldsWithValues_Measure_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & ComponentFields_Measure_Fragment
    )> }> };

export type DimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<(
      { __typename: 'NominalDimension' }
      & DimensionFieldsWithValues_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFieldsWithValues_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionFieldsWithValues_TemporalDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionFieldsWithValues_Measure_Fragment
    )> }> };

export type DataCubeObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  measures: Array<Scalars['String']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, contact?: Maybe<string>, dimensions: Array<(
      { __typename: 'NominalDimension' }
      & DimensionFieldsWithValues_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionFieldsWithValues_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionFieldsWithValues_TemporalDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionFieldsWithValues_Measure_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & ComponentFields_Measure_Fragment
    )>, observations: { __typename: 'ObservationsQuery', data: Array<any> } }> };

export const ComponentFieldsFragmentDoc = gql`
    fragment componentFields on Component {
  iri
  label
}
    `;
export const DimensionFieldsWithValuesFragmentDoc = gql`
    fragment dimensionFieldsWithValues on Dimension {
  iri
  label
  values {
    value
    label
  }
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
      ...componentFields
    }
    measures {
      ...componentFields
    }
  }
}
    ${ComponentFieldsFragmentDoc}`;

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
    source
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
      ...componentFields
    }
    measures {
      ...componentFields
    }
  }
}
    ${ComponentFieldsFragmentDoc}`;

export function useDataCubeMetadataWithComponentsQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataWithComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataWithComponentsQuery>({ query: DataCubeMetadataWithComponentsDocument, ...options });
};
export const DataCubeMetadataWithComponentValuesDocument = gql`
    query DataCubeMetadataWithComponentValues($iri: String!, $locale: String!) {
  dataCubeByIri(iri: $iri, locale: $locale) {
    iri
    title
    source
    dimensions {
      ...dimensionFieldsWithValues
    }
    measures {
      ...componentFields
    }
  }
}
    ${DimensionFieldsWithValuesFragmentDoc}
${ComponentFieldsFragmentDoc}`;

export function useDataCubeMetadataWithComponentValuesQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataWithComponentValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataWithComponentValuesQuery>({ query: DataCubeMetadataWithComponentValuesDocument, ...options });
};
export const DimensionValuesDocument = gql`
    query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $locale: String!) {
  dataCubeByIri(iri: $dataCubeIri, locale: $locale) {
    dimensionByIri(iri: $dimensionIri) {
      ...dimensionFieldsWithValues
    }
  }
}
    ${DimensionFieldsWithValuesFragmentDoc}`;

export function useDimensionValuesQuery(options: Omit<Urql.UseQueryArgs<DimensionValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DimensionValuesQuery>({ query: DimensionValuesDocument, ...options });
};
export const DataCubeObservationsDocument = gql`
    query DataCubeObservations($iri: String!, $locale: String!, $measures: [String!]!, $filters: Filters) {
  dataCubeByIri(iri: $iri, locale: $locale) {
    iri
    title
    description
    contact
    dimensions {
      ...dimensionFieldsWithValues
    }
    measures {
      ...componentFields
    }
    observations(measures: $measures, filters: $filters) {
      data
    }
  }
}
    ${DimensionFieldsWithValuesFragmentDoc}
${ComponentFieldsFragmentDoc}`;

export function useDataCubeObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubeObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeObservationsQuery>({ query: DataCubeObservationsDocument, ...options });
};