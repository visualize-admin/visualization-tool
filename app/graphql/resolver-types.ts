import { Filters } from '../configurator';
import { Observation } from '../domain/data';
import { RawObservation } from '../domain/data';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolvedDataCube, ResolvedObservationsQuery, ResolvedMeasure, ResolvedDimension } from './shared-types';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Filters: Filters;
  Observation: Observation;
  RawObservation: RawObservation;
};

export type CategoricalDimension = IDimension & ICategoricalDimension & {
  __typename?: 'CategoricalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension?: Maybe<Scalars['Boolean']>;
  hasOrder?: Maybe<Scalars['Boolean']>;
  values: Array<CategoricalValue>;
};

export type CategoricalValue = {
  __typename?: 'CategoricalValue';
  value: Scalars['String'];
  label: Scalars['String'];
  position?: Maybe<Scalars['Int']>;
};

export type DataCube = {
  __typename?: 'DataCube';
  iri: Scalars['String'];
  title: Scalars['String'];
  version?: Maybe<Scalars['String']>;
  contactName?: Maybe<Scalars['String']>;
  contactEmail?: Maybe<Scalars['String']>;
  creator?: Maybe<DataCubeOrganization>;
  landingPage?: Maybe<Scalars['String']>;
  publisher?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  datePublished?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['String']>;
  publicationStatus: DataCubePublicationStatus;
  observations: ObservationsQuery;
  dimensions: Array<IDimension>;
  dimensionByIri?: Maybe<IDimension>;
  measures: Array<Measure>;
  themes: Array<DataCubeTheme>;
};


export type DataCubeObservationsArgs = {
  limit?: Maybe<Scalars['Int']>;
  measures?: Maybe<Array<Scalars['String']>>;
  filters?: Maybe<Scalars['Filters']>;
};


export type DataCubeDimensionByIriArgs = {
  iri: Scalars['String'];
};

export type DataCubeOrganization = {
  __typename?: 'DataCubeOrganization';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};

export enum DataCubePublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type DataCubeResult = {
  __typename?: 'DataCubeResult';
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
  __typename?: 'DataCubeTheme';
  iri: Scalars['String'];
  label?: Maybe<Scalars['String']>;
};

export type DatasetCount = {
  __typename?: 'DatasetCount';
  iri: Scalars['String'];
  count: Scalars['Int'];
};


export type GeoPointDimension = IDimension & ICategoricalDimension & {
  __typename?: 'GeoPointDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension?: Maybe<Scalars['Boolean']>;
  hasOrder?: Maybe<Scalars['Boolean']>;
  values: Array<CategoricalValue>;
};

export type GeoShapeDimension = IDimension & ICategoricalDimension & {
  __typename?: 'GeoShapeDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension?: Maybe<Scalars['Boolean']>;
  hasOrder?: Maybe<Scalars['Boolean']>;
  values: Array<CategoricalValue>;
};

export type ICategoricalDimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension?: Maybe<Scalars['Boolean']>;
  hasOrder?: Maybe<Scalars['Boolean']>;
  values: Array<CategoricalValue>;
};

export type IDimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  isKeyDimension?: Maybe<Scalars['Boolean']>;
};

export type Measure = IDimension & {
  __typename?: 'Measure';
  iri: Scalars['String'];
  label: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  isKeyDimension?: Maybe<Scalars['Boolean']>;
  min: Scalars['Float'];
  max: Scalars['Float'];
};


export type ObservationsQuery = {
  __typename?: 'ObservationsQuery';
  /** Observations with their values parsed to native JS types */
  data: Array<Scalars['Observation']>;
  /** Observations with their original RDF-y type */
  rawData: Array<Scalars['RawObservation']>;
  /** The generated SPARQL query string of the current query (doesn't fetch any data) */
  sparql: Scalars['String'];
  /** The generated SPARQL query URL of the current query to run a query on the endpoint's editor directly */
  sparqlEditorUrl?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  dataCubeByIri?: Maybe<DataCube>;
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
};


export type TemporalDimension = IDimension & {
  __typename?: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  timeUnit: TimeUnit;
  timeFormat: Scalars['String'];
  isKeyDimension?: Maybe<Scalars['Boolean']>;
  from: Scalars['String'];
  to: Scalars['String'];
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
  CategoricalDimension: ResolverTypeWrapper<ResolvedDimension>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CategoricalValue: ResolverTypeWrapper<CategoricalValue>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  DataCube: ResolverTypeWrapper<ResolvedDataCube>;
  DataCubeOrganization: ResolverTypeWrapper<DataCubeOrganization>;
  DataCubePublicationStatus: DataCubePublicationStatus;
  DataCubeResult: ResolverTypeWrapper<Omit<DataCubeResult, 'dataCube'> & { dataCube: ResolversTypes['DataCube'] }>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  DataCubeResultOrder: DataCubeResultOrder;
  DataCubeSearchFilter: DataCubeSearchFilter;
  DataCubeTheme: ResolverTypeWrapper<DataCubeTheme>;
  DatasetCount: ResolverTypeWrapper<DatasetCount>;
  Filters: ResolverTypeWrapper<Scalars['Filters']>;
  GeoPointDimension: ResolverTypeWrapper<GeoPointDimension>;
  GeoShapeDimension: ResolverTypeWrapper<GeoShapeDimension>;
  ICategoricalDimension: ResolversTypes['CategoricalDimension'] | ResolversTypes['GeoPointDimension'] | ResolversTypes['GeoShapeDimension'];
  IDimension: ResolversTypes['CategoricalDimension'] | ResolversTypes['GeoPointDimension'] | ResolversTypes['GeoShapeDimension'] | ResolversTypes['Measure'] | ResolversTypes['TemporalDimension'];
  Measure: ResolverTypeWrapper<ResolvedMeasure>;
  Observation: ResolverTypeWrapper<Scalars['Observation']>;
  ObservationsQuery: ResolverTypeWrapper<ResolvedObservationsQuery>;
  Query: ResolverTypeWrapper<{}>;
  RawObservation: ResolverTypeWrapper<Scalars['RawObservation']>;
  TemporalDimension: ResolverTypeWrapper<ResolvedDimension>;
  TimeUnit: TimeUnit;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  CategoricalDimension: ResolvedDimension;
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  CategoricalValue: CategoricalValue;
  Int: Scalars['Int'];
  DataCube: ResolvedDataCube;
  DataCubeOrganization: DataCubeOrganization;
  DataCubeResult: Omit<DataCubeResult, 'dataCube'> & { dataCube: ResolversParentTypes['DataCube'] };
  Float: Scalars['Float'];
  DataCubeSearchFilter: DataCubeSearchFilter;
  DataCubeTheme: DataCubeTheme;
  DatasetCount: DatasetCount;
  Filters: Scalars['Filters'];
  GeoPointDimension: GeoPointDimension;
  GeoShapeDimension: GeoShapeDimension;
  ICategoricalDimension: ResolversParentTypes['CategoricalDimension'] | ResolversParentTypes['GeoPointDimension'] | ResolversParentTypes['GeoShapeDimension'];
  IDimension: ResolversParentTypes['CategoricalDimension'] | ResolversParentTypes['GeoPointDimension'] | ResolversParentTypes['GeoShapeDimension'] | ResolversParentTypes['Measure'] | ResolversParentTypes['TemporalDimension'];
  Measure: ResolvedMeasure;
  Observation: Scalars['Observation'];
  ObservationsQuery: ResolvedObservationsQuery;
  Query: {};
  RawObservation: Scalars['RawObservation'];
  TemporalDimension: ResolvedDimension;
}>;

export type CategoricalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['CategoricalDimension'] = ResolversParentTypes['CategoricalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isKeyDimension?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasOrder?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['CategoricalValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CategoricalValueResolvers<ContextType = any, ParentType extends ResolversParentTypes['CategoricalValue'] = ResolversParentTypes['CategoricalValue']> = ResolversObject<{
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DataCubeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCube'] = ResolversParentTypes['DataCube']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  creator?: Resolver<Maybe<ResolversTypes['DataCubeOrganization']>, ParentType, ContextType>;
  landingPage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publisher?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  datePublished?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expires?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publicationStatus?: Resolver<ResolversTypes['DataCubePublicationStatus'], ParentType, ContextType>;
  observations?: Resolver<ResolversTypes['ObservationsQuery'], ParentType, ContextType, RequireFields<DataCubeObservationsArgs, never>>;
  dimensions?: Resolver<Array<ResolversTypes['IDimension']>, ParentType, ContextType>;
  dimensionByIri?: Resolver<Maybe<ResolversTypes['IDimension']>, ParentType, ContextType, RequireFields<DataCubeDimensionByIriArgs, 'iri'>>;
  measures?: Resolver<Array<ResolversTypes['Measure']>, ParentType, ContextType>;
  themes?: Resolver<Array<ResolversTypes['DataCubeTheme']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DataCubeOrganizationResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCubeOrganization'] = ResolversParentTypes['DataCubeOrganization']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DataCubeResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCubeResult'] = ResolversParentTypes['DataCubeResult']> = ResolversObject<{
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  highlightedTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highlightedDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataCube?: Resolver<ResolversTypes['DataCube'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DataCubeThemeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCubeTheme'] = ResolversParentTypes['DataCubeTheme']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DatasetCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['DatasetCount'] = ResolversParentTypes['DatasetCount']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface FiltersScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Filters'], any> {
  name: 'Filters';
}

export type GeoPointDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['GeoPointDimension'] = ResolversParentTypes['GeoPointDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isKeyDimension?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasOrder?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['CategoricalValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GeoShapeDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['GeoShapeDimension'] = ResolversParentTypes['GeoShapeDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isKeyDimension?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasOrder?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['CategoricalValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ICategoricalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['ICategoricalDimension'] = ResolversParentTypes['ICategoricalDimension']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CategoricalDimension' | 'GeoPointDimension' | 'GeoShapeDimension', ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isKeyDimension?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasOrder?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['CategoricalValue']>, ParentType, ContextType>;
}>;

export type IDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['IDimension'] = ResolversParentTypes['IDimension']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CategoricalDimension' | 'GeoPointDimension' | 'GeoShapeDimension' | 'Measure' | 'TemporalDimension', ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isKeyDimension?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
}>;

export type MeasureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Measure'] = ResolversParentTypes['Measure']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isKeyDimension?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  min?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  max?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface ObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Observation'], any> {
  name: 'Observation';
}

export type ObservationsQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ObservationsQuery'] = ResolversParentTypes['ObservationsQuery']> = ResolversObject<{
  data?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType>;
  rawData?: Resolver<Array<ResolversTypes['RawObservation']>, ParentType, ContextType>;
  sparql?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sparqlEditorUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dataCubeByIri?: Resolver<Maybe<ResolversTypes['DataCube']>, ParentType, ContextType, RequireFields<QueryDataCubeByIriArgs, 'iri' | 'latest'>>;
  dataCubes?: Resolver<Array<ResolversTypes['DataCubeResult']>, ParentType, ContextType, RequireFields<QueryDataCubesArgs, never>>;
  themes?: Resolver<Array<ResolversTypes['DataCubeTheme']>, ParentType, ContextType, RequireFields<QueryThemesArgs, 'locale'>>;
  subthemes?: Resolver<Array<ResolversTypes['DataCubeTheme']>, ParentType, ContextType, RequireFields<QuerySubthemesArgs, 'locale' | 'parentIri'>>;
  organizations?: Resolver<Array<ResolversTypes['DataCubeOrganization']>, ParentType, ContextType, RequireFields<QueryOrganizationsArgs, 'locale'>>;
  datasetcount?: Resolver<Maybe<Array<ResolversTypes['DatasetCount']>>, ParentType, ContextType, RequireFields<QueryDatasetcountArgs, never>>;
}>;

export interface RawObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RawObservation'], any> {
  name: 'RawObservation';
}

export type TemporalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['TemporalDimension'] = ResolversParentTypes['TemporalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timeUnit?: Resolver<ResolversTypes['TimeUnit'], ParentType, ContextType>;
  timeFormat?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isKeyDimension?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  CategoricalDimension?: CategoricalDimensionResolvers<ContextType>;
  CategoricalValue?: CategoricalValueResolvers<ContextType>;
  DataCube?: DataCubeResolvers<ContextType>;
  DataCubeOrganization?: DataCubeOrganizationResolvers<ContextType>;
  DataCubeResult?: DataCubeResultResolvers<ContextType>;
  DataCubeTheme?: DataCubeThemeResolvers<ContextType>;
  DatasetCount?: DatasetCountResolvers<ContextType>;
  Filters?: GraphQLScalarType;
  GeoPointDimension?: GeoPointDimensionResolvers<ContextType>;
  GeoShapeDimension?: GeoShapeDimensionResolvers<ContextType>;
  ICategoricalDimension?: ICategoricalDimensionResolvers<ContextType>;
  IDimension?: IDimensionResolvers<ContextType>;
  Measure?: MeasureResolvers<ContextType>;
  Observation?: GraphQLScalarType;
  ObservationsQuery?: ObservationsQueryResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RawObservation?: GraphQLScalarType;
  TemporalDimension?: TemporalDimensionResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
