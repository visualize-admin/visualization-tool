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
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolvedDataCube, ResolvedObservationsQuery, ResolvedMeasure, ResolvedDimension } from './shared-types';
import { VisualizeGraphQLContext } from './context';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
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
  Termset: any;
  ValueIdentifier: any;
  ValuePosition: any;
};

export type DataCube = {
  __typename?: 'DataCube';
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
  __typename?: 'DataCubeOrganization';
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

export type DataCubeTermsetFilter = {
  iri: Scalars['String'];
  latest?: Maybe<Scalars['Boolean']>;
};

export type DataCubeTheme = {
  __typename?: 'DataCubeTheme';
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
  __typename?: 'GeoCoordinatesDimension';
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
  __typename?: 'GeoShapesDimension';
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
  __typename?: 'NominalDimension';
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
  __typename?: 'NumericalMeasure';
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
  __typename?: 'ObservationFilter';
  type: Scalars['String'];
  value?: Maybe<Scalars['FilterValue']>;
  iri: Scalars['String'];
};

export type ObservationsQuery = {
  __typename?: 'ObservationsQuery';
  data: Array<Scalars['Observation']>;
  sparqlEditorUrl?: Maybe<Scalars['String']>;
};

export type OrdinalDimension = Dimension & {
  __typename?: 'OrdinalDimension';
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
  __typename?: 'OrdinalMeasure';
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
  __typename?: 'Query';
  dataCubeComponents: Scalars['DataCubeComponents'];
  dataCubeTermsets: Array<Scalars['Termset']>;
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


export type QueryDataCubeTermsetsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeTermsetFilter;
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
  __typename?: 'RelatedDimension';
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
  SharedDimensions = 'SharedDimensions'
}

export type SearchCubeResult = {
  __typename?: 'SearchCubeResult';
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
  __typename?: 'StandardErrorDimension';
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
  __typename?: 'TemporalDimension';
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
  __typename?: 'TemporalEntityDimension';
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
  __typename?: 'TemporalOrdinalDimension';
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



export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  DataCube: ResolverTypeWrapper<ResolvedDataCube>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DataCubeComponentFilter: DataCubeComponentFilter;
  DataCubeComponents: ResolverTypeWrapper<Scalars['DataCubeComponents']>;
  DataCubeMetadata: ResolverTypeWrapper<Scalars['DataCubeMetadata']>;
  DataCubeMetadataFilter: DataCubeMetadataFilter;
  DataCubeObservationFilter: DataCubeObservationFilter;
  DataCubeObservations: ResolverTypeWrapper<Scalars['DataCubeObservations']>;
  DataCubeOrganization: ResolverTypeWrapper<DataCubeOrganization>;
  DataCubePreview: ResolverTypeWrapper<Scalars['DataCubePreview']>;
  DataCubePreviewFilter: DataCubePreviewFilter;
  DataCubePublicationStatus: DataCubePublicationStatus;
  DataCubeTermsetFilter: DataCubeTermsetFilter;
  DataCubeTheme: ResolverTypeWrapper<DataCubeTheme>;
  Dimension: ResolverTypeWrapper<ResolvedDimension>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  DimensionValue: ResolverTypeWrapper<Scalars['DimensionValue']>;
  FilterValue: ResolverTypeWrapper<Scalars['FilterValue']>;
  Filters: ResolverTypeWrapper<Scalars['Filters']>;
  GeoCoordinatesDimension: ResolverTypeWrapper<ResolvedDimension>;
  GeoShapes: ResolverTypeWrapper<Scalars['GeoShapes']>;
  GeoShapesDimension: ResolverTypeWrapper<ResolvedDimension>;
  HierarchyValue: ResolverTypeWrapper<Scalars['HierarchyValue']>;
  Measure: ResolversTypes['NumericalMeasure'] | ResolversTypes['OrdinalMeasure'];
  NominalDimension: ResolverTypeWrapper<ResolvedDimension>;
  NumericalMeasure: ResolverTypeWrapper<ResolvedMeasure>;
  Observation: ResolverTypeWrapper<Scalars['Observation']>;
  ObservationFilter: ResolverTypeWrapper<ObservationFilter>;
  ObservationsQuery: ResolverTypeWrapper<ResolvedObservationsQuery>;
  OrdinalDimension: ResolverTypeWrapper<ResolvedDimension>;
  OrdinalMeasure: ResolverTypeWrapper<ResolvedMeasure>;
  Query: ResolverTypeWrapper<{}>;
  RawObservation: ResolverTypeWrapper<Scalars['RawObservation']>;
  RelatedDimension: ResolverTypeWrapper<RelatedDimension>;
  ScaleType: ScaleType;
  SearchCube: ResolverTypeWrapper<Scalars['SearchCube']>;
  SearchCubeFilter: SearchCubeFilter;
  SearchCubeFilterType: SearchCubeFilterType;
  SearchCubeResult: ResolverTypeWrapper<SearchCubeResult>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  SearchCubeResultOrder: SearchCubeResultOrder;
  SingleFilters: ResolverTypeWrapper<Scalars['SingleFilters']>;
  StandardErrorDimension: ResolverTypeWrapper<ResolvedDimension>;
  TemporalDimension: ResolverTypeWrapper<ResolvedDimension>;
  TemporalEntityDimension: ResolverTypeWrapper<TemporalEntityDimension>;
  TemporalOrdinalDimension: ResolverTypeWrapper<ResolvedDimension>;
  Termset: ResolverTypeWrapper<Scalars['Termset']>;
  TimeUnit: TimeUnit;
  ValueIdentifier: ResolverTypeWrapper<Scalars['ValueIdentifier']>;
  ValuePosition: ResolverTypeWrapper<Scalars['ValuePosition']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  DataCube: ResolvedDataCube;
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  DataCubeComponentFilter: DataCubeComponentFilter;
  DataCubeComponents: Scalars['DataCubeComponents'];
  DataCubeMetadata: Scalars['DataCubeMetadata'];
  DataCubeMetadataFilter: DataCubeMetadataFilter;
  DataCubeObservationFilter: DataCubeObservationFilter;
  DataCubeObservations: Scalars['DataCubeObservations'];
  DataCubeOrganization: DataCubeOrganization;
  DataCubePreview: Scalars['DataCubePreview'];
  DataCubePreviewFilter: DataCubePreviewFilter;
  DataCubeTermsetFilter: DataCubeTermsetFilter;
  DataCubeTheme: DataCubeTheme;
  Dimension: ResolvedDimension;
  Int: Scalars['Int'];
  DimensionValue: Scalars['DimensionValue'];
  FilterValue: Scalars['FilterValue'];
  Filters: Scalars['Filters'];
  GeoCoordinatesDimension: ResolvedDimension;
  GeoShapes: Scalars['GeoShapes'];
  GeoShapesDimension: ResolvedDimension;
  HierarchyValue: Scalars['HierarchyValue'];
  Measure: ResolversParentTypes['NumericalMeasure'] | ResolversParentTypes['OrdinalMeasure'];
  NominalDimension: ResolvedDimension;
  NumericalMeasure: ResolvedMeasure;
  Observation: Scalars['Observation'];
  ObservationFilter: ObservationFilter;
  ObservationsQuery: ResolvedObservationsQuery;
  OrdinalDimension: ResolvedDimension;
  OrdinalMeasure: ResolvedMeasure;
  Query: {};
  RawObservation: Scalars['RawObservation'];
  RelatedDimension: RelatedDimension;
  SearchCube: Scalars['SearchCube'];
  SearchCubeFilter: SearchCubeFilter;
  SearchCubeResult: SearchCubeResult;
  Float: Scalars['Float'];
  SingleFilters: Scalars['SingleFilters'];
  StandardErrorDimension: ResolvedDimension;
  TemporalDimension: ResolvedDimension;
  TemporalEntityDimension: TemporalEntityDimension;
  TemporalOrdinalDimension: ResolvedDimension;
  Termset: Scalars['Termset'];
  ValueIdentifier: Scalars['ValueIdentifier'];
  ValuePosition: Scalars['ValuePosition'];
}>;

export type DataCubeResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['DataCube'] = ResolversParentTypes['DataCube']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  creator?: Resolver<Maybe<ResolversTypes['DataCubeOrganization']>, ParentType, ContextType>;
  landingPage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  workExamples?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  publisher?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  datePublished?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateModified?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expires?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publicationStatus?: Resolver<ResolversTypes['DataCubePublicationStatus'], ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['Dimension']>, ParentType, ContextType, RequireFields<DataCubeDimensionsArgs, 'sourceType' | 'sourceUrl'>>;
  dimensionByIri?: Resolver<Maybe<ResolversTypes['Dimension']>, ParentType, ContextType, RequireFields<DataCubeDimensionByIriArgs, 'iri' | 'sourceType' | 'sourceUrl'>>;
  measures?: Resolver<Array<ResolversTypes['Measure']>, ParentType, ContextType, RequireFields<DataCubeMeasuresArgs, 'sourceType' | 'sourceUrl'>>;
  themes?: Resolver<Array<ResolversTypes['DataCubeTheme']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DataCubeComponentsScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DataCubeComponents'], any> {
  name: 'DataCubeComponents';
}

export interface DataCubeMetadataScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DataCubeMetadata'], any> {
  name: 'DataCubeMetadata';
}

export interface DataCubeObservationsScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DataCubeObservations'], any> {
  name: 'DataCubeObservations';
}

export type DataCubeOrganizationResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['DataCubeOrganization'] = ResolversParentTypes['DataCubeOrganization']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DataCubePreviewScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DataCubePreview'], any> {
  name: 'DataCubePreview';
}

export type DataCubeThemeResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['DataCubeTheme'] = ResolversParentTypes['DataCubeTheme']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['Dimension'] = ResolversParentTypes['Dimension']> = ResolversObject<{
  __resolveType: TypeResolveFn<'GeoCoordinatesDimension' | 'GeoShapesDimension' | 'NominalDimension' | 'NumericalMeasure' | 'OrdinalDimension' | 'OrdinalMeasure' | 'StandardErrorDimension' | 'TemporalDimension' | 'TemporalEntityDimension' | 'TemporalOrdinalDimension', ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<DimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
}>;

export interface DimensionValueScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DimensionValue'], any> {
  name: 'DimensionValue';
}

export interface FilterValueScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['FilterValue'], any> {
  name: 'FilterValue';
}

export interface FiltersScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Filters'], any> {
  name: 'Filters';
}

export type GeoCoordinatesDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['GeoCoordinatesDimension'] = ResolversParentTypes['GeoCoordinatesDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<GeoCoordinatesDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GeoShapesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GeoShapes'], any> {
  name: 'GeoShapes';
}

export type GeoShapesDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['GeoShapesDimension'] = ResolversParentTypes['GeoShapesDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<GeoShapesDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface HierarchyValueScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HierarchyValue'], any> {
  name: 'HierarchyValue';
}

export type MeasureResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['Measure'] = ResolversParentTypes['Measure']> = ResolversObject<{
  __resolveType: TypeResolveFn<'NumericalMeasure' | 'OrdinalMeasure', ParentType, ContextType>;
}>;

export type NominalDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['NominalDimension'] = ResolversParentTypes['NominalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<NominalDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NumericalMeasureResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['NumericalMeasure'] = ResolversParentTypes['NumericalMeasure']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isCurrency?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isDecimal?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  currencyExponent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  resolution?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<NumericalMeasureValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface ObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Observation'], any> {
  name: 'Observation';
}

export type ObservationFilterResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['ObservationFilter'] = ResolversParentTypes['ObservationFilter']> = ResolversObject<{
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['FilterValue']>, ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ObservationsQueryResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['ObservationsQuery'] = ResolversParentTypes['ObservationsQuery']> = ResolversObject<{
  data?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType>;
  sparqlEditorUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrdinalDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['OrdinalDimension'] = ResolversParentTypes['OrdinalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<OrdinalDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrdinalMeasureResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['OrdinalMeasure'] = ResolversParentTypes['OrdinalMeasure']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<OrdinalMeasureValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dataCubeComponents?: Resolver<ResolversTypes['DataCubeComponents'], ParentType, ContextType, RequireFields<QueryDataCubeComponentsArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubeTermsets?: Resolver<Array<ResolversTypes['Termset']>, ParentType, ContextType, RequireFields<QueryDataCubeTermsetsArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubeMetadata?: Resolver<ResolversTypes['DataCubeMetadata'], ParentType, ContextType, RequireFields<QueryDataCubeMetadataArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubeObservations?: Resolver<ResolversTypes['DataCubeObservations'], ParentType, ContextType, RequireFields<QueryDataCubeObservationsArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubePreview?: Resolver<ResolversTypes['DataCubePreview'], ParentType, ContextType, RequireFields<QueryDataCubePreviewArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  possibleFilters?: Resolver<Array<ResolversTypes['ObservationFilter']>, ParentType, ContextType, RequireFields<QueryPossibleFiltersArgs, 'iri' | 'sourceType' | 'sourceUrl' | 'filters'>>;
  searchCubes?: Resolver<Array<ResolversTypes['SearchCubeResult']>, ParentType, ContextType, RequireFields<QuerySearchCubesArgs, 'sourceType' | 'sourceUrl'>>;
  dataCubeDimensionGeoShapes?: Resolver<Maybe<ResolversTypes['GeoShapes']>, ParentType, ContextType, RequireFields<QueryDataCubeDimensionGeoShapesArgs, 'cubeIri' | 'dimensionIri' | 'sourceType' | 'sourceUrl' | 'locale'>>;
}>;

export interface RawObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RawObservation'], any> {
  name: 'RawObservation';
}

export type RelatedDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['RelatedDimension'] = ResolversParentTypes['RelatedDimension']> = ResolversObject<{
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface SearchCubeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SearchCube'], any> {
  name: 'SearchCube';
}

export type SearchCubeResultResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['SearchCubeResult'] = ResolversParentTypes['SearchCubeResult']> = ResolversObject<{
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  cube?: Resolver<ResolversTypes['SearchCube'], ParentType, ContextType>;
  highlightedTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highlightedDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface SingleFiltersScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SingleFilters'], any> {
  name: 'SingleFilters';
}

export type StandardErrorDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['StandardErrorDimension'] = ResolversParentTypes['StandardErrorDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<StandardErrorDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TemporalDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['TemporalDimension'] = ResolversParentTypes['TemporalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeUnit?: Resolver<ResolversTypes['TimeUnit'], ParentType, ContextType>;
  timeFormat?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<TemporalDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TemporalEntityDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['TemporalEntityDimension'] = ResolversParentTypes['TemporalEntityDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeUnit?: Resolver<ResolversTypes['TimeUnit'], ParentType, ContextType>;
  timeFormat?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<TemporalEntityDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TemporalOrdinalDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['TemporalOrdinalDimension'] = ResolversParentTypes['TemporalOrdinalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scaleType?: Resolver<Maybe<ResolversTypes['ScaleType']>, ParentType, ContextType>;
  dataType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isNumerical?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isKeyDimension?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType, RequireFields<TemporalOrdinalDimensionValuesArgs, 'sourceType' | 'sourceUrl'>>;
  related?: Resolver<Maybe<Array<ResolversTypes['RelatedDimension']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TermsetScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Termset'], any> {
  name: 'Termset';
}

export interface ValueIdentifierScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ValueIdentifier'], any> {
  name: 'ValueIdentifier';
}

export interface ValuePositionScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ValuePosition'], any> {
  name: 'ValuePosition';
}

export type Resolvers<ContextType = VisualizeGraphQLContext> = ResolversObject<{
  DataCube?: DataCubeResolvers<ContextType>;
  DataCubeComponents?: GraphQLScalarType;
  DataCubeMetadata?: GraphQLScalarType;
  DataCubeObservations?: GraphQLScalarType;
  DataCubeOrganization?: DataCubeOrganizationResolvers<ContextType>;
  DataCubePreview?: GraphQLScalarType;
  DataCubeTheme?: DataCubeThemeResolvers<ContextType>;
  Dimension?: DimensionResolvers<ContextType>;
  DimensionValue?: GraphQLScalarType;
  FilterValue?: GraphQLScalarType;
  Filters?: GraphQLScalarType;
  GeoCoordinatesDimension?: GeoCoordinatesDimensionResolvers<ContextType>;
  GeoShapes?: GraphQLScalarType;
  GeoShapesDimension?: GeoShapesDimensionResolvers<ContextType>;
  HierarchyValue?: GraphQLScalarType;
  Measure?: MeasureResolvers<ContextType>;
  NominalDimension?: NominalDimensionResolvers<ContextType>;
  NumericalMeasure?: NumericalMeasureResolvers<ContextType>;
  Observation?: GraphQLScalarType;
  ObservationFilter?: ObservationFilterResolvers<ContextType>;
  ObservationsQuery?: ObservationsQueryResolvers<ContextType>;
  OrdinalDimension?: OrdinalDimensionResolvers<ContextType>;
  OrdinalMeasure?: OrdinalMeasureResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RawObservation?: GraphQLScalarType;
  RelatedDimension?: RelatedDimensionResolvers<ContextType>;
  SearchCube?: GraphQLScalarType;
  SearchCubeResult?: SearchCubeResultResolvers<ContextType>;
  SingleFilters?: GraphQLScalarType;
  StandardErrorDimension?: StandardErrorDimensionResolvers<ContextType>;
  TemporalDimension?: TemporalDimensionResolvers<ContextType>;
  TemporalEntityDimension?: TemporalEntityDimensionResolvers<ContextType>;
  TemporalOrdinalDimension?: TemporalOrdinalDimensionResolvers<ContextType>;
  Termset?: GraphQLScalarType;
  ValueIdentifier?: GraphQLScalarType;
  ValuePosition?: GraphQLScalarType;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = VisualizeGraphQLContext> = Resolvers<ContextType>;
