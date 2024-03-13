import { DataCubeComponents } from '../domain/data';
import { DataCubeMetadata } from '../domain/data';
import { DataCubeObservations } from '../domain/data';
import { DataCubePreview } from '../domain/data';
import { DimensionValue } from '../domain/data';
import { Filters } from '../configurator';
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
  GeoShapes: any;
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type DimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type DimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
};




export type GeoCoordinates = {
  __typename: 'GeoCoordinates';
  iri: Scalars['String'];
  label: Scalars['String'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
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
  geoCoordinates?: Maybe<Array<GeoCoordinates>>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type GeoCoordinatesDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type GeoCoordinatesDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  geoShapes?: Maybe<Scalars['GeoShapes']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type GeoShapesDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type GeoShapesDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type NominalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type NominalDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type NumericalMeasureValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type NumericalMeasureHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type OrdinalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type OrdinalDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type OrdinalMeasureValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type OrdinalMeasureHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
};

export type Query = {
  __typename: 'Query';
  dataCubeComponents: Scalars['DataCubeComponents'];
  dataCubeMetadata: Scalars['DataCubeMetadata'];
  dataCubeObservations: Scalars['DataCubeObservations'];
  dataCubePreview: Scalars['DataCubePreview'];
  dataCubeByIri?: Maybe<DataCube>;
  possibleFilters: Array<ObservationFilter>;
  searchCubes: Array<SearchCubeResult>;
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


export type QueryDataCubeByIriArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
  componentIris?: Maybe<Array<Scalars['String']>>;
  disableValuesLoad?: Maybe<Scalars['Boolean']>;
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
  DataCubeAbout = 'DataCubeAbout'
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type StandardErrorDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type StandardErrorDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type TemporalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type TemporalDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  hierarchy?: Maybe<Array<Scalars['HierarchyValue']>>;
};


export type TemporalOrdinalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  disableLoad?: Maybe<Scalars['Boolean']>;
};


export type TemporalOrdinalDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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

export type GeoCoordinatesByDimensionIriQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type GeoCoordinatesByDimensionIriQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension', geoCoordinates?: Maybe<Array<{ __typename: 'GeoCoordinates', iri: string, label: string, latitude: number, longitude: number }>> } | { __typename: 'GeoShapesDimension' } | { __typename: 'NominalDimension' } | { __typename: 'NumericalMeasure' } | { __typename: 'OrdinalDimension' } | { __typename: 'OrdinalMeasure' } | { __typename: 'StandardErrorDimension' } | { __typename: 'TemporalDimension' } | { __typename: 'TemporalOrdinalDimension' }> }> };

export type GeoShapesByDimensionIriQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type GeoShapesByDimensionIriQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension' } | { __typename: 'GeoShapesDimension', geoShapes?: Maybe<any> } | { __typename: 'NominalDimension' } | { __typename: 'NumericalMeasure' } | { __typename: 'OrdinalDimension' } | { __typename: 'OrdinalMeasure' } | { __typename: 'StandardErrorDimension' } | { __typename: 'TemporalDimension' } | { __typename: 'TemporalOrdinalDimension' }> }> };

export type PossibleFiltersQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters: Scalars['SingleFilters'];
}>;


export type PossibleFiltersQuery = { __typename: 'Query', possibleFilters: Array<{ __typename: 'ObservationFilter', iri: string, type: string, value?: Maybe<any> }> };


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
export const GeoCoordinatesByDimensionIriDocument = gql`
    query GeoCoordinatesByDimensionIri($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(
    iri: $dataCubeIri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    dimensionByIri(
      iri: $dimensionIri
      sourceType: $sourceType
      sourceUrl: $sourceUrl
    ) {
      ... on GeoCoordinatesDimension {
        geoCoordinates {
          iri
          label
          latitude
          longitude
        }
      }
    }
  }
}
    `;

export function useGeoCoordinatesByDimensionIriQuery(options: Omit<Urql.UseQueryArgs<GeoCoordinatesByDimensionIriQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GeoCoordinatesByDimensionIriQuery>({ query: GeoCoordinatesByDimensionIriDocument, ...options });
};
export const GeoShapesByDimensionIriDocument = gql`
    query GeoShapesByDimensionIri($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(
    iri: $dataCubeIri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    dimensionByIri(
      iri: $dimensionIri
      sourceType: $sourceType
      sourceUrl: $sourceUrl
    ) {
      ... on GeoShapesDimension {
        geoShapes
      }
    }
  }
}
    `;

export function useGeoShapesByDimensionIriQuery(options: Omit<Urql.UseQueryArgs<GeoShapesByDimensionIriQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GeoShapesByDimensionIriQuery>({ query: GeoShapesByDimensionIriDocument, ...options });
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