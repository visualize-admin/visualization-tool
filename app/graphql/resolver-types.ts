import { Filters } from '../domain/config-types';
import { Observation } from '../domain/data';
import { RawObservation } from '../domain/data';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolvedDataCube, ResolvedObservationsQuery, ResolvedMeasure, ResolvedDimension } from './shared-types';
export type Maybe<T> = T | null;
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

export type Attribute = Component & {
   __typename?: 'Attribute';
  iri: Scalars['String'];
  label: Scalars['String'];
};

export type Component = {
  iri: Scalars['String'];
  label: Scalars['String'];
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

export type Dimension = {
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
};

export type DimensionValue = {
   __typename?: 'DimensionValue';
  value: Scalars['String'];
  label: Scalars['String'];
};


export type Measure = Component & {
   __typename?: 'Measure';
  iri: Scalars['String'];
  label: Scalars['String'];
};

export type NominalDimension = Component & Dimension & {
   __typename?: 'NominalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
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

export type OrdinalDimension = Component & Dimension & {
   __typename?: 'OrdinalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
};

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


export type TemporalDimension = Component & Dimension & {
   __typename?: 'TemporalDimension';
  iri: Scalars['String'];
  label: Scalars['String'];
  values: Array<DimensionValue>;
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

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  Query: ResolverTypeWrapper<{}>,
  String: ResolverTypeWrapper<Scalars['String']>,
  DataCube: ResolverTypeWrapper<ResolvedDataCube>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  Filters: ResolverTypeWrapper<Scalars['Filters']>,
  ObservationsQuery: ResolverTypeWrapper<ResolvedObservationsQuery>,
  Observation: ResolverTypeWrapper<Scalars['Observation']>,
  RawObservation: ResolverTypeWrapper<Scalars['RawObservation']>,
  Dimension: ResolversTypes['NominalDimension'] | ResolversTypes['OrdinalDimension'] | ResolversTypes['TemporalDimension'],
  DimensionValue: ResolverTypeWrapper<DimensionValue>,
  Measure: ResolverTypeWrapper<ResolvedMeasure>,
  Component: ResolversTypes['Measure'] | ResolversTypes['NominalDimension'] | ResolversTypes['OrdinalDimension'] | ResolversTypes['TemporalDimension'] | ResolversTypes['Attribute'],
  DataCubeResultOrder: DataCubeResultOrder,
  DataCubeResult: ResolverTypeWrapper<Omit<DataCubeResult, 'dataCube'> & { dataCube: ResolversTypes['DataCube'] }>,
  Float: ResolverTypeWrapper<Scalars['Float']>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  NominalDimension: ResolverTypeWrapper<ResolvedDimension>,
  OrdinalDimension: ResolverTypeWrapper<ResolvedDimension>,
  TemporalDimension: ResolverTypeWrapper<ResolvedDimension>,
  Attribute: ResolverTypeWrapper<Attribute>,
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {},
  String: Scalars['String'],
  DataCube: ResolvedDataCube,
  Int: Scalars['Int'],
  Filters: Scalars['Filters'],
  ObservationsQuery: ResolvedObservationsQuery,
  Observation: Scalars['Observation'],
  RawObservation: Scalars['RawObservation'],
  Dimension: ResolversParentTypes['NominalDimension'] | ResolversParentTypes['OrdinalDimension'] | ResolversParentTypes['TemporalDimension'],
  DimensionValue: DimensionValue,
  Measure: ResolvedMeasure,
  Component: ResolversParentTypes['Measure'] | ResolversParentTypes['NominalDimension'] | ResolversParentTypes['OrdinalDimension'] | ResolversParentTypes['TemporalDimension'] | ResolversParentTypes['Attribute'],
  DataCubeResultOrder: DataCubeResultOrder,
  DataCubeResult: Omit<DataCubeResult, 'dataCube'> & { dataCube: ResolversParentTypes['DataCube'] },
  Float: Scalars['Float'],
  Boolean: Scalars['Boolean'],
  NominalDimension: ResolvedDimension,
  OrdinalDimension: ResolvedDimension,
  TemporalDimension: ResolvedDimension,
  Attribute: Attribute,
}>;

export type AttributeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Attribute'] = ResolversParentTypes['Attribute']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type ComponentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Component'] = ResolversParentTypes['Component']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Measure' | 'NominalDimension' | 'OrdinalDimension' | 'TemporalDimension' | 'Attribute', ParentType, ContextType>,
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
}>;

export type DataCubeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCube'] = ResolversParentTypes['DataCube']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  contact?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  dateCreated?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  observations?: Resolver<ResolversTypes['ObservationsQuery'], ParentType, ContextType, RequireFields<DataCubeObservationsArgs, never>>,
  dimensions?: Resolver<Array<ResolversTypes['Dimension']>, ParentType, ContextType>,
  dimensionByIri?: Resolver<Maybe<ResolversTypes['Dimension']>, ParentType, ContextType, RequireFields<DataCubeDimensionByIriArgs, 'iri'>>,
  measures?: Resolver<Array<ResolversTypes['Measure']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type DataCubeResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCubeResult'] = ResolversParentTypes['DataCubeResult']> = ResolversObject<{
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>,
  highlightedTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  highlightedDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  dataCube?: Resolver<ResolversTypes['DataCube'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type DimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Dimension'] = ResolversParentTypes['Dimension']> = ResolversObject<{
  __resolveType: TypeResolveFn<'NominalDimension' | 'OrdinalDimension' | 'TemporalDimension', ParentType, ContextType>,
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>,
}>;

export type DimensionValueResolvers<ContextType = any, ParentType extends ResolversParentTypes['DimensionValue'] = ResolversParentTypes['DimensionValue']> = ResolversObject<{
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export interface FiltersScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Filters'], any> {
  name: 'Filters'
}

export type MeasureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Measure'] = ResolversParentTypes['Measure']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type NominalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['NominalDimension'] = ResolversParentTypes['NominalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export interface ObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Observation'], any> {
  name: 'Observation'
}

export type ObservationsQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ObservationsQuery'] = ResolversParentTypes['ObservationsQuery']> = ResolversObject<{
  data?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType>,
  rawData?: Resolver<Array<ResolversTypes['RawObservation']>, ParentType, ContextType>,
  sparql?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type OrdinalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrdinalDimension'] = ResolversParentTypes['OrdinalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  dataCubeByIri?: Resolver<Maybe<ResolversTypes['DataCube']>, ParentType, ContextType, RequireFields<QueryDataCubeByIriArgs, 'iri'>>,
  dataCubes?: Resolver<Array<ResolversTypes['DataCubeResult']>, ParentType, ContextType, RequireFields<QueryDataCubesArgs, never>>,
}>;

export interface RawObservationScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['RawObservation'], any> {
  name: 'RawObservation'
}

export type TemporalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['TemporalDimension'] = ResolversParentTypes['TemporalDimension']> = ResolversObject<{
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  values?: Resolver<Array<ResolversTypes['DimensionValue']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Attribute?: AttributeResolvers<ContextType>,
  Component?: ComponentResolvers,
  DataCube?: DataCubeResolvers<ContextType>,
  DataCubeResult?: DataCubeResultResolvers<ContextType>,
  Dimension?: DimensionResolvers,
  DimensionValue?: DimensionValueResolvers<ContextType>,
  Filters?: GraphQLScalarType,
  Measure?: MeasureResolvers<ContextType>,
  NominalDimension?: NominalDimensionResolvers<ContextType>,
  Observation?: GraphQLScalarType,
  ObservationsQuery?: ObservationsQueryResolvers<ContextType>,
  OrdinalDimension?: OrdinalDimensionResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  RawObservation?: GraphQLScalarType,
  TemporalDimension?: TemporalDimensionResolvers<ContextType>,
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
