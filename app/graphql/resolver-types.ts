import { ComponentTermsets } from '../domain/data';
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
import { Termset } from '../domain/data';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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
  ComponentTermsets: ComponentTermsets;
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
  Termset: Termset;
  ValueIdentifier: any;
  ValuePosition: any;
};


export type DataCubeComponentFilter = {
  iri: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  componentIris?: Maybe<Array<Scalars['String']>>;
  joinBy?: Maybe<Array<Scalars['String']>>;
  loadValues?: Maybe<Scalars['Boolean']>;
};


export type DataCubeLatestIriFilter = {
  iri: Scalars['String'];
};


export type DataCubeMetadataFilter = {
  iri: Scalars['String'];
};

export type DataCubeObservationFilter = {
  iri: Scalars['String'];
  filters?: Maybe<Scalars['Filters']>;
  componentIris?: Maybe<Array<Scalars['String']>>;
  joinBy?: Maybe<Array<Scalars['String']>>;
};


export type DataCubeOrganization = {
  __typename?: 'DataCubeOrganization';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};

export type DataCubePossibleFiltersCubeFilter = {
  iri: Scalars['String'];
  filters: Scalars['SingleFilters'];
};


export type DataCubePreviewFilter = {
  iri: Scalars['String'];
};

export enum DataCubePublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type DataCubeTermsetFilter = {
  iri: Scalars['String'];
};

export type DataCubeTheme = {
  __typename?: 'DataCubeTheme';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};







export type ObservationFilter = {
  __typename?: 'ObservationFilter';
  type: Scalars['String'];
  value?: Maybe<Scalars['FilterValue']>;
  iri: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  dataCubeLatestIri: Scalars['String'];
  dataCubeComponents: Scalars['DataCubeComponents'];
  dataCubeComponentTermsets: Array<Scalars['ComponentTermsets']>;
  dataCubeMetadata: Scalars['DataCubeMetadata'];
  dataCubeObservations: Scalars['DataCubeObservations'];
  dataCubePreview: Scalars['DataCubePreview'];
  possibleFilters: Array<ObservationFilter>;
  searchCubes: Array<SearchCubeResult>;
  dataCubeDimensionGeoShapes?: Maybe<Scalars['GeoShapes']>;
  allTermsets: Array<TermsetCount>;
};


export type QueryDataCubeLatestIriArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  cubeFilter: DataCubeLatestIriFilter;
};


export type QueryDataCubeComponentsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  cubeFilter: DataCubeComponentFilter;
};


export type QueryDataCubeComponentTermsetsArgs = {
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
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  cubeFilter: DataCubePossibleFiltersCubeFilter;
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


export type QueryAllTermsetsArgs = {
  sourceType: Scalars['String'];
  sourceUrl: Scalars['String'];
  locale: Scalars['String'];
  includeDrafts?: Maybe<Scalars['Boolean']>;
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
  Termset = 'Termset'
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



export type TermsetCount = {
  __typename?: 'TermsetCount';
  termset: Scalars['Termset'];
  count: Scalars['Int'];
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
  ComponentTermsets: ResolverTypeWrapper<Scalars['ComponentTermsets']>;
  DataCubeComponentFilter: DataCubeComponentFilter;
  String: ResolverTypeWrapper<Scalars['String']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DataCubeComponents: ResolverTypeWrapper<Scalars['DataCubeComponents']>;
  DataCubeLatestIriFilter: DataCubeLatestIriFilter;
  DataCubeMetadata: ResolverTypeWrapper<Scalars['DataCubeMetadata']>;
  DataCubeMetadataFilter: DataCubeMetadataFilter;
  DataCubeObservationFilter: DataCubeObservationFilter;
  DataCubeObservations: ResolverTypeWrapper<Scalars['DataCubeObservations']>;
  DataCubeOrganization: ResolverTypeWrapper<DataCubeOrganization>;
  DataCubePossibleFiltersCubeFilter: DataCubePossibleFiltersCubeFilter;
  DataCubePreview: ResolverTypeWrapper<Scalars['DataCubePreview']>;
  DataCubePreviewFilter: DataCubePreviewFilter;
  DataCubePublicationStatus: DataCubePublicationStatus;
  DataCubeTermsetFilter: DataCubeTermsetFilter;
  DataCubeTheme: ResolverTypeWrapper<DataCubeTheme>;
  DimensionValue: ResolverTypeWrapper<Scalars['DimensionValue']>;
  FilterValue: ResolverTypeWrapper<Scalars['FilterValue']>;
  Filters: ResolverTypeWrapper<Scalars['Filters']>;
  GeoShapes: ResolverTypeWrapper<Scalars['GeoShapes']>;
  HierarchyValue: ResolverTypeWrapper<Scalars['HierarchyValue']>;
  Observation: ResolverTypeWrapper<Scalars['Observation']>;
  ObservationFilter: ResolverTypeWrapper<ObservationFilter>;
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
  Termset: ResolverTypeWrapper<Scalars['Termset']>;
  TermsetCount: ResolverTypeWrapper<TermsetCount>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  TimeUnit: TimeUnit;
  ValueIdentifier: ResolverTypeWrapper<Scalars['ValueIdentifier']>;
  ValuePosition: ResolverTypeWrapper<Scalars['ValuePosition']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ComponentTermsets: Scalars['ComponentTermsets'];
  DataCubeComponentFilter: DataCubeComponentFilter;
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  DataCubeComponents: Scalars['DataCubeComponents'];
  DataCubeLatestIriFilter: DataCubeLatestIriFilter;
  DataCubeMetadata: Scalars['DataCubeMetadata'];
  DataCubeMetadataFilter: DataCubeMetadataFilter;
  DataCubeObservationFilter: DataCubeObservationFilter;
  DataCubeObservations: Scalars['DataCubeObservations'];
  DataCubeOrganization: DataCubeOrganization;
  DataCubePossibleFiltersCubeFilter: DataCubePossibleFiltersCubeFilter;
  DataCubePreview: Scalars['DataCubePreview'];
  DataCubePreviewFilter: DataCubePreviewFilter;
  DataCubeTermsetFilter: DataCubeTermsetFilter;
  DataCubeTheme: DataCubeTheme;
  DimensionValue: Scalars['DimensionValue'];
  FilterValue: Scalars['FilterValue'];
  Filters: Scalars['Filters'];
  GeoShapes: Scalars['GeoShapes'];
  HierarchyValue: Scalars['HierarchyValue'];
  Observation: Scalars['Observation'];
  ObservationFilter: ObservationFilter;
  Query: {};
  RawObservation: Scalars['RawObservation'];
  RelatedDimension: RelatedDimension;
  SearchCube: Scalars['SearchCube'];
  SearchCubeFilter: SearchCubeFilter;
  SearchCubeResult: SearchCubeResult;
  Float: Scalars['Float'];
  SingleFilters: Scalars['SingleFilters'];
  Termset: Scalars['Termset'];
  TermsetCount: TermsetCount;
  Int: Scalars['Int'];
  ValueIdentifier: Scalars['ValueIdentifier'];
  ValuePosition: Scalars['ValuePosition'];
}>;

export interface ComponentTermsetsScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ComponentTermsets'], any> {
  name: 'ComponentTermsets';
}

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

export interface DimensionValueScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DimensionValue'], any> {
  name: 'DimensionValue';
}

export interface FilterValueScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['FilterValue'], any> {
  name: 'FilterValue';
}

export interface FiltersScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Filters'], any> {
  name: 'Filters';
}

export interface GeoShapesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GeoShapes'], any> {
  name: 'GeoShapes';
}

export interface HierarchyValueScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HierarchyValue'], any> {
  name: 'HierarchyValue';
}

export interface ObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Observation'], any> {
  name: 'Observation';
}

export type ObservationFilterResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['ObservationFilter'] = ResolversParentTypes['ObservationFilter']> = ResolversObject<{
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['FilterValue']>, ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dataCubeLatestIri?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryDataCubeLatestIriArgs, 'sourceType' | 'sourceUrl' | 'cubeFilter'>>;
  dataCubeComponents?: Resolver<ResolversTypes['DataCubeComponents'], ParentType, ContextType, RequireFields<QueryDataCubeComponentsArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubeComponentTermsets?: Resolver<Array<ResolversTypes['ComponentTermsets']>, ParentType, ContextType, RequireFields<QueryDataCubeComponentTermsetsArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubeMetadata?: Resolver<ResolversTypes['DataCubeMetadata'], ParentType, ContextType, RequireFields<QueryDataCubeMetadataArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubeObservations?: Resolver<ResolversTypes['DataCubeObservations'], ParentType, ContextType, RequireFields<QueryDataCubeObservationsArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  dataCubePreview?: Resolver<ResolversTypes['DataCubePreview'], ParentType, ContextType, RequireFields<QueryDataCubePreviewArgs, 'sourceType' | 'sourceUrl' | 'locale' | 'cubeFilter'>>;
  possibleFilters?: Resolver<Array<ResolversTypes['ObservationFilter']>, ParentType, ContextType, RequireFields<QueryPossibleFiltersArgs, 'sourceType' | 'sourceUrl' | 'cubeFilter'>>;
  searchCubes?: Resolver<Array<ResolversTypes['SearchCubeResult']>, ParentType, ContextType, RequireFields<QuerySearchCubesArgs, 'sourceType' | 'sourceUrl'>>;
  dataCubeDimensionGeoShapes?: Resolver<Maybe<ResolversTypes['GeoShapes']>, ParentType, ContextType, RequireFields<QueryDataCubeDimensionGeoShapesArgs, 'cubeIri' | 'dimensionIri' | 'sourceType' | 'sourceUrl' | 'locale'>>;
  allTermsets?: Resolver<Array<ResolversTypes['TermsetCount']>, ParentType, ContextType, RequireFields<QueryAllTermsetsArgs, 'sourceType' | 'sourceUrl' | 'locale'>>;
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

export interface TermsetScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Termset'], any> {
  name: 'Termset';
}

export type TermsetCountResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['TermsetCount'] = ResolversParentTypes['TermsetCount']> = ResolversObject<{
  termset?: Resolver<ResolversTypes['Termset'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface ValueIdentifierScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ValueIdentifier'], any> {
  name: 'ValueIdentifier';
}

export interface ValuePositionScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ValuePosition'], any> {
  name: 'ValuePosition';
}

export type Resolvers<ContextType = VisualizeGraphQLContext> = ResolversObject<{
  ComponentTermsets?: GraphQLScalarType;
  DataCubeComponents?: GraphQLScalarType;
  DataCubeMetadata?: GraphQLScalarType;
  DataCubeObservations?: GraphQLScalarType;
  DataCubeOrganization?: DataCubeOrganizationResolvers<ContextType>;
  DataCubePreview?: GraphQLScalarType;
  DataCubeTheme?: DataCubeThemeResolvers<ContextType>;
  DimensionValue?: GraphQLScalarType;
  FilterValue?: GraphQLScalarType;
  Filters?: GraphQLScalarType;
  GeoShapes?: GraphQLScalarType;
  HierarchyValue?: GraphQLScalarType;
  Observation?: GraphQLScalarType;
  ObservationFilter?: ObservationFilterResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RawObservation?: GraphQLScalarType;
  RelatedDimension?: RelatedDimensionResolvers<ContextType>;
  SearchCube?: GraphQLScalarType;
  SearchCubeResult?: SearchCubeResultResolvers<ContextType>;
  SingleFilters?: GraphQLScalarType;
  Termset?: GraphQLScalarType;
  TermsetCount?: TermsetCountResolvers<ContextType>;
  ValueIdentifier?: GraphQLScalarType;
  ValuePosition?: GraphQLScalarType;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = VisualizeGraphQLContext> = Resolvers<ContextType>;
