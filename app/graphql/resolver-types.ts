import { ComponentTermsets } from '../domain/data';
import { DataCubeComponents } from '../domain/data';
import { DataCubeMetadata } from '../domain/data';
import { DataCubeObservations } from '../domain/data';
import { DataCubePreview } from '../domain/data';
import { DataSourceUrl } from '../domain/data-source';
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
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  ComponentTermsets: { input: ComponentTermsets; output: ComponentTermsets; }
  DataCubeComponents: { input: DataCubeComponents; output: DataCubeComponents; }
  DataCubeMetadata: { input: DataCubeMetadata; output: DataCubeMetadata; }
  DataCubeObservations: { input: DataCubeObservations; output: DataCubeObservations; }
  DataCubePreview: { input: DataCubePreview; output: DataCubePreview; }
  DataSourceUrl: { input: DataSourceUrl; output: DataSourceUrl; }
  DimensionValue: { input: DimensionValue; output: DimensionValue; }
  FilterValue: { input: any; output: any; }
  Filters: { input: Filters; output: Filters; }
  GeoShapes: { input: GeoShapes; output: GeoShapes; }
  HierarchyValue: { input: HierarchyValue; output: HierarchyValue; }
  Observation: { input: Observation; output: Observation; }
  RawObservation: { input: RawObservation; output: RawObservation; }
  SearchCube: { input: SearchCube; output: SearchCube; }
  SingleFilters: { input: SingleFilters; output: SingleFilters; }
  Termset: { input: Termset; output: Termset; }
  ValueIdentifier: { input: any; output: any; }
  ValuePosition: { input: any; output: any; }
};

export type DataCubeComponentFilter = {
  componentIds?: InputMaybe<Array<Scalars['String']['input']>>;
  filters?: InputMaybe<Scalars['Filters']['input']>;
  iri: Scalars['String']['input'];
  joinBy?: InputMaybe<Array<Scalars['String']['input']>>;
  loadValues?: InputMaybe<Scalars['Boolean']['input']>;
};

export type DataCubeDimensionGeoShapesCubeFilter = {
  dimensionId: Scalars['String']['input'];
  iri: Scalars['String']['input'];
};

export type DataCubeLatestIriFilter = {
  iri: Scalars['String']['input'];
};

export type DataCubeMetadataFilter = {
  iri: Scalars['String']['input'];
};

export type DataCubeObservationFilter = {
  componentIds?: InputMaybe<Array<Scalars['String']['input']>>;
  filters?: InputMaybe<Scalars['Filters']['input']>;
  iri: Scalars['String']['input'];
  joinBy?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DataCubeOrganization = {
  __typename?: 'DataCubeOrganization';
  iri: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
};

export type DataCubePossibleFiltersCubeFilter = {
  filters: Scalars['SingleFilters']['input'];
  iri: Scalars['String']['input'];
};

export type DataCubePreviewFilter = {
  iri: Scalars['String']['input'];
};

export enum DataCubePublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type DataCubeTermset = {
  __typename?: 'DataCubeTermset';
  iri: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
};

export type DataCubeTermsetFilter = {
  iri: Scalars['String']['input'];
};

export type DataCubeTheme = {
  __typename?: 'DataCubeTheme';
  iri: Scalars['String']['output'];
  label?: Maybe<Scalars['String']['output']>;
};

export type DataCubeUnversionedIriFilter = {
  iri: Scalars['String']['input'];
};

export type PossibleFilterValue = {
  __typename?: 'PossibleFilterValue';
  id: Scalars['String']['output'];
  type: Scalars['String']['output'];
  value?: Maybe<Scalars['FilterValue']['output']>;
};

export type Query = {
  __typename?: 'Query';
  dataCubeComponentTermsets: Array<Scalars['ComponentTermsets']['output']>;
  dataCubeComponents: Scalars['DataCubeComponents']['output'];
  dataCubeDimensionGeoShapes?: Maybe<Scalars['GeoShapes']['output']>;
  dataCubeLatestIri: Scalars['String']['output'];
  dataCubeMetadata: Scalars['DataCubeMetadata']['output'];
  dataCubeObservations: Scalars['DataCubeObservations']['output'];
  dataCubePreview: Scalars['DataCubePreview']['output'];
  dataCubeUnversionedIri?: Maybe<Scalars['String']['output']>;
  possibleFilters: Array<PossibleFilterValue>;
  searchCubes: Array<SearchCubeResult>;
};


export type QueryDataCubeComponentTermsetsArgs = {
  cubeFilter: DataCubeTermsetFilter;
  locale: Scalars['String']['input'];
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryDataCubeComponentsArgs = {
  cubeFilter: DataCubeComponentFilter;
  locale: Scalars['String']['input'];
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryDataCubeDimensionGeoShapesArgs = {
  cubeFilter: DataCubeDimensionGeoShapesCubeFilter;
  locale: Scalars['String']['input'];
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryDataCubeLatestIriArgs = {
  cubeFilter: DataCubeLatestIriFilter;
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryDataCubeMetadataArgs = {
  cubeFilter: DataCubeMetadataFilter;
  locale: Scalars['String']['input'];
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryDataCubeObservationsArgs = {
  cubeFilter: DataCubeObservationFilter;
  locale: Scalars['String']['input'];
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryDataCubePreviewArgs = {
  cubeFilter: DataCubePreviewFilter;
  locale: Scalars['String']['input'];
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryDataCubeUnversionedIriArgs = {
  cubeFilter: DataCubeUnversionedIriFilter;
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QueryPossibleFiltersArgs = {
  cubeFilter: DataCubePossibleFiltersCubeFilter;
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};


export type QuerySearchCubesArgs = {
  fetchDimensionTermsets?: InputMaybe<Scalars['Boolean']['input']>;
  filters?: InputMaybe<Array<SearchCubeFilter>>;
  includeDrafts?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<SearchCubeResultOrder>;
  query?: InputMaybe<Scalars['String']['input']>;
  sourceType: Scalars['String']['input'];
  sourceUrl: Scalars['DataSourceUrl']['input'];
};

export type RelatedDimension = {
  __typename?: 'RelatedDimension';
  id: Scalars['String']['output'];
  type: RelatedDimensionType;
};

export enum RelatedDimensionType {
  ConfidenceLowerBound = 'ConfidenceLowerBound',
  ConfidenceUpperBound = 'ConfidenceUpperBound',
  StandardError = 'StandardError'
}

export enum ScaleType {
  Interval = 'Interval',
  Nominal = 'Nominal',
  Ordinal = 'Ordinal',
  Ratio = 'Ratio'
}

export type SearchCubeFilter = {
  label?: InputMaybe<Scalars['String']['input']>;
  type: SearchCubeFilterType;
  value: Scalars['String']['input'];
};

export enum SearchCubeFilterType {
  DataCubeAbout = 'DataCubeAbout',
  DataCubeOrganization = 'DataCubeOrganization',
  DataCubeTermset = 'DataCubeTermset',
  DataCubeTheme = 'DataCubeTheme',
  TemporalDimension = 'TemporalDimension'
}

export type SearchCubeResult = {
  __typename?: 'SearchCubeResult';
  cube: Scalars['SearchCube']['output'];
  highlightedDescription?: Maybe<Scalars['String']['output']>;
  highlightedTitle?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
};

export enum SearchCubeResultOrder {
  CreatedDesc = 'CREATED_DESC',
  Score = 'SCORE',
  TitleAsc = 'TITLE_ASC'
}

export enum TimeUnit {
  Day = 'Day',
  Hour = 'Hour',
  Minute = 'Minute',
  Month = 'Month',
  Second = 'Second',
  Week = 'Week',
  Year = 'Year'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

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

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ComponentTermsets: ResolverTypeWrapper<Scalars['ComponentTermsets']['output']>;
  DataCubeComponentFilter: DataCubeComponentFilter;
  DataCubeComponents: ResolverTypeWrapper<Scalars['DataCubeComponents']['output']>;
  DataCubeDimensionGeoShapesCubeFilter: DataCubeDimensionGeoShapesCubeFilter;
  DataCubeLatestIriFilter: DataCubeLatestIriFilter;
  DataCubeMetadata: ResolverTypeWrapper<Scalars['DataCubeMetadata']['output']>;
  DataCubeMetadataFilter: DataCubeMetadataFilter;
  DataCubeObservationFilter: DataCubeObservationFilter;
  DataCubeObservations: ResolverTypeWrapper<Scalars['DataCubeObservations']['output']>;
  DataCubeOrganization: ResolverTypeWrapper<DataCubeOrganization>;
  DataCubePossibleFiltersCubeFilter: DataCubePossibleFiltersCubeFilter;
  DataCubePreview: ResolverTypeWrapper<Scalars['DataCubePreview']['output']>;
  DataCubePreviewFilter: DataCubePreviewFilter;
  DataCubePublicationStatus: DataCubePublicationStatus;
  DataCubeTermset: ResolverTypeWrapper<DataCubeTermset>;
  DataCubeTermsetFilter: DataCubeTermsetFilter;
  DataCubeTheme: ResolverTypeWrapper<DataCubeTheme>;
  DataCubeUnversionedIriFilter: DataCubeUnversionedIriFilter;
  DataSourceUrl: ResolverTypeWrapper<Scalars['DataSourceUrl']['output']>;
  DimensionValue: ResolverTypeWrapper<Scalars['DimensionValue']['output']>;
  FilterValue: ResolverTypeWrapper<Scalars['FilterValue']['output']>;
  Filters: ResolverTypeWrapper<Scalars['Filters']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GeoShapes: ResolverTypeWrapper<Scalars['GeoShapes']['output']>;
  HierarchyValue: ResolverTypeWrapper<Scalars['HierarchyValue']['output']>;
  Observation: ResolverTypeWrapper<Scalars['Observation']['output']>;
  PossibleFilterValue: ResolverTypeWrapper<PossibleFilterValue>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RawObservation: ResolverTypeWrapper<Scalars['RawObservation']['output']>;
  RelatedDimension: ResolverTypeWrapper<RelatedDimension>;
  RelatedDimensionType: RelatedDimensionType;
  ScaleType: ScaleType;
  SearchCube: ResolverTypeWrapper<Scalars['SearchCube']['output']>;
  SearchCubeFilter: SearchCubeFilter;
  SearchCubeFilterType: SearchCubeFilterType;
  SearchCubeResult: ResolverTypeWrapper<SearchCubeResult>;
  SearchCubeResultOrder: SearchCubeResultOrder;
  SingleFilters: ResolverTypeWrapper<Scalars['SingleFilters']['output']>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Termset: ResolverTypeWrapper<Scalars['Termset']['output']>;
  TimeUnit: TimeUnit;
  ValueIdentifier: ResolverTypeWrapper<Scalars['ValueIdentifier']['output']>;
  ValuePosition: ResolverTypeWrapper<Scalars['ValuePosition']['output']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  ComponentTermsets: Scalars['ComponentTermsets']['output'];
  DataCubeComponentFilter: DataCubeComponentFilter;
  DataCubeComponents: Scalars['DataCubeComponents']['output'];
  DataCubeDimensionGeoShapesCubeFilter: DataCubeDimensionGeoShapesCubeFilter;
  DataCubeLatestIriFilter: DataCubeLatestIriFilter;
  DataCubeMetadata: Scalars['DataCubeMetadata']['output'];
  DataCubeMetadataFilter: DataCubeMetadataFilter;
  DataCubeObservationFilter: DataCubeObservationFilter;
  DataCubeObservations: Scalars['DataCubeObservations']['output'];
  DataCubeOrganization: DataCubeOrganization;
  DataCubePossibleFiltersCubeFilter: DataCubePossibleFiltersCubeFilter;
  DataCubePreview: Scalars['DataCubePreview']['output'];
  DataCubePreviewFilter: DataCubePreviewFilter;
  DataCubeTermset: DataCubeTermset;
  DataCubeTermsetFilter: DataCubeTermsetFilter;
  DataCubeTheme: DataCubeTheme;
  DataCubeUnversionedIriFilter: DataCubeUnversionedIriFilter;
  DataSourceUrl: Scalars['DataSourceUrl']['output'];
  DimensionValue: Scalars['DimensionValue']['output'];
  FilterValue: Scalars['FilterValue']['output'];
  Filters: Scalars['Filters']['output'];
  Float: Scalars['Float']['output'];
  GeoShapes: Scalars['GeoShapes']['output'];
  HierarchyValue: Scalars['HierarchyValue']['output'];
  Observation: Scalars['Observation']['output'];
  PossibleFilterValue: PossibleFilterValue;
  Query: Record<PropertyKey, never>;
  RawObservation: Scalars['RawObservation']['output'];
  RelatedDimension: RelatedDimension;
  SearchCube: Scalars['SearchCube']['output'];
  SearchCubeFilter: SearchCubeFilter;
  SearchCubeResult: SearchCubeResult;
  SingleFilters: Scalars['SingleFilters']['output'];
  String: Scalars['String']['output'];
  Termset: Scalars['Termset']['output'];
  ValueIdentifier: Scalars['ValueIdentifier']['output'];
  ValuePosition: Scalars['ValuePosition']['output'];
}>;

export type SafeUrlDirectiveArgs = {
  pattern?: Maybe<Scalars['String']['input']>;
};

export type SafeUrlDirectiveResolver<Result, Parent, ContextType = VisualizeGraphQLContext, Args = SafeUrlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

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
}>;

export interface DataCubePreviewScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DataCubePreview'], any> {
  name: 'DataCubePreview';
}

export type DataCubeTermsetResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['DataCubeTermset'] = ResolversParentTypes['DataCubeTermset']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DataCubeThemeResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['DataCubeTheme'] = ResolversParentTypes['DataCubeTheme']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface DataSourceUrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DataSourceUrl'], any> {
  name: 'DataSourceUrl';
}

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

export type PossibleFilterValueResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['PossibleFilterValue'] = ResolversParentTypes['PossibleFilterValue']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['FilterValue']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dataCubeComponentTermsets?: Resolver<Array<ResolversTypes['ComponentTermsets']>, ParentType, ContextType, RequireFields<QueryDataCubeComponentTermsetsArgs, 'cubeFilter' | 'locale' | 'sourceType' | 'sourceUrl'>>;
  dataCubeComponents?: Resolver<ResolversTypes['DataCubeComponents'], ParentType, ContextType, RequireFields<QueryDataCubeComponentsArgs, 'cubeFilter' | 'locale' | 'sourceType' | 'sourceUrl'>>;
  dataCubeDimensionGeoShapes?: Resolver<Maybe<ResolversTypes['GeoShapes']>, ParentType, ContextType, RequireFields<QueryDataCubeDimensionGeoShapesArgs, 'cubeFilter' | 'locale' | 'sourceType' | 'sourceUrl'>>;
  dataCubeLatestIri?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryDataCubeLatestIriArgs, 'cubeFilter' | 'sourceType' | 'sourceUrl'>>;
  dataCubeMetadata?: Resolver<ResolversTypes['DataCubeMetadata'], ParentType, ContextType, RequireFields<QueryDataCubeMetadataArgs, 'cubeFilter' | 'locale' | 'sourceType' | 'sourceUrl'>>;
  dataCubeObservations?: Resolver<ResolversTypes['DataCubeObservations'], ParentType, ContextType, RequireFields<QueryDataCubeObservationsArgs, 'cubeFilter' | 'locale' | 'sourceType' | 'sourceUrl'>>;
  dataCubePreview?: Resolver<ResolversTypes['DataCubePreview'], ParentType, ContextType, RequireFields<QueryDataCubePreviewArgs, 'cubeFilter' | 'locale' | 'sourceType' | 'sourceUrl'>>;
  dataCubeUnversionedIri?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryDataCubeUnversionedIriArgs, 'cubeFilter' | 'sourceType' | 'sourceUrl'>>;
  possibleFilters?: Resolver<Array<ResolversTypes['PossibleFilterValue']>, ParentType, ContextType, RequireFields<QueryPossibleFiltersArgs, 'cubeFilter' | 'sourceType' | 'sourceUrl'>>;
  searchCubes?: Resolver<Array<ResolversTypes['SearchCubeResult']>, ParentType, ContextType, RequireFields<QuerySearchCubesArgs, 'sourceType' | 'sourceUrl'>>;
}>;

export interface RawObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RawObservation'], any> {
  name: 'RawObservation';
}

export type RelatedDimensionResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['RelatedDimension'] = ResolversParentTypes['RelatedDimension']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['RelatedDimensionType'], ParentType, ContextType>;
}>;

export interface SearchCubeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SearchCube'], any> {
  name: 'SearchCube';
}

export type SearchCubeResultResolvers<ContextType = VisualizeGraphQLContext, ParentType extends ResolversParentTypes['SearchCubeResult'] = ResolversParentTypes['SearchCubeResult']> = ResolversObject<{
  cube?: Resolver<ResolversTypes['SearchCube'], ParentType, ContextType>;
  highlightedDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highlightedTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export interface SingleFiltersScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SingleFilters'], any> {
  name: 'SingleFilters';
}

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
  ComponentTermsets?: GraphQLScalarType;
  DataCubeComponents?: GraphQLScalarType;
  DataCubeMetadata?: GraphQLScalarType;
  DataCubeObservations?: GraphQLScalarType;
  DataCubeOrganization?: DataCubeOrganizationResolvers<ContextType>;
  DataCubePreview?: GraphQLScalarType;
  DataCubeTermset?: DataCubeTermsetResolvers<ContextType>;
  DataCubeTheme?: DataCubeThemeResolvers<ContextType>;
  DataSourceUrl?: GraphQLScalarType;
  DimensionValue?: GraphQLScalarType;
  FilterValue?: GraphQLScalarType;
  Filters?: GraphQLScalarType;
  GeoShapes?: GraphQLScalarType;
  HierarchyValue?: GraphQLScalarType;
  Observation?: GraphQLScalarType;
  PossibleFilterValue?: PossibleFilterValueResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RawObservation?: GraphQLScalarType;
  RelatedDimension?: RelatedDimensionResolvers<ContextType>;
  SearchCube?: GraphQLScalarType;
  SearchCubeResult?: SearchCubeResultResolvers<ContextType>;
  SingleFilters?: GraphQLScalarType;
  Termset?: GraphQLScalarType;
  ValueIdentifier?: GraphQLScalarType;
  ValuePosition?: GraphQLScalarType;
}>;

export type DirectiveResolvers<ContextType = VisualizeGraphQLContext> = ResolversObject<{
  safeUrl?: SafeUrlDirectiveResolver<any, any, ContextType>;
}>;
