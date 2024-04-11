import { DataCubeComponents } from '../domain/data';
import { DataCubeMetadata } from '../domain/data';
import { DataCubeObservations } from '../domain/data';
import { DataCubePreview } from '../domain/data';
import { DimensionValue } from '../domain/data';
import { Filters } from '../configurator';
import { GeoShapes } from '../domain/data';
import { HierarchyValue } from '../domain/data';
import { Observation } from '../domain/data';
import { RawObservation } from '../domain/data';
import { SearchCube } from '../domain/data';
import { SingleFilters } from '../configurator';
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
  DataCubeComponents: DataCubeComponents;
  DataCubeMetadata: DataCubeMetadata;
  DataCubeObservations: DataCubeObservations;
  DataCubePreview: DataCubePreview;
  DimensionValue: DimensionValue;
  FilterValue: any;
  Filters: Filters;
  GeoShapes: GeoShapes;
  HierarchyValue: HierarchyValue;
  Observation: Observation;
  RawObservation: RawObservation;
  SearchCube: SearchCube;
  SingleFilters: SingleFilters;
  ValueIdentifier: any;
  ValuePosition: any;
};

export type DataCube = {
  __typename: 'DataCube';
  iri: Scalars['String'];
  identifier?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  version?: Maybe<Scalars['String']>;
  contactName?: Maybe<Scalars['String']>;
  contactEmail?: Maybe<Scalars['String']>;
  creator?: Maybe<DataCubeOrganization>;
  landingPage?: Maybe<Scalars['String']>;
  workExamples?: Maybe<Array<Maybe<Scalars['String']>>>;
  publisher?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  datePublished?: Maybe<Scalars['String']>;
  dateModified?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['String']>;
  publicationStatus: DataCubePublicationStatus;
  dimensions: Array<Dimension>;
  dimensionByIri?: Maybe<Dimension>;
  measures: Array<Measure>;
  themes: Array<DataCubeTheme>;
};


export type DataCubeDimensionsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  componentIris?: Maybe<Array<Scalars['String']>>;
  disableValuesLoad?: Maybe<Scalars['Boolean']>;
};


export type DataCubeDimensionByIriArgs = {
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
};


export type DataCubeMeasuresArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  componentIris?: Maybe<Array<Scalars['String']>>;
  disableValuesLoad?: Maybe<Scalars['Boolean']>;
};

export type DataCubeComponentFilter = {
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
  componentIris?: Maybe<Array<Scalars['String']>>;
  joinBy?: Maybe<Scalars['String']>;
  loadValues?: Maybe<Scalars['Boolean']>;
};



export type DataCubeMetadataFilter = {
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
};

export type DataCubeObservationFilter = {
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
  componentIris?: Maybe<Array<Scalars['String']>>;
  joinBy?: Maybe<Scalars['String']>;
};


export type DataCubeOrganization = {
  __typename: 'DataCubeOrganization';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};


export type DataCubePreviewFilter = {
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
};

export enum DataCubePublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type DataCubeTheme = {
  __typename: 'DataCubeTheme';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};

export type Dimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type DimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};




export type GeoCoordinatesDimension = Dimension & {
  __typename: 'GeoCoordinatesDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type GeoCoordinatesDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type GeoShapesDimension = Dimension & {
  __typename: 'GeoShapesDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type GeoShapesDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type Measure = NumericalMeasure | OrdinalMeasure;

export type NominalDimension = Dimension & {
  __typename: 'NominalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type NominalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};

export type NumericalMeasure = Dimension & {
  __typename: 'NumericalMeasure';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  isCurrency?: Maybe<Scalars['Boolean']>;
  isDecimal?: Maybe<Scalars['Boolean']>;
  currencyExponent?: Maybe<Scalars['Int']>;
  resolution?: Maybe<Scalars['Int']>;
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type NumericalMeasureValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type ObservationFilter = {
  __typename: 'ObservationFilter';
  type: Scalars['String'];
  value?: Maybe<Scalars['FilterValue']>;
  iri: Scalars['String'];
};

export type ObservationsQuery = {
  __typename: 'ObservationsQuery';
  data: Array<Scalars['Observation']>;
  sparqlEditorUrl?: Maybe<Scalars['String']>;
};

export type OrdinalDimension = Dimension & {
  __typename: 'OrdinalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type OrdinalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};

export type OrdinalMeasure = Dimension & {
  __typename: 'OrdinalMeasure';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type OrdinalMeasureValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};

export type Query = {
  __typename: 'Query';
  dataCubeComponents: Scalars['DataCubeComponents'];
  dataCubeMetadata: Scalars['DataCubeMetadata'];
  dataCubeObservations: Scalars['DataCubeObservations'];
  dataCubePreview: Scalars['DataCubePreview'];
  possibleFilters: Array<ObservationFilter>;
  searchCubes: Array<SearchCubeResult>;
  dataCubeDimensionGeoShapes?: Maybe<Scalars['GeoShapes']>;
};


export type QueryDataCubeComponentsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeComponentFilter;
};


export type QueryDataCubeMetadataArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeMetadataFilter;
};


export type QueryDataCubeObservationsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeObservationFilter;
};


export type QueryDataCubePreviewArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubePreviewFilter;
};


export type QueryPossibleFiltersArgs = {
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters: Scalars['SingleFilters'];
};


export type QuerySearchCubesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  order?: Maybe<SearchCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Array<SearchCubeFilter>>;
};


export type QueryDataCubeDimensionGeoShapesArgs = {
  cubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
};


export type RelatedDimension = {
  __typename: 'RelatedDimension';
  type: Scalars['String'];
  iri: Scalars['String'];
};

export enum ScaleType {
  Ordinal = 'Ordinal',
  Nominal = 'Nominal',
  Interval = 'Interval',
  Ratio = 'Ratio'
}


export type SearchCubeFilter = {
  type: SearchCubeFilterType;
  label?: Maybe<Scalars['String']>;
  value: Scalars['String'];
};

export enum SearchCubeFilterType {
  TemporalDimension = 'TemporalDimension',
  DataCubeTheme = 'DataCubeTheme',
  DataCubeOrganization = 'DataCubeOrganization',
  DataCubeAbout = 'DataCubeAbout',
  SharedDimension = 'SharedDimension'
}

export type SearchCubeResult = {
  __typename: 'SearchCubeResult';
  score?: Maybe<Scalars['Float']>;
  cube: Scalars['SearchCube'];
  highlightedTitle?: Maybe<Scalars['String']>;
  highlightedDescription?: Maybe<Scalars['String']>;
};

export enum SearchCubeResultOrder {
  Score = 'SCORE',
  TitleAsc = 'TITLE_ASC',
  CreatedDesc = 'CREATED_DESC'
}


export type StandardErrorDimension = Dimension & {
  __typename: 'StandardErrorDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type StandardErrorDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};

export type TemporalDimension = Dimension & {
  __typename: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  timeUnit: TimeUnit;
  timeFormat: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type TemporalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};

export type TemporalEntityDimension = Dimension & {
  __typename: 'TemporalEntityDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  timeUnit: TimeUnit;
  timeFormat: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type TemporalEntityDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};

export type TemporalOrdinalDimension = Dimension & {
  __typename: 'TemporalOrdinalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<ScaleType>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
};


export type TemporalOrdinalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
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



export type DataCubeComponentsQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeComponentFilter;
}>;


export type DataCubeComponentsQuery = { __typename: 'Query', dataCubeComponents: DataCubeComponents };

export type DataCubeMetadataQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeMetadataFilter;
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeMetadata: DataCubeMetadata };

export type DataCubeObservationsQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeObservationFilter;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeObservations: DataCubeObservations };

export type DataCubePreviewQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubePreviewFilter;
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubePreview: DataCubePreview };

export type SearchCubesQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  order?: Maybe<SearchCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Array<SearchCubeFilter> | SearchCubeFilter>;
}>;


export type SearchCubesQuery = { __typename: 'Query', searchCubes: Array<{ __typename: 'SearchCubeResult', highlightedTitle?: Maybe<string>, highlightedDescription?: Maybe<string>, cube: SearchCube }> };

export type PossibleFiltersQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters: Scalars['SingleFilters'];
}>;


export type PossibleFiltersQuery = { __typename: 'Query', possibleFilters: Array<{ __typename: 'ObservationFilter', iri: string, type: string, value?: Maybe<any> }> };

export type DataCubeDimensionGeoShapesQueryVariables = Exact<{
  cubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
}>;


export type DataCubeDimensionGeoShapesQuery = { __typename: 'Query', dataCubeDimensionGeoShapes?: Maybe<GeoShapes> };


export const DataCubeComponentsDocument = gql`
    query DataCubeComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {
  dataCubeComponents(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeComponentsQuery(options: Omit<Urql.UseQueryArgs<DataCubeComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeComponentsQuery>({ query: DataCubeComponentsDocument, ...options });
};
export const DataCubeMetadataDocument = gql`
    query DataCubeMetadata($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeMetadataFilter!) {
  dataCubeMetadata(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeMetadataQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataQuery>({ query: DataCubeMetadataDocument, ...options });
};
export const DataCubeObservationsDocument = gql`
    query DataCubeObservations($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {
  dataCubeObservations(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubeObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeObservationsQuery>({ query: DataCubeObservationsDocument, ...options });
};
export const DataCubePreviewDocument = gql`
    query DataCubePreview($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeFilter: DataCubePreviewFilter!) {
  dataCubePreview(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubePreviewQuery(options: Omit<Urql.UseQueryArgs<DataCubePreviewQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubePreviewQuery>({ query: DataCubePreviewDocument, ...options });
};
export const SearchCubesDocument = gql`
    query SearchCubes($sourceType: String!, $sourceUrl: String!, $locale: String!, $query: String, $order: SearchCubeResultOrder, $includeDrafts: Boolean, $filters: [SearchCubeFilter!]) {
  searchCubes(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    query: $query
    order: $order
    includeDrafts: $includeDrafts
    filters: $filters
  ) {
    highlightedTitle
    highlightedDescription
    cube
  }
}
    `;

export function useSearchCubesQuery(options: Omit<Urql.UseQueryArgs<SearchCubesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<SearchCubesQuery>({ query: SearchCubesDocument, ...options });
};
export const PossibleFiltersDocument = gql`
    query PossibleFilters($iri: String!, $sourceType: String!, $sourceUrl: String!, $filters: SingleFilters!) {
  possibleFilters(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    filters: $filters
  ) {
    iri
    type
    value
  }
}
    `;

export function usePossibleFiltersQuery(options: Omit<Urql.UseQueryArgs<PossibleFiltersQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<PossibleFiltersQuery>({ query: PossibleFiltersDocument, ...options });
};
export const DataCubeDimensionGeoShapesDocument = gql`
    query DataCubeDimensionGeoShapes($cubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!) {
  dataCubeDimensionGeoShapes(
    cubeIri: $cubeIri
    dimensionIri: $dimensionIri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
  )
}
    `;

export function useDataCubeDimensionGeoShapesQuery(options: Omit<Urql.UseQueryArgs<DataCubeDimensionGeoShapesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeDimensionGeoShapesQuery>({ query: DataCubeDimensionGeoShapesDocument, ...options });
};