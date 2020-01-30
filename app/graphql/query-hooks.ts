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
};

export type Attribute = Component & {
   __typename: 'Attribute',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

/** A DataCube-ish component */
export type Component = {
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type DataCube = {
   __typename: 'DataCube',
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
   __typename: 'Measure',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type NominalDimension = Component & Dimension & {
   __typename: 'NominalDimension',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type Observation = {
   __typename: 'Observation',
  iri: Scalars['String'],
};

export type OrdinalDimension = Component & Dimension & {
   __typename: 'OrdinalDimension',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

/** 
 * The "Query" type is special: it lists all of the available queries that
 * clients can execute, along with the return type for each. In this
 * case, the "books" query returns an array of zero or more Books (defined above).
 */
export type Query = {
   __typename: 'Query',
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
   __typename: 'TemporalDimension',
  iri: Scalars['String'],
  label?: Maybe<Scalars['String']>,
};

export type DataCubesQueryVariables = {};


export type DataCubesQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCube', iri: string, title: string, contact: Maybe<string>, description: Maybe<string> }> };

export type DataCubesWithoutDescQueryVariables = {};


export type DataCubesWithoutDescQuery = { __typename: 'Query', dataCubes: Array<{ __typename: 'DataCube', iri: string, title: string, contact: Maybe<string> }> };


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