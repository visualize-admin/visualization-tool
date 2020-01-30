import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Attribute = Component & {
   __typename?: 'Attribute',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

/** A DataCube-ish component */
export type Component = {
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type DataCube = {
   __typename?: 'DataCube',
  iri: Scalars['String'],
  title: Scalars['String'],
  contact?: Maybe<Scalars['String']>,
  source?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  observations: Array<Observation>,
  dimensions: Array<Dimension>,
  measures: Array<Measure>,
};

export type Dimension = {
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type Measure = Component & {
   __typename?: 'Measure',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type NominalDimension = Component & Dimension & {
   __typename?: 'NominalDimension',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type Observation = {
   __typename?: 'Observation',
  iri: Scalars['String'],
};

export type OrdinalDimension = Component & Dimension & {
   __typename?: 'OrdinalDimension',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

/** 
 * The "Query" type is special: it lists all of the available queries that
 * clients can execute, along with the return type for each. In this
 * case, the "books" query returns an array of zero or more Books (defined above).
 */
export type Query = {
   __typename?: 'Query',
  dataCubeByIri?: Maybe<DataCube>,
  dataCubes: Array<DataCube>,
};


/** 
 * The "Query" type is special: it lists all of the available queries that
 * clients can execute, along with the return type for each. In this
 * case, the "books" query returns an array of zero or more Books (defined above).
 */
export type QueryDataCubeByIriArgs = {
  iri?: Maybe<Scalars['String']>
};

export type TemporalDimension = Component & Dimension & {
   __typename?: 'TemporalDimension',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

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
) => Maybe<TTypes>;

export type isTypeOfResolverFn = (obj: any, info: GraphQLResolveInfo) => boolean;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  String: ResolverTypeWrapper<Scalars['String']>,
  DataCube: ResolverTypeWrapper<DataCube>,
  Observation: ResolverTypeWrapper<Observation>,
  Dimension: ResolverTypeWrapper<Dimension>,
  Measure: ResolverTypeWrapper<Measure>,
  Component: ResolverTypeWrapper<Component>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  NominalDimension: ResolverTypeWrapper<NominalDimension>,
  OrdinalDimension: ResolverTypeWrapper<OrdinalDimension>,
  TemporalDimension: ResolverTypeWrapper<TemporalDimension>,
  Attribute: ResolverTypeWrapper<Attribute>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  String: Scalars['String'],
  DataCube: DataCube,
  Observation: Observation,
  Dimension: Dimension,
  Measure: Measure,
  Component: Component,
  Boolean: Scalars['Boolean'],
  NominalDimension: NominalDimension,
  OrdinalDimension: OrdinalDimension,
  TemporalDimension: TemporalDimension,
  Attribute: Attribute,
};

export type AttributeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Attribute'] = ResolversParentTypes['Attribute']> = {
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
};

export type ComponentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Component'] = ResolversParentTypes['Component']> = {
  __resolveType: TypeResolveFn<'Measure' | 'NominalDimension' | 'OrdinalDimension' | 'TemporalDimension' | 'Attribute', ParentType, ContextType>,
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type DataCubeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DataCube'] = ResolversParentTypes['DataCube']> = {
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  contact?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  observations?: Resolver<Array<ResolversTypes['Observation']>, ParentType, ContextType>,
  dimensions?: Resolver<Array<ResolversTypes['Dimension']>, ParentType, ContextType>,
  measures?: Resolver<Array<ResolversTypes['Measure']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
};

export type DimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Dimension'] = ResolversParentTypes['Dimension']> = {
  __resolveType: TypeResolveFn<'NominalDimension' | 'OrdinalDimension' | 'TemporalDimension', ParentType, ContextType>,
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type MeasureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Measure'] = ResolversParentTypes['Measure']> = {
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
};

export type NominalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['NominalDimension'] = ResolversParentTypes['NominalDimension']> = {
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
};

export type ObservationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Observation'] = ResolversParentTypes['Observation']> = {
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
};

export type OrdinalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrdinalDimension'] = ResolversParentTypes['OrdinalDimension']> = {
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  dataCubeByIri?: Resolver<Maybe<ResolversTypes['DataCube']>, ParentType, ContextType, QueryDataCubeByIriArgs>,
  dataCubes?: Resolver<Array<ResolversTypes['DataCube']>, ParentType, ContextType>,
};

export type TemporalDimensionResolvers<ContextType = any, ParentType extends ResolversParentTypes['TemporalDimension'] = ResolversParentTypes['TemporalDimension']> = {
  iri?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn,
};

export type Resolvers<ContextType = any> = {
  Attribute?: AttributeResolvers<ContextType>,
  Component?: ComponentResolvers,
  DataCube?: DataCubeResolvers<ContextType>,
  Dimension?: DimensionResolvers,
  Measure?: MeasureResolvers<ContextType>,
  NominalDimension?: NominalDimensionResolvers<ContextType>,
  Observation?: ObservationResolvers<ContextType>,
  OrdinalDimension?: OrdinalDimensionResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  TemporalDimension?: TemporalDimensionResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
