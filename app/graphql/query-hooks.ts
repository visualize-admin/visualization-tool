import { DimensionValue } from '../domain/data';
import { QueryFilters } from '../configurator';
import { Observation } from '../domain/data';
import { RawObservation } from '../domain/data';
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
  DimensionValue: DimensionValue;
  FilterValue: any;
  Filters: QueryFilters;
  GeoShapes: any;
  Observation: Observation;
  RawObservation: RawObservation;
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
  dimensions?: Maybe<Array<Scalars['String']>>;
  filters?: Maybe<Scalars['Filters']>;
};


export type DataCubeDimensionsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
};


export type DataCubeDimensionByIriArgs = {
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
};


export type DataCubeMeasuresArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
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
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type DimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
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
  scaleType?: Maybe<Scalars['String']>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  geoCoordinates?: Maybe<Array<GeoCoordinates>>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type GeoCoordinatesDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
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
  scaleType?: Maybe<Scalars['String']>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  geoShapes?: Maybe<Scalars['GeoShapes']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type GeoShapesDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
};


export type GeoShapesDimensionHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
};

export type HierarchyValue = {
  __typename: 'HierarchyValue';
  value: Scalars['String'];
  label: Scalars['String'];
  alternateName?: Maybe<Scalars['String']>;
  position?: Maybe<Scalars['ValuePosition']>;
  identifier?: Maybe<Scalars['ValueIdentifier']>;
  dimensionIri: Scalars['String'];
  depth: Scalars['Int'];
  children?: Maybe<Array<HierarchyValue>>;
  hasValue?: Maybe<Scalars['Boolean']>;
};

export type Measure = NumericalMeasure | OrdinalMeasure;

export type NominalDimension = Dimension & {
  __typename: 'NominalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type NominalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
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
  scaleType?: Maybe<Scalars['String']>;
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
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type NumericalMeasureValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
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
  scaleType?: Maybe<Scalars['String']>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type OrdinalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
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
  scaleType?: Maybe<Scalars['String']>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type OrdinalMeasureValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
};


export type OrdinalMeasureHierarchyArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
};

export type Query = {
  __typename: 'Query';
  dataCubeByIri?: Maybe<DataCube>;
  possibleFilters: Array<ObservationFilter>;
  dataCubes: Array<DataCubeResult>;
  themes: Array<DataCubeTheme>;
  subthemes: Array<DataCubeTheme>;
  organizations: Array<DataCubeOrganization>;
  datasetcount?: Maybe<Array<DatasetCount>>;
};


export type QueryDataCubeByIriArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
};


export type QueryPossibleFiltersArgs = {
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters: Scalars['Filters'];
};


export type QueryDataCubesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
  query?: Maybe<Scalars['String']>;
  order?: Maybe<DataCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Array<DataCubeSearchFilter>>;
};


export type QueryThemesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
};


export type QuerySubthemesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  parentIri: Scalars['String'];
};


export type QueryOrganizationsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
};


export type QueryDatasetcountArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  theme?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  subtheme?: Maybe<Scalars['String']>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
};


export type RelatedDimension = {
  __typename: 'RelatedDimension';
  type: Scalars['String'];
  iri: Scalars['String'];
};

export type TemporalDimension = Dimension & {
  __typename: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  timeUnit: TimeUnit;
  timeFormat: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  dataType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type TemporalDimensionValuesArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
};


export type TemporalDimensionHierarchyArgs = {
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



type DimensionMetadata_GeoCoordinatesDimension_Fragment = { __typename: 'GeoCoordinatesDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_GeoShapesDimension_Fragment = { __typename: 'GeoShapesDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_NominalDimension_Fragment = { __typename: 'NominalDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_NumericalMeasure_Fragment = { __typename: 'NumericalMeasure', isCurrency?: Maybe<boolean>, currencyExponent?: Maybe<number>, resolution?: Maybe<number>, isDecimal?: Maybe<boolean>, iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_OrdinalMeasure_Fragment = { __typename: 'OrdinalMeasure', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetadata_TemporalDimension_Fragment = { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string, iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

export type DimensionMetadataFragment = DimensionMetadata_GeoCoordinatesDimension_Fragment | DimensionMetadata_GeoShapesDimension_Fragment | DimensionMetadata_NominalDimension_Fragment | DimensionMetadata_NumericalMeasure_Fragment | DimensionMetadata_OrdinalDimension_Fragment | DimensionMetadata_OrdinalMeasure_Fragment | DimensionMetadata_TemporalDimension_Fragment;

type DimensionMetadataWithHierarchies_GeoCoordinatesDimension_Fragment = (
  { __typename: 'GeoCoordinatesDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> }
  & HierarchyMetadata_GeoCoordinatesDimension_Fragment
);

type DimensionMetadataWithHierarchies_GeoShapesDimension_Fragment = (
  { __typename: 'GeoShapesDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> }
  & HierarchyMetadata_GeoShapesDimension_Fragment
);

type DimensionMetadataWithHierarchies_NominalDimension_Fragment = (
  { __typename: 'NominalDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> }
  & HierarchyMetadata_NominalDimension_Fragment
);

type DimensionMetadataWithHierarchies_NumericalMeasure_Fragment = (
  { __typename: 'NumericalMeasure', isCurrency?: Maybe<boolean>, currencyExponent?: Maybe<number>, resolution?: Maybe<number>, isDecimal?: Maybe<boolean>, iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> }
  & HierarchyMetadata_NumericalMeasure_Fragment
);

type DimensionMetadataWithHierarchies_OrdinalDimension_Fragment = (
  { __typename: 'OrdinalDimension', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> }
  & HierarchyMetadata_OrdinalDimension_Fragment
);

type DimensionMetadataWithHierarchies_OrdinalMeasure_Fragment = (
  { __typename: 'OrdinalMeasure', iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> }
  & HierarchyMetadata_OrdinalMeasure_Fragment
);

type DimensionMetadataWithHierarchies_TemporalDimension_Fragment = (
  { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string, iri: string, label: string, description?: Maybe<string>, isNumerical: boolean, isKeyDimension: boolean, dataType?: Maybe<string>, order?: Maybe<number>, values: Array<DimensionValue>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> }
  & HierarchyMetadata_TemporalDimension_Fragment
);

export type DimensionMetadataWithHierarchiesFragment = DimensionMetadataWithHierarchies_GeoCoordinatesDimension_Fragment | DimensionMetadataWithHierarchies_GeoShapesDimension_Fragment | DimensionMetadataWithHierarchies_NominalDimension_Fragment | DimensionMetadataWithHierarchies_NumericalMeasure_Fragment | DimensionMetadataWithHierarchies_OrdinalDimension_Fragment | DimensionMetadataWithHierarchies_OrdinalMeasure_Fragment | DimensionMetadataWithHierarchies_TemporalDimension_Fragment;

type HierarchyMetadata_GeoCoordinatesDimension_Fragment = { __typename: 'GeoCoordinatesDimension', hierarchy?: Maybe<Array<(
    { __typename: 'HierarchyValue', children?: Maybe<Array<(
      { __typename: 'HierarchyValue', children?: Maybe<Array<(
        { __typename: 'HierarchyValue', children?: Maybe<Array<(
          { __typename: 'HierarchyValue', children?: Maybe<Array<(
            { __typename: 'HierarchyValue', children?: Maybe<Array<(
              { __typename: 'HierarchyValue' }
              & HierarchyValueFieldsFragment
            )>> }
            & HierarchyValueFieldsFragment
          )>> }
          & HierarchyValueFieldsFragment
        )>> }
        & HierarchyValueFieldsFragment
      )>> }
      & HierarchyValueFieldsFragment
    )>> }
    & HierarchyValueFieldsFragment
  )>> };

type HierarchyMetadata_GeoShapesDimension_Fragment = { __typename: 'GeoShapesDimension', hierarchy?: Maybe<Array<(
    { __typename: 'HierarchyValue', children?: Maybe<Array<(
      { __typename: 'HierarchyValue', children?: Maybe<Array<(
        { __typename: 'HierarchyValue', children?: Maybe<Array<(
          { __typename: 'HierarchyValue', children?: Maybe<Array<(
            { __typename: 'HierarchyValue', children?: Maybe<Array<(
              { __typename: 'HierarchyValue' }
              & HierarchyValueFieldsFragment
            )>> }
            & HierarchyValueFieldsFragment
          )>> }
          & HierarchyValueFieldsFragment
        )>> }
        & HierarchyValueFieldsFragment
      )>> }
      & HierarchyValueFieldsFragment
    )>> }
    & HierarchyValueFieldsFragment
  )>> };

type HierarchyMetadata_NominalDimension_Fragment = { __typename: 'NominalDimension', hierarchy?: Maybe<Array<(
    { __typename: 'HierarchyValue', children?: Maybe<Array<(
      { __typename: 'HierarchyValue', children?: Maybe<Array<(
        { __typename: 'HierarchyValue', children?: Maybe<Array<(
          { __typename: 'HierarchyValue', children?: Maybe<Array<(
            { __typename: 'HierarchyValue', children?: Maybe<Array<(
              { __typename: 'HierarchyValue' }
              & HierarchyValueFieldsFragment
            )>> }
            & HierarchyValueFieldsFragment
          )>> }
          & HierarchyValueFieldsFragment
        )>> }
        & HierarchyValueFieldsFragment
      )>> }
      & HierarchyValueFieldsFragment
    )>> }
    & HierarchyValueFieldsFragment
  )>> };

type HierarchyMetadata_NumericalMeasure_Fragment = { __typename: 'NumericalMeasure', hierarchy?: Maybe<Array<(
    { __typename: 'HierarchyValue', children?: Maybe<Array<(
      { __typename: 'HierarchyValue', children?: Maybe<Array<(
        { __typename: 'HierarchyValue', children?: Maybe<Array<(
          { __typename: 'HierarchyValue', children?: Maybe<Array<(
            { __typename: 'HierarchyValue', children?: Maybe<Array<(
              { __typename: 'HierarchyValue' }
              & HierarchyValueFieldsFragment
            )>> }
            & HierarchyValueFieldsFragment
          )>> }
          & HierarchyValueFieldsFragment
        )>> }
        & HierarchyValueFieldsFragment
      )>> }
      & HierarchyValueFieldsFragment
    )>> }
    & HierarchyValueFieldsFragment
  )>> };

type HierarchyMetadata_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', hierarchy?: Maybe<Array<(
    { __typename: 'HierarchyValue', children?: Maybe<Array<(
      { __typename: 'HierarchyValue', children?: Maybe<Array<(
        { __typename: 'HierarchyValue', children?: Maybe<Array<(
          { __typename: 'HierarchyValue', children?: Maybe<Array<(
            { __typename: 'HierarchyValue', children?: Maybe<Array<(
              { __typename: 'HierarchyValue' }
              & HierarchyValueFieldsFragment
            )>> }
            & HierarchyValueFieldsFragment
          )>> }
          & HierarchyValueFieldsFragment
        )>> }
        & HierarchyValueFieldsFragment
      )>> }
      & HierarchyValueFieldsFragment
    )>> }
    & HierarchyValueFieldsFragment
  )>> };

type HierarchyMetadata_OrdinalMeasure_Fragment = { __typename: 'OrdinalMeasure', hierarchy?: Maybe<Array<(
    { __typename: 'HierarchyValue', children?: Maybe<Array<(
      { __typename: 'HierarchyValue', children?: Maybe<Array<(
        { __typename: 'HierarchyValue', children?: Maybe<Array<(
          { __typename: 'HierarchyValue', children?: Maybe<Array<(
            { __typename: 'HierarchyValue', children?: Maybe<Array<(
              { __typename: 'HierarchyValue' }
              & HierarchyValueFieldsFragment
            )>> }
            & HierarchyValueFieldsFragment
          )>> }
          & HierarchyValueFieldsFragment
        )>> }
        & HierarchyValueFieldsFragment
      )>> }
      & HierarchyValueFieldsFragment
    )>> }
    & HierarchyValueFieldsFragment
  )>> };

type HierarchyMetadata_TemporalDimension_Fragment = { __typename: 'TemporalDimension', hierarchy?: Maybe<Array<(
    { __typename: 'HierarchyValue', children?: Maybe<Array<(
      { __typename: 'HierarchyValue', children?: Maybe<Array<(
        { __typename: 'HierarchyValue', children?: Maybe<Array<(
          { __typename: 'HierarchyValue', children?: Maybe<Array<(
            { __typename: 'HierarchyValue', children?: Maybe<Array<(
              { __typename: 'HierarchyValue' }
              & HierarchyValueFieldsFragment
            )>> }
            & HierarchyValueFieldsFragment
          )>> }
          & HierarchyValueFieldsFragment
        )>> }
        & HierarchyValueFieldsFragment
      )>> }
      & HierarchyValueFieldsFragment
    )>> }
    & HierarchyValueFieldsFragment
  )>> };

export type HierarchyMetadataFragment = HierarchyMetadata_GeoCoordinatesDimension_Fragment | HierarchyMetadata_GeoShapesDimension_Fragment | HierarchyMetadata_NominalDimension_Fragment | HierarchyMetadata_NumericalMeasure_Fragment | HierarchyMetadata_OrdinalDimension_Fragment | HierarchyMetadata_OrdinalMeasure_Fragment | HierarchyMetadata_TemporalDimension_Fragment;

export type DataCubesQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  query?: Maybe<Scalars['String']>;
  order?: Maybe<DataCubeResultOrder>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Array<DataCubeSearchFilter> | DataCubeSearchFilter>;
}>;


export type DataCubesQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCubeResult', highlightedTitle?: Maybe<string>, highlightedDescription?: Maybe<string>, dataCube: { __typename: 'DataCube', iri: string, title: string, workExamples?: Maybe<Array<Maybe<string>>>, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, datePublished?: Maybe<string>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }>, themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }> } }> };

export type DataCubePreviewQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, dimensions: Array<(
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
      { __typename: 'TemporalDimension' }
      & DimensionMetadata_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'NumericalMeasure' }
      & DimensionMetadata_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadata_OrdinalMeasure_Fragment
    )>, observations: { __typename: 'ObservationsQuery', data: Array<Observation>, sparql: string, sparqlEditorUrl?: Maybe<string> } }> };

export type DataCubeMetadataQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, identifier?: Maybe<string>, title: string, description?: Maybe<string>, publisher?: Maybe<string>, version?: Maybe<string>, workExamples?: Maybe<Array<Maybe<string>>>, contactName?: Maybe<string>, contactEmail?: Maybe<string>, landingPage?: Maybe<string>, expires?: Maybe<string>, datePublished?: Maybe<string>, dateModified?: Maybe<string>, publicationStatus: DataCubePublicationStatus, themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }> }> };

export type DataCubeMetadataWithComponentValuesQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DataCubeMetadataWithComponentValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, publisher?: Maybe<string>, publicationStatus: DataCubePublicationStatus, expires?: Maybe<string>, identifier?: Maybe<string>, workExamples?: Maybe<Array<Maybe<string>>>, landingPage?: Maybe<string>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string }>, dimensions: Array<(
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
      { __typename: 'TemporalDimension' }
      & DimensionMetadata_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'NumericalMeasure' }
      & DimensionMetadata_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadata_OrdinalMeasure_Fragment
    )> }> };

export type DataCubeMetadataWithComponentValuesAndHierarchiesQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DataCubeMetadataWithComponentValuesAndHierarchiesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, publisher?: Maybe<string>, publicationStatus: DataCubePublicationStatus, expires?: Maybe<string>, identifier?: Maybe<string>, workExamples?: Maybe<Array<Maybe<string>>>, landingPage?: Maybe<string>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string }>, dimensions: Array<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetadataWithHierarchies_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetadataWithHierarchies_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetadataWithHierarchies_NominalDimension_Fragment
    ) | (
      { __typename: 'NumericalMeasure' }
      & DimensionMetadataWithHierarchies_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetadataWithHierarchies_OrdinalDimension_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadataWithHierarchies_OrdinalMeasure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetadataWithHierarchies_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'NumericalMeasure' }
      & DimensionMetadataWithHierarchies_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadataWithHierarchies_OrdinalMeasure_Fragment
    )> }> };

export type ComponentsQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
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
      { __typename: 'TemporalDimension' }
      & DimensionMetadata_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'NumericalMeasure' }
      & DimensionMetadata_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadata_OrdinalMeasure_Fragment
    )> }> };

export type ComponentsWithHierarchiesQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type ComponentsWithHierarchiesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensions: Array<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetadataWithHierarchies_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetadataWithHierarchies_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetadataWithHierarchies_NominalDimension_Fragment
    ) | (
      { __typename: 'NumericalMeasure' }
      & DimensionMetadataWithHierarchies_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetadataWithHierarchies_OrdinalDimension_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadataWithHierarchies_OrdinalMeasure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetadataWithHierarchies_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'NumericalMeasure' }
      & DimensionMetadataWithHierarchies_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadataWithHierarchies_OrdinalMeasure_Fragment
    )> }> };

export type DimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetadataWithHierarchies_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetadataWithHierarchies_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetadataWithHierarchies_NominalDimension_Fragment
    ) | (
      { __typename: 'NumericalMeasure' }
      & DimensionMetadataWithHierarchies_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetadataWithHierarchies_OrdinalDimension_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadataWithHierarchies_OrdinalMeasure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetadataWithHierarchies_TemporalDimension_Fragment
    )> }> };

export type GeoCoordinatesByDimensionIriQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type GeoCoordinatesByDimensionIriQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension', geoCoordinates?: Maybe<Array<{ __typename: 'GeoCoordinates', iri: string, label: string, latitude: number, longitude: number }>> } | { __typename: 'GeoShapesDimension' } | { __typename: 'NominalDimension' } | { __typename: 'NumericalMeasure' } | { __typename: 'OrdinalDimension' } | { __typename: 'OrdinalMeasure' } | { __typename: 'TemporalDimension' }> }> };

export type GeoShapesByDimensionIriQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type GeoShapesByDimensionIriQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension' } | { __typename: 'GeoShapesDimension', geoShapes?: Maybe<any> } | { __typename: 'NominalDimension' } | { __typename: 'NumericalMeasure' } | { __typename: 'OrdinalDimension' } | { __typename: 'OrdinalMeasure' } | { __typename: 'TemporalDimension' }> }> };

export type TemporalDimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type TemporalDimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension' } | { __typename: 'GeoShapesDimension' } | { __typename: 'NominalDimension' } | { __typename: 'NumericalMeasure' } | { __typename: 'OrdinalDimension' } | { __typename: 'OrdinalMeasure' } | (
      { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string }
      & DimensionMetadata_TemporalDimension_Fragment
    )> }> };

export type DataCubeObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  dimensions?: Maybe<Array<Scalars['String']> | Scalars['String']>;
  filters?: Maybe<Scalars['Filters']>;
  latest?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, dimensions: Array<(
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
      { __typename: 'TemporalDimension' }
      & DimensionMetadata_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'NumericalMeasure' }
      & DimensionMetadata_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & DimensionMetadata_OrdinalMeasure_Fragment
    )>, observations: { __typename: 'ObservationsQuery', data: Array<Observation>, sparqlEditorUrl?: Maybe<string> } }> };

export type PossibleFiltersQueryVariables = Exact<{
  iri: Scalars['String'];
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  filters: Scalars['Filters'];
}>;


export type PossibleFiltersQuery = { __typename: 'Query', possibleFilters: Array<{ __typename: 'ObservationFilter', iri: string, type: string, value?: Maybe<any> }> };

export type ThemesQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
}>;


export type ThemesQuery = { __typename: 'Query', themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }> };

export type OrganizationsQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
}>;


export type OrganizationsQuery = { __typename: 'Query', organizations: Array<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }> };

export type SubthemesQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  parentIri: Scalars['String'];
}>;


export type SubthemesQuery = { __typename: 'Query', subthemes: Array<{ __typename: 'DataCubeTheme', label?: Maybe<string>, iri: string }> };

export type HierarchyValueFieldsFragment = { __typename: 'HierarchyValue', value: string, dimensionIri: string, depth: number, label: string, alternateName?: Maybe<string>, hasValue?: Maybe<boolean>, position?: Maybe<any>, identifier?: Maybe<any> };

export type DimensionHierarchyQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
}>;


export type DimensionHierarchyQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<(
      { __typename: 'GeoCoordinatesDimension' }
      & HierarchyMetadata_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & HierarchyMetadata_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & HierarchyMetadata_NominalDimension_Fragment
    ) | (
      { __typename: 'NumericalMeasure' }
      & HierarchyMetadata_NumericalMeasure_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & HierarchyMetadata_OrdinalDimension_Fragment
    ) | (
      { __typename: 'OrdinalMeasure' }
      & HierarchyMetadata_OrdinalMeasure_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & HierarchyMetadata_TemporalDimension_Fragment
    )> }> };

export type DatasetCountQueryVariables = Exact<{
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  theme?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  subtheme?: Maybe<Scalars['String']>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
}>;


export type DatasetCountQuery = { __typename: 'Query', datasetcount?: Maybe<Array<{ __typename: 'DatasetCount', count: number, iri: string }>> };

export const DimensionMetadataFragmentDoc = gql`
    fragment dimensionMetadata on Dimension {
  iri
  label
  description
  isNumerical
  isKeyDimension
  dataType
  order
  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)
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
export const HierarchyValueFieldsFragmentDoc = gql`
    fragment hierarchyValueFields on HierarchyValue {
  value
  dimensionIri
  depth
  label
  alternateName
  hasValue
  position
  identifier
}
    `;
export const HierarchyMetadataFragmentDoc = gql`
    fragment hierarchyMetadata on Dimension {
  hierarchy(sourceType: $sourceType, sourceUrl: $sourceUrl) {
    ...hierarchyValueFields
    children {
      ...hierarchyValueFields
      children {
        ...hierarchyValueFields
        children {
          ...hierarchyValueFields
          children {
            ...hierarchyValueFields
            children {
              ...hierarchyValueFields
            }
          }
        }
      }
    }
  }
}
    ${HierarchyValueFieldsFragmentDoc}`;
export const DimensionMetadataWithHierarchiesFragmentDoc = gql`
    fragment dimensionMetadataWithHierarchies on Dimension {
  iri
  label
  description
  isNumerical
  isKeyDimension
  dataType
  order
  values(sourceType: $sourceType, sourceUrl: $sourceUrl, filters: $filters)
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
  ...hierarchyMetadata
}
    ${HierarchyMetadataFragmentDoc}`;
export const DataCubesDocument = gql`
    query DataCubes($sourceType: String!, $sourceUrl: String!, $locale: String!, $query: String, $order: DataCubeResultOrder, $includeDrafts: Boolean, $filters: [DataCubeSearchFilter!]) {
  dataCubes(
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
    dataCube {
      iri
      title
      workExamples
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
    query DataCubePreview($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    iri
    title
    description
    publicationStatus
    dimensions(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
    measures(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
    observations(sourceType: $sourceType, sourceUrl: $sourceUrl, limit: 10) {
      data
      sparql
      sparqlEditorUrl
    }
  }
}
    ${DimensionMetadataFragmentDoc}`;

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
export const DataCubeMetadataWithComponentValuesDocument = gql`
    query DataCubeMetadataWithComponentValues($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    iri
    title
    publisher
    publicationStatus
    expires
    identifier
    workExamples
    creator {
      iri
    }
    landingPage
    dimensions(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
    measures(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
  }
}
    ${DimensionMetadataFragmentDoc}`;

export function useDataCubeMetadataWithComponentValuesQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataWithComponentValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataWithComponentValuesQuery>({ query: DataCubeMetadataWithComponentValuesDocument, ...options });
};
export const DataCubeMetadataWithComponentValuesAndHierarchiesDocument = gql`
    query DataCubeMetadataWithComponentValuesAndHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    iri
    title
    publisher
    publicationStatus
    expires
    identifier
    workExamples
    creator {
      iri
    }
    landingPage
    dimensions(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadataWithHierarchies
    }
    measures(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadataWithHierarchies
    }
  }
}
    ${DimensionMetadataWithHierarchiesFragmentDoc}`;

export function useDataCubeMetadataWithComponentValuesAndHierarchiesQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataWithComponentValuesAndHierarchiesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeMetadataWithComponentValuesAndHierarchiesQuery>({ query: DataCubeMetadataWithComponentValuesAndHierarchiesDocument, ...options });
};
export const ComponentsDocument = gql`
    query Components($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    dimensions(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
    measures(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
  }
}
    ${DimensionMetadataFragmentDoc}`;

export function useComponentsQuery(options: Omit<Urql.UseQueryArgs<ComponentsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ComponentsQuery>({ query: ComponentsDocument, ...options });
};
export const ComponentsWithHierarchiesDocument = gql`
    query ComponentsWithHierarchies($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    dimensions(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadataWithHierarchies
    }
    measures(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadataWithHierarchies
    }
  }
}
    ${DimensionMetadataWithHierarchiesFragmentDoc}`;

export function useComponentsWithHierarchiesQuery(options: Omit<Urql.UseQueryArgs<ComponentsWithHierarchiesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ComponentsWithHierarchiesQuery>({ query: ComponentsWithHierarchiesDocument, ...options });
};
export const DimensionValuesDocument = gql`
    query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
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
      ...dimensionMetadataWithHierarchies
    }
  }
}
    ${DimensionMetadataWithHierarchiesFragmentDoc}`;

export function useDimensionValuesQuery(options: Omit<Urql.UseQueryArgs<DimensionValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DimensionValuesQuery>({ query: DimensionValuesDocument, ...options });
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
export const TemporalDimensionValuesDocument = gql`
    query TemporalDimensionValues($dataCubeIri: String!, $dimensionIri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
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
      ... on TemporalDimension {
        ...dimensionMetadata
        timeUnit
        timeFormat
      }
    }
  }
}
    ${DimensionMetadataFragmentDoc}`;

export function useTemporalDimensionValuesQuery(options: Omit<Urql.UseQueryArgs<TemporalDimensionValuesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<TemporalDimensionValuesQuery>({ query: TemporalDimensionValuesDocument, ...options });
};
export const DataCubeObservationsDocument = gql`
    query DataCubeObservations($iri: String!, $sourceType: String!, $sourceUrl: String!, $locale: String!, $dimensions: [String!], $filters: Filters, $latest: Boolean, $limit: Int) {
  dataCubeByIri(
    iri: $iri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    latest: $latest
  ) {
    iri
    title
    description
    dimensions(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
    measures(sourceType: $sourceType, sourceUrl: $sourceUrl) {
      ...dimensionMetadata
    }
    observations(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      dimensions: $dimensions
      filters: $filters
      limit: $limit
    ) {
      data
      sparqlEditorUrl
    }
  }
}
    ${DimensionMetadataFragmentDoc}`;

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
export const ThemesDocument = gql`
    query Themes($sourceType: String!, $sourceUrl: String!, $locale: String!) {
  themes(sourceType: $sourceType, sourceUrl: $sourceUrl, locale: $locale) {
    iri
    label
  }
}
    `;

export function useThemesQuery(options: Omit<Urql.UseQueryArgs<ThemesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ThemesQuery>({ query: ThemesDocument, ...options });
};
export const OrganizationsDocument = gql`
    query Organizations($sourceType: String!, $sourceUrl: String!, $locale: String!) {
  organizations(sourceType: $sourceType, sourceUrl: $sourceUrl, locale: $locale) {
    iri
    label
  }
}
    `;

export function useOrganizationsQuery(options: Omit<Urql.UseQueryArgs<OrganizationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<OrganizationsQuery>({ query: OrganizationsDocument, ...options });
};
export const SubthemesDocument = gql`
    query Subthemes($sourceType: String!, $sourceUrl: String!, $locale: String!, $parentIri: String!) {
  subthemes(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    parentIri: $parentIri
  ) {
    label
    iri
  }
}
    `;

export function useSubthemesQuery(options: Omit<Urql.UseQueryArgs<SubthemesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<SubthemesQuery>({ query: SubthemesDocument, ...options });
};
export const DimensionHierarchyDocument = gql`
    query DimensionHierarchy($sourceType: String!, $sourceUrl: String!, $locale: String!, $cubeIri: String!, $dimensionIri: String!) {
  dataCubeByIri(
    iri: $cubeIri
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
  ) {
    dimensionByIri(
      iri: $dimensionIri
      sourceType: $sourceType
      sourceUrl: $sourceUrl
    ) {
      ...hierarchyMetadata
    }
  }
}
    ${HierarchyMetadataFragmentDoc}`;

export function useDimensionHierarchyQuery(options: Omit<Urql.UseQueryArgs<DimensionHierarchyQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DimensionHierarchyQuery>({ query: DimensionHierarchyDocument, ...options });
};
export const DatasetCountDocument = gql`
    query DatasetCount($sourceType: String!, $sourceUrl: String!, $theme: String, $organization: String, $subtheme: String, $includeDrafts: Boolean) {
  datasetcount(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    theme: $theme
    organization: $organization
    subtheme: $subtheme
    includeDrafts: $includeDrafts
  ) {
    count
    iri
  }
}
    `;

export function useDatasetCountQuery(options: Omit<Urql.UseQueryArgs<DatasetCountQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DatasetCountQuery>({ query: DatasetCountDocument, ...options });
};