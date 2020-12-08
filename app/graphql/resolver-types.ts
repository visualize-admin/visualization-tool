import { Observation } from '../domain/data';
import { RawObservation } from '../domain/data';
import { Filters } from '../configurator';
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
  Observation: Observation;
  RawObservation: RawObservation;
  Filters: Filters;
};




export type ObservationsQuery = {
  __typename?: 'ObservationsQuery';
  /** Observations with their values parsed to native JS types */
  data: Array<Scalars['Observation']>;
  /** Observations with their original RDF-y type */
  rawData: Array<Scalars['RawObservation']>;
  /** The generated SPARQL query string of the current query (doesn't fetch any data) */
  sparql: Scalars['String'];
};

export type DataCube = {
  __typename?: 'DataCube';
  iri: Scalars['String'];
  title: Scalars['String'];
  contact?: Maybe<Scalars['String']>;
  source?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  dateCreated?: Maybe<Scalars['String']>;
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
  __typename?: 'DimensionValue';
  value: Scalars['String'];
  label: Scalars['String'];
};

export type Component = {
  iri: Scalars['String'];
  label: Scalars['String'];
};

export type Dimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
};

export type NominalDimension = Component & Dimension & {
  __typename?: 'NominalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
};

export type OrdinalDimension = Component & Dimension & {
  __typename?: 'OrdinalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
};

export type TemporalDimension = Component & Dimension & {
  __typename?: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
};

export type Measure = Component & {
  __typename?: 'Measure';
  iri: Scalars['String'];
  label: Scalars['String'];
};

export type Attribute = Component & {
  __typename?: 'Attribute';
  iri: Scalars['String'];
  label: Scalars['String'];
};

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

export type Query = {
  __typename?: 'Query';
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
};

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
  Observation: ResolverTypeWrapper<Scalars['Observation']>;
  RawObservation: ResolverTypeWrapper<Scalars['RawObservation']>;
  Filters: ResolverTypeWrapper<Scalars['Filters']>;
  ObservationsQuery: ResolverTypeWrapper<ResolvedObservationsQuery>;
  String: ResolverTypeWrapper<Scalars['String']>;
  DataCube: ResolverTypeWrapper<ResolvedDataCube>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  DimensionValue: ResolverTypeWrapper<DimensionValue>;
  Component: ResolversTypes['NominalDimension'] | ResolversTypes['OrdinalDimension'] | ResolversTypes['TemporalDimension'] | ResolversTypes['Measure'] | ResolversTypes['Attribute'];
  Dimension: ResolverTypeWrapper<ResolvedDimension>;
  NominalDimension: ResolverTypeWrapper<ResolvedDimension>;
  OrdinalDimension: ResolverTypeWrapper<ResolvedDimension>;
  TemporalDimension: ResolverTypeWrapper<ResolvedDimension>;
  Measure: ResolverTypeWrapper<ResolvedMeasure>;
  Attribute: ResolverTypeWrapper<Attribute>;
  DataCubeResult: ResolverTypeWrapper<Omit<DataCubeResult, 'dataCube'> & { dataCube: ResolversTypes['DataCube'] }>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  DataCubeResultOrder: DataCubeResultOrder;
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Observation: Scalars['Observation'];
  RawObservation: Scalars['RawObservation'];
  Filters: Scalars['Filters'];
  ObservationsQuery: ResolvedObservationsQuery;
  String: Scalars['String'];
  DataCube: ResolvedDataCube;
  Int: Scalars['Int'];
  DimensionValue: DimensionValue;
  Component: ResolversParentTypes['NominalDimension'] | ResolversParentTypes['OrdinalDimension'] | ResolversParentTypes['TemporalDimension'] | ResolversParentTypes['Measure'] | ResolversParentTypes['Attribute'];
  Dimension: ResolvedDimension;
  NominalDimension: ResolvedDimension;
  OrdinalDimension: ResolvedDimension;
  TemporalDimension: ResolvedDimension;
  Measure: ResolvedMeasure;
  Attribute: Attribute;
  DataCubeResult: Omit<DataCubeResult, 'dataCube'> & { dataCube: ResolversParentTypes['DataCube'] };
  Float: Scalars['Float'];
  Query: {};
  Boolean: Scalars['Boolean'];
}>;

export interface ObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Observation'], any> {
  name: 'Observation';
}

export interface RawObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RawObservation'], any> {
  name: 'RawObservation';
}

export interface FiltersScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Filters'], any> {
  name: 'Filters';
}

export type ObservationsQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ObservationsQuery'] = ResolversParentTypes['ObservationsQuery']> = ResolversObject<{
  data?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType>;
  rawData?: Resolver<Array<ResolversTypes['RawObservation']>, ParentType, ContextType>;
  sparql?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DataCubeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCube'] = ResolversParentTypes['DataCube']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateCreated?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  observations?: Resolver<ResolversTypes['ObservationsQuery'], ParentType, ContextType, RequireFields<DataCubeObservationsArgs, never>>;
  dimensions?: Resolver<Array<ResolversTypes['Dimension']>, ParentType, ContextType>;
  dimensionByIri?: Resolver<Maybe<ResolversTypes['Dimension']>, ParentType, ContextType, RequireFields<DataCubeDimensionByIriArgs, 'iri'>>;
  measures?: Resolver<Array<ResolversTypes['Measure']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DimensionValueResolvers<ContextType = any, ParentType extends ResolversParentTypes['DimensionValue'] = ResolversParentTypes['DimensionValue']> = ResolversObject<{
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ComponentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Component'] = ResolversParentTypes['Component']> = ResolversObject<{
  __resolveType: TypeResolveFn<'NominalDimension' | 'OrdinalDimension' | 'TemporalDimension' | 'Measure' | 'Attribute', ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Dimension'] = ResolversParentTypes['Dimension']> = ResolversObject<{
  __resolveType: TypeResolveFn<'NominalDimension' | 'OrdinalDimension' | 'TemporalDimension', ParentType, ContextType>;
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>;
}>;

export type NominalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['NominalDimension'] = ResolversParentTypes['NominalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OrdinalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrdinalDimension'] = ResolversParentTypes['OrdinalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TemporalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['TemporalDimension'] = ResolversParentTypes['TemporalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MeasureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Measure'] = ResolversParentTypes['Measure']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AttributeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Attribute'] = ResolversParentTypes['Attribute']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DataCubeResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCubeResult'] = ResolversParentTypes['DataCubeResult']> = ResolversObject<{
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  highlightedTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highlightedDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataCube?: Resolver<ResolversTypes['DataCube'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dataCubeByIri?: Resolver<Maybe<ResolversTypes['DataCube']>, ParentType, ContextType, RequireFields<QueryDataCubeByIriArgs, 'iri'>>;
  dataCubes?: Resolver<Array<ResolversTypes['DataCubeResult']>, ParentType, ContextType, RequireFields<QueryDataCubesArgs, never>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Observation?: GraphQLScalarType;
  RawObservation?: GraphQLScalarType;
  Filters?: GraphQLScalarType;
  ObservationsQuery?: ObservationsQueryResolvers<ContextType>;
  DataCube?: DataCubeResolvers<ContextType>;
  DimensionValue?: DimensionValueResolvers<ContextType>;
  Component?: ComponentResolvers<ContextType>;
  Dimension?: DimensionResolvers<ContextType>;
  NominalDimension?: NominalDimensionResolvers<ContextType>;
  OrdinalDimension?: OrdinalDimensionResolvers<ContextType>;
  TemporalDimension?: TemporalDimensionResolvers<ContextType>;
  Measure?: MeasureResolvers<ContextType>;
  Attribute?: AttributeResolvers<ContextType>;
  DataCubeResult?: DataCubeResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
