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
  FilterValue: any;
  Filters: any;
  GeoShapes: any;
  Observation: any;
  RawObservation: any;
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
  dimensions?: Maybe<Array<Scalars['String']>>;
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
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type DimensionValuesArgs = {
  filters?: Maybe<Scalars['Filters']>;
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
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  geoCoordinates?: Maybe<Array<GeoCoordinates>>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type GeoCoordinatesDimensionValuesArgs = {
  filters?: Maybe<Scalars['Filters']>;
};


export type GeoShapesDimension = Dimension & {
  __typename: 'GeoShapesDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  geoShapes?: Maybe<Scalars['GeoShapes']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type GeoShapesDimensionValuesArgs = {
  filters?: Maybe<Scalars['Filters']>;
};

export type HierarchyValue = {
  __typename: 'HierarchyValue';
  value: Scalars['String'];
  label: Scalars['String'];
  dimensionIri: Scalars['String'];
  depth: Scalars['Int'];
  children?: Maybe<Array<HierarchyValue>>;
  hasValue?: Maybe<Scalars['Boolean']>;
};

export type Measure = Dimension & {
  __typename: 'Measure';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type MeasureValuesArgs = {
  filters?: Maybe<Scalars['Filters']>;
};

export type NominalDimension = Dimension & {
  __typename: 'NominalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type NominalDimensionValuesArgs = {
  filters?: Maybe<Scalars['Filters']>;
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
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type OrdinalDimensionValuesArgs = {
  filters?: Maybe<Scalars['Filters']>;
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
  locale?: Maybe<Scalars['String']>;
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
};


export type QueryPossibleFiltersArgs = {
  iri: Scalars['String'];
  filters: Scalars['Filters'];
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
  timeUnit: TimeUnit;
  timeFormat: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  scaleType?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  isNumerical: Scalars['Boolean'];
  isKeyDimension: Scalars['Boolean'];
  values: Array<Scalars['DimensionValue']>;
  related?: Maybe<Array<RelatedDimension>>;
  hierarchy?: Maybe<Array<HierarchyValue>>;
};


export type TemporalDimensionValuesArgs = {
  filters?: Maybe<Scalars['Filters']>;
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


export type DataCubesQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCubeResult', highlightedTitle?: Maybe<string>, highlightedDescription?: Maybe<string>, dataCube: { __typename: 'DataCube', iri: string, title: string, workExamples?: Maybe<Array<Maybe<string>>>, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, datePublished?: Maybe<string>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }>, themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }> } }> };

type DimensionMetaData_GeoCoordinatesDimension_Fragment = { __typename: 'GeoCoordinatesDimension', iri: string, label: string, isNumerical: boolean, isKeyDimension: boolean, order?: Maybe<number>, values: Array<any>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetaData_GeoShapesDimension_Fragment = { __typename: 'GeoShapesDimension', iri: string, label: string, isNumerical: boolean, isKeyDimension: boolean, order?: Maybe<number>, values: Array<any>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetaData_Measure_Fragment = { __typename: 'Measure', iri: string, label: string, isNumerical: boolean, isKeyDimension: boolean, order?: Maybe<number>, values: Array<any>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetaData_NominalDimension_Fragment = { __typename: 'NominalDimension', iri: string, label: string, isNumerical: boolean, isKeyDimension: boolean, order?: Maybe<number>, values: Array<any>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetaData_OrdinalDimension_Fragment = { __typename: 'OrdinalDimension', iri: string, label: string, isNumerical: boolean, isKeyDimension: boolean, order?: Maybe<number>, values: Array<any>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

type DimensionMetaData_TemporalDimension_Fragment = { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string, iri: string, label: string, isNumerical: boolean, isKeyDimension: boolean, order?: Maybe<number>, values: Array<any>, unit?: Maybe<string>, related?: Maybe<Array<{ __typename: 'RelatedDimension', iri: string, type: string }>> };

export type DimensionMetaDataFragment = DimensionMetaData_GeoCoordinatesDimension_Fragment | DimensionMetaData_GeoShapesDimension_Fragment | DimensionMetaData_Measure_Fragment | DimensionMetaData_NominalDimension_Fragment | DimensionMetaData_OrdinalDimension_Fragment | DimensionMetaData_TemporalDimension_Fragment;

export type DataCubePreviewQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, publicationStatus: DataCubePublicationStatus, dimensions: Array<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetaData_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetaData_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetaData_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetaData_OrdinalDimension_Fragment
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
  dimensions?: Maybe<Array<Scalars['String']> | Scalars['String']>;
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubePreviewObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', observations: { __typename: 'ObservationsQuery', data: Array<any>, sparql: string } }> };

export type DataCubeMetadataQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, identifier?: Maybe<string>, title: string, description?: Maybe<string>, publisher?: Maybe<string>, version?: Maybe<string>, workExamples?: Maybe<Array<Maybe<string>>>, contactName?: Maybe<string>, contactEmail?: Maybe<string>, landingPage?: Maybe<string>, expires?: Maybe<string>, datePublished?: Maybe<string>, publicationStatus: DataCubePublicationStatus, themes: Array<{ __typename: 'DataCubeTheme', iri: string, label?: Maybe<string> }>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string, label?: Maybe<string> }> }> };

export type DataCubeMetadataWithComponentValuesQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DataCubeMetadataWithComponentValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, publisher?: Maybe<string>, identifier?: Maybe<string>, workExamples?: Maybe<Array<Maybe<string>>>, landingPage?: Maybe<string>, creator?: Maybe<{ __typename: 'DataCubeOrganization', iri: string }>, dimensions: Array<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetaData_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetaData_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetaData_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetaData_OrdinalDimension_Fragment
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
  filters?: Maybe<Scalars['Filters']>;
}>;


export type DimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetaData_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetaData_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetaData_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetaData_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetaData_TemporalDimension_Fragment
    )> }> };

export type GeoCoordinatesByDimensionIriQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type GeoCoordinatesByDimensionIriQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension', geoCoordinates?: Maybe<Array<{ __typename: 'GeoCoordinates', iri: string, label: string, latitude: number, longitude: number }>> } | { __typename: 'GeoShapesDimension' } | { __typename: 'Measure' } | { __typename: 'NominalDimension' } | { __typename: 'OrdinalDimension' } | { __typename: 'TemporalDimension' }> }> };

export type GeoShapesByDimensionIriQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
}>;


export type GeoShapesByDimensionIriQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension' } | { __typename: 'GeoShapesDimension', geoShapes?: Maybe<any> } | { __typename: 'Measure' } | { __typename: 'NominalDimension' } | { __typename: 'OrdinalDimension' } | { __typename: 'TemporalDimension' }> }> };

export type TemporalDimensionValuesQueryVariables = Exact<{
  dataCubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
  locale: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
  filters?: Maybe<Scalars['Filters']>;
}>;


export type TemporalDimensionValuesQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension' } | { __typename: 'GeoShapesDimension' } | { __typename: 'Measure' } | { __typename: 'NominalDimension' } | { __typename: 'OrdinalDimension' } | (
      { __typename: 'TemporalDimension', timeUnit: TimeUnit, timeFormat: string }
      & DimensionMetaData_TemporalDimension_Fragment
    )> }> };

export type DataCubeObservationsQueryVariables = Exact<{
  iri: Scalars['String'];
  locale: Scalars['String'];
  dimensions?: Maybe<Array<Scalars['String']> | Scalars['String']>;
  filters?: Maybe<Scalars['Filters']>;
  latest?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', iri: string, title: string, description?: Maybe<string>, dimensions: Array<(
      { __typename: 'GeoCoordinatesDimension' }
      & DimensionMetaData_GeoCoordinatesDimension_Fragment
    ) | (
      { __typename: 'GeoShapesDimension' }
      & DimensionMetaData_GeoShapesDimension_Fragment
    ) | (
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    ) | (
      { __typename: 'NominalDimension' }
      & DimensionMetaData_NominalDimension_Fragment
    ) | (
      { __typename: 'OrdinalDimension' }
      & DimensionMetaData_OrdinalDimension_Fragment
    ) | (
      { __typename: 'TemporalDimension' }
      & DimensionMetaData_TemporalDimension_Fragment
    )>, measures: Array<(
      { __typename: 'Measure' }
      & DimensionMetaData_Measure_Fragment
    )>, observations: { __typename: 'ObservationsQuery', data: Array<any>, sparqlEditorUrl?: Maybe<string> } }> };

export type PossibleFiltersQueryVariables = Exact<{
  iri: Scalars['String'];
  filters: Scalars['Filters'];
}>;


export type PossibleFiltersQuery = { __typename: 'Query', possibleFilters: Array<{ __typename: 'ObservationFilter', iri: string, type: string, value?: Maybe<any> }> };

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

export type HierarchyValueFieldsFragment = { __typename: 'HierarchyValue', value: string, dimensionIri: string, depth: number, label: string, hasValue?: Maybe<boolean> };

export type DimensionHierarchyQueryVariables = Exact<{
  locale: Scalars['String'];
  cubeIri: Scalars['String'];
  dimensionIri: Scalars['String'];
}>;


export type DimensionHierarchyQuery = { __typename: 'Query', dataCubeByIri?: Maybe<{ __typename: 'DataCube', dimensionByIri?: Maybe<{ __typename: 'GeoCoordinatesDimension', hierarchy?: Maybe<Array<(
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
      )>> } | { __typename: 'GeoShapesDimension', hierarchy?: Maybe<Array<(
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
      )>> } | { __typename: 'Measure', hierarchy?: Maybe<Array<(
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
      )>> } | { __typename: 'NominalDimension', hierarchy?: Maybe<Array<(
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
      )>> } | { __typename: 'OrdinalDimension', hierarchy?: Maybe<Array<(
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
      )>> } | { __typename: 'TemporalDimension', hierarchy?: Maybe<Array<(
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
      )>> }> }> };

export type DatasetCountQueryVariables = Exact<{
  theme?: Maybe<Scalars['String']>;
  organization?: Maybe<Scalars['String']>;
  subtheme?: Maybe<Scalars['String']>;
  includeDrafts?: Maybe<Scalars['Boolean']>;
}>;


export type DatasetCountQuery = { __typename: 'Query', datasetcount?: Maybe<Array<{ __typename: 'DatasetCount', count: number, iri: string }>> };

export const DimensionMetaDataFragmentDoc = gql`
    fragment dimensionMetaData on Dimension {
  iri
  label
  isNumerical
  isKeyDimension
  order
  values(filters: $filters)
  unit
  related {
    iri
    type
  }
  ... on TemporalDimension {
    timeUnit
    timeFormat
  }
}
    `;
export const HierarchyValueFieldsFragmentDoc = gql`
    fragment hierarchyValueFields on HierarchyValue {
  value
  dimensionIri
  depth
  label
  hasValue
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
    query DataCubePreview($iri: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
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
    query DataCubePreviewObservations($iri: String!, $locale: String!, $dimensions: [String!], $latest: Boolean) {
  dataCubeByIri(iri: $iri, locale: $locale, latest: $latest) {
    observations(limit: 10, dimensions: $dimensions) {
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
    query DataCubeMetadataWithComponentValues($iri: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
  dataCubeByIri(iri: $iri, locale: $locale, latest: $latest) {
    iri
    title
    publisher
    identifier
    workExamples
    creator {
      iri
    }
    landingPage
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
    query DimensionValues($dataCubeIri: String!, $dimensionIri: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
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
export const GeoCoordinatesByDimensionIriDocument = gql`
    query GeoCoordinatesByDimensionIri($dataCubeIri: String!, $dimensionIri: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(iri: $dataCubeIri, locale: $locale, latest: $latest) {
    dimensionByIri(iri: $dimensionIri) {
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
    query GeoShapesByDimensionIri($dataCubeIri: String!, $dimensionIri: String!, $locale: String!, $latest: Boolean) {
  dataCubeByIri(iri: $dataCubeIri, locale: $locale, latest: $latest) {
    dimensionByIri(iri: $dimensionIri) {
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
    query TemporalDimensionValues($dataCubeIri: String!, $dimensionIri: String!, $locale: String!, $latest: Boolean, $filters: Filters) {
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
    query DataCubeObservations($iri: String!, $locale: String!, $dimensions: [String!], $filters: Filters, $latest: Boolean, $limit: Int) {
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
    observations(dimensions: $dimensions, filters: $filters, limit: $limit) {
      data
      sparqlEditorUrl
    }
  }
}
    ${DimensionMetaDataFragmentDoc}`;

export function useDataCubeObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubeObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubeObservationsQuery>({ query: DataCubeObservationsDocument, ...options });
};
export const PossibleFiltersDocument = gql`
    query PossibleFilters($iri: String!, $filters: Filters!) {
  possibleFilters(iri: $iri, filters: $filters) {
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
export const DimensionHierarchyDocument = gql`
    query DimensionHierarchy($locale: String!, $cubeIri: String!, $dimensionIri: String!) {
  dataCubeByIri(iri: $cubeIri, locale: $locale) {
    dimensionByIri(iri: $dimensionIri) {
      hierarchy {
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

export function useDimensionHierarchyQuery(options: Omit<Urql.UseQueryArgs<DimensionHierarchyQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DimensionHierarchyQuery>({ query: DimensionHierarchyDocument, ...options });
};
export const DatasetCountDocument = gql`
    query DatasetCount($theme: String, $organization: String, $subtheme: String, $includeDrafts: Boolean) {
  datasetcount(
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