import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Filters: any,
  Observation: any,
  RawObservation: any,
};

export type Attribute = {
   __typename: 'Attribute',
  iri: Scalars['String'],
  label: Scalars['String'],
};

export type DataCube = {
   __typename: 'DataCube',
  iri: Scalars['String'],
  title: Scalars['String'],
  contact?: Maybe<Scalars['String']>,
  source?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  observations: ObservationsQuery,
  dimensions: Array<Dimension>,
  measures: Array<Measure>,
};


export type DataCubeObservationsArgs = {
  limit?: Maybe<Scalars['Int']>,
  additionalComponents?: Maybe<Array<Scalars['String']>>,
  filters?: Maybe<Scalars['Filters']>
};

export type Dimension = {
  iri: Scalars['String'],
  label: Scalars['String'],
  values: Array<DimensionValue>,
};

export type DimensionValue = {
   __typename: 'DimensionValue',
  value: Scalars['String'],
  label: Scalars['String'],
};


export type Measure = {
   __typename: 'Measure',
  iri: Scalars['String'],
  label: Scalars['String'],
};

export type NominalDimension = Dimension & {
   __typename: 'NominalDimension',
  iri: Scalars['String'],
  label: Scalars['String'],
  values: Array<DimensionValue>,
};


export type ObservationsQuery = {
   __typename: 'ObservationsQuery',
  /** Observations with their values parsed to native JS types */
  data: Array<Scalars['Observation']>,
  /** Observations with their original RDF-y type */
  rawData: Array<Scalars['RawObservation']>,
  /** The generated SPARQL query string of the current query (doesn't fetch any data) */
  sparql: Scalars['String'],
};

export type OrdinalDimension = Dimension & {
   __typename: 'OrdinalDimension',
  iri: Scalars['String'],
  label: Scalars['String'],
  values: Array<DimensionValue>,
};

/** 
 * The "Query" type is special: it lists all of the available queries that
 * clients can execute, along with the return type for each.
 */
export type Query = {
   __typename: 'Query',
  dataCubeByIri?: Maybe<DataCube>,
  dataCubes: Array<DataCube>,
};


/** 
 * The "Query" type is special: it lists all of the available queries that
 * clients can execute, along with the return type for each.
 */
export type QueryDataCubeByIriArgs = {
  locale?: Maybe<Scalars['String']>,
  iri: Scalars['String']
};


/** 
 * The "Query" type is special: it lists all of the available queries that
 * clients can execute, along with the return type for each.
 */
export type QueryDataCubesArgs = {
  locale?: Maybe<Scalars['String']>
};


export type TemporalDimension = Dimension & {
   __typename: 'TemporalDimension',
  iri: Scalars['String'],
  label: Scalars['String'],
  values: Array<DimensionValue>,
};

export type DataCubesQueryVariables = {};


export type DataCubesQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCube', iri: string, title: string, contact: Maybe<string>, description: Maybe<string> }> };

export type DataCubesWithoutDescQueryVariables = {};


export type DataCubesWithoutDescQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCube', iri: string, title: string, contact: Maybe<string> }> };

export type ObservationFieldsFragment = { __typename: 'DataCube', observations: { __typename: 'ObservationsQuery', data: Array<any> } };

export type DataCubesWithObservationsQueryVariables = {};


export type DataCubesWithObservationsQuery = { __typename: 'Query', dataCubes: Array<(
    { __typename: 'DataCube', iri: string, title: string, contact: Maybe<string>, description: Maybe<string> }
    & ObservationFieldsFragment
  )> };

export const ObservationFieldsFragmentDoc = gql`
    fragment observationFields on DataCube {
  observations(limit: 10) {
    data
  }
}
    `;
export const DataCubesDocument = gql`
    query DataCubes {
  dataCubes {
    iri
    title
    contact
    description
  }
}
    `;

export function useDataCubesQuery(options: Omit<Urql.UseQueryArgs<DataCubesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubesQuery>({ query: DataCubesDocument, ...options });
};
export const DataCubesWithoutDescDocument = gql`
    query DataCubesWithoutDesc {
  dataCubes {
    iri
    title
    contact
  }
}
    `;

export function useDataCubesWithoutDescQuery(options: Omit<Urql.UseQueryArgs<DataCubesWithoutDescQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubesWithoutDescQuery>({ query: DataCubesWithoutDescDocument, ...options });
};
export const DataCubesWithObservationsDocument = gql`
    query DataCubesWithObservations {
  dataCubes {
    iri
    title
    contact
    description
    ...observationFields
  }
}
    ${ObservationFieldsFragmentDoc}`;

export function useDataCubesWithObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubesWithObservationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<DataCubesWithObservationsQuery>({ query: DataCubesWithObservationsDocument, ...options });
};