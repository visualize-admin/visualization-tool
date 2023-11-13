import { DataCubesComponents } from '../domain/data';
import { DimensionValue } from '../domain/data';
import { QueryFilters } from '../configurator';
import { HierarchyValue } from '../domain/data';
import { Observation } from '../domain/data';
import { RawObservation } from '../domain/data';
import { SearchCube } from '../domain/data';
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
  DataCubesComponents: DataCubesComponents;
  DimensionValue: DimensionValue;
  FilterValue: any;
  Filters: QueryFilters;
  GeoShapes: any;
  HierarchyValue: HierarchyValue;
  Observation: Observation;
  RawObservation: RawObservation;
  SearchCube: SearchCube;
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
  observations: ObservationsQuery;
  dimensions: Array<Dimension>;
  dimensionByIri?: Maybe<Dimension>;
  measures: Array<Measure>;
  themes: Array<DataCubeTheme>;
};


export type DataCubeObservationsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  componentIris?: Maybe<Array<Scalars['String']>>;
  filters?: Maybe<Scalars['Filters']>;
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

export type DataCubeFilter = {
  iri: Scalars['String'];
  componentIris?: Maybe<Array<Scalars['String']>>;
  filters?: Maybe<Scalars['Filters']>;
  latest?: Maybe<Scalars['Boolean']>;
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
  dataCubesComponents: Scalars['DataCubesComponents'];
  dataCubeByIri?: Maybe<DataCube>;
  possibleFilters: Array<ObservationFilter>;
  searchCubes: Array<SearchCubeResult>;
};


export type QueryDataCubesComponentsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  filters: Array<DataCubeFilter>;
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
  filters: Scalars['Filters'];
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
  type: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  value: Scalars['String'];
};

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



type DimensionMetadata_GeoCoordinatesDimension_Fragment = { __typename: 'GeoCoordinatesDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_GeoShapesDimension_Fragment = { __typename: 'GeoShapesDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_NominalDimension_Fragment = { __typename: 'NominalDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_NumericalMeasure_Fragment = { __typename: 'NumericalMeasure', isCurrency?: Maybe<boolean>, currencyExponent?: Maybe<number>, resolution?: Maybe<number>, isDecimal?: Maybe<boolean>, iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_OrdinalMeasure_Fragment = { __typename: 'OrdinalMeasure', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_StandardErrorDimension_Fragment = { __typename: 'StandardErrorDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_TemporalDimension_Fragment = { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string, iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_TemporalOrdinalDimension_Fragment = { __typename: 'TemporalOrdinalDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, scaleType?: Maybe<ScaleType>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

export type DimensionMetadataFragment = DimensionMetadata_GeoCoordinatesDimension_Fragment | DimensionMetadata_GeoShapesDimension_Fragment | DimensionMetadata_NominalDimension_Fragment | DimensionMetadata_NumericalMeasure_Fragment | DimensionMetadata_OrdinalDimension_Fragment | DimensionMetadata_OrdinalMeasure_Fragment | DimensionMetadata_StandardErrorDimension_Fragment | DimensionMetadata_TemporalDimension_Fragment | DimensionMetadata_TemporalOrdinalDimension_Fragment;

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

export type DataCubePreviewQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  disableValuesLoad?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, observations: { __typename: 'ObservationsQuery', data: Array<Observation>, sparql: string, sparqlEditorUrl?: Maybe<string> } }> };

export type DataCubeMetadataQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, identifier?: Maybe<string>, title: string, description?: Maybe<string>, publisher?: Maybe<string>, version?: Maybe<string>, workExamples?: Maybe<Array<Maybe<string>>>, contactName?: Maybe<string>, contactEmail?: Maybe<string>, landingPage?: Maybe<string>, expires?: Maybe<string>, datePublished?: Maybe<string>, dateModified?: Maybe<string>, publicationStatus: DataCubePublicationStatus, themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }> }> };

export type ComponentsQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
  componentIris?: Maybe<Array<Scalars['String']> | Scalars['String']>;
  disableValuesLoad?: Maybe<Scalars['Boolean']>;
}>;


export type ComponentsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensions: Array<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetadata_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetadata_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetadata_NominalDimension_Fragment
    ) | (
      { __typename: 'NumericalMeasure' }
      & DimensionMetadata_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetadata_OrdinalDimension_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadata_OrdinalMeasure_Fragment
    ) | (
      { __typename: 'StandardErrorDimension' }
      & DimensionMetadata_StandardErrorDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetadata_TemporalDimension_Fragment
    ) | (
      { __typename: 'TemporalOrdinalDimension' }
      & DimensionMetadata_TemporalOrdinalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'NumericalMeasure' }
      & DimensionMetadata_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadata_OrdinalMeasure_Fragment
    )> }> };

export type DataCubesComponentsQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  filters: Array<DataCubeFilter> | DataCubeFilter;
}>;


export type DataCubesComponentsQuery = { __typename: 'Query', dataCubesComponents: DataCubesComponents };

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

export type DataCubeObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  componentIris?: Maybe<Array<Scalars['String']> | Scalars['String']>;
  filters?: Maybe<Scalars['Filters']>;
  latest?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', observations: { __typename: 'ObservationsQuery', data: Array<Observation>, sparqlEditorUrl?: Maybe<string> } }> };

export type PossibleFiltersQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters: Scalars['Filters'];
}>;


export type PossibleFiltersQuery = { __typename: 'Query', possibleFilters: Array<{ __typename: 'ObservationFilter', iri: string, type: string, value?: Maybe<any> }> };

export const DimensionMetadataFragmentDoc = gql`
    fragment dimensionMetadata on Dimension {
  iri
  label
  description
  isNumerical
  isKeyDimension
  dataType
  scaleType
  order
  values(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    filters: $filters
    disableLoad: $disableValuesLoad
  )
  unit
  related {
    iri
    type
  }
  ... on TemporalDimension {
    timeUnit
    timeFormat
  }
  ... on NumericalMeasure {
    isCurrency
    currencyExponent
    resolution
    isDecimal
  }
}
    `;
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
export const DataCubePreviewDocument = gql`
    query DataCubePreview($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $disableValuesLoad: Boolean = true) {
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
    observations(sourceType: $sourceType, sourceUrl: $sourceUrl, limit: 10) {
      data
      sparql
      sparqlEditorUrl
    }
  }
}
    `;

export function useDataCubePreviewQuery(options: Omit<Urql.UseQueryArgs<DataCubePreviewQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubePreviewQuery>({ query: DataCubePreviewDocument, ...options });
};
export const DataCubeMetadataDocument = gql`
    query DataCubeMetadata($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    iri
    identifier
    title
    description
    publisher
    version
    workExamples
    contactName
    contactEmail
    landingPage
    expires
    datePublished
    dateModified
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
export const ComponentsDocument = gql`
    query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters, $componentIris: [String!], $disableValuesLoad: Boolean = false) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
    disableValuesLoad: $disableValuesLoad
  ) {
    dimensions(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIris: $componentIris
      disableValuesLoad: $disableValuesLoad
    ) {
      ...dimensionMetadata
    }
    measures(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIris: $componentIris
      disableValuesLoad: $disableValuesLoad
    ) {
      ...dimensionMetadata
    }
  }
}
    ${DimensionMetadataFragmentDoc}`;

export function useComponentsQuery(options: Omit<Urql.UseQueryArgs<ComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ComponentsQuery>({ query: ComponentsDocument, ...options });
};
export const DataCubesComponentsDocument = gql`
    query DataCubesComponents($sourceType: String!, $sourceUrl: String!, $locale: String!, $filters: [DataCubeFilter!]!) {
  dataCubesComponents(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    filters: $filters
  )
}
    `;

export function useDataCubesComponentsQuery(options: Omit<Urql.UseQueryArgs<DataCubesComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubesComponentsQuery>({ query: DataCubesComponentsDocument, ...options });
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
export const DataCubeObservationsDocument = gql`
    query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $componentIris: [String!], $filters: Filters, $latest: Boolean, $limit: Int) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    observations(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      componentIris: $componentIris
      filters: $filters
      limit: $limit
    ) {
      data
      sparqlEditorUrl
    }
  }
}
    `;

export function useDataCubeObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubeObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeObservationsQuery>({ query: DataCubeObservationsDocument, ...options });
};
export const PossibleFiltersDocument = gql`
    query PossibleFilters($iri: String!, $sourceType: String!, $sourceUrl: String!, $filters: Filters!) {
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