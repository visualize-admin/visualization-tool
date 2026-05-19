/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { ComponentTermsets, DataCubeComponents, DataCubeMetadata, DataCubeObservations, DataCubePreview, GeoShapes, SearchCube } from '../domain/data';
import { DataSourceUrl } from '../domain/data-source';
import { Filters, SingleFilters } from '../configurator';
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type DataCubeComponentFilter = {
  componentIds?: Array<string> | null | undefined;
  filters?: Filters | null | undefined;
  iri: string;
  joinBy?: Array<string> | null | undefined;
  loadValues?: boolean | null | undefined;
};

export type DataCubeDimensionGeoShapesCubeFilter = {
  dimensionId: string;
  iri: string;
};

export type DataCubeLatestIriFilter = {
  iri: string;
};

export type DataCubeMetadataFilter = {
  iri: string;
};

export type DataCubeObservationFilter = {
  componentIds?: Array<string> | null | undefined;
  filters?: Filters | null | undefined;
  iri: string;
  joinBy?: Array<string> | null | undefined;
};

export type DataCubePossibleFiltersCubeFilter = {
  filters: SingleFilters;
  iri: string;
};

export type DataCubePreviewFilter = {
  iri: string;
};

export type DataCubeTermsetFilter = {
  iri: string;
};

export type DataCubeUnversionedIriFilter = {
  iri: string;
};

export type SearchCubeFilter = {
  label?: string | null | undefined;
  type: SearchCubeFilterType;
  value: string;
};

export type SearchCubeFilterType =
  | 'DataCubeAbout'
  | 'DataCubeOrganization'
  | 'DataCubeTermset'
  | 'DataCubeTheme'
  | 'TemporalDimension';

export type SearchCubeResultOrder =
  | 'CREATED_DESC'
  | 'SCORE'
  | 'TITLE_ASC';

export type SearchCubesQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  locale: string;
  query?: string | null | undefined;
  order?: SearchCubeResultOrder | null | undefined;
  includeDrafts?: boolean | null | undefined;
  fetchDimensionTermsets?: boolean | null | undefined;
  filters?: Array<SearchCubeFilter> | SearchCubeFilter | null | undefined;
}>;


export type SearchCubesQuery = { __typename: 'Query', searchCubes: Array<{ __typename: 'SearchCubeResult', highlightedTitle: string | null, highlightedDescription: string | null, cube: SearchCube }> };

export type DataCubeLatestIriQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  cubeFilter: DataCubeLatestIriFilter;
}>;


export type DataCubeLatestIriQuery = { __typename: 'Query', dataCubeLatestIri: string };

export type DataCubeUnversionedIriQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  cubeFilter: DataCubeUnversionedIriFilter;
}>;


export type DataCubeUnversionedIriQuery = { __typename: 'Query', dataCubeUnversionedIri: string | null };

export type DataCubeComponentsQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  locale: string;
  cubeFilter: DataCubeComponentFilter;
}>;


export type DataCubeComponentsQuery = { __typename: 'Query', dataCubeComponents: DataCubeComponents };

export type DataCubeDimensionGeoShapesQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  locale: string;
  cubeFilter: DataCubeDimensionGeoShapesCubeFilter;
}>;


export type DataCubeDimensionGeoShapesQuery = { __typename: 'Query', dataCubeDimensionGeoShapes: GeoShapes | null };

export type DataCubeMetadataQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  locale: string;
  cubeFilter: DataCubeMetadataFilter;
}>;


export type DataCubeMetadataQuery = { __typename: 'Query', dataCubeMetadata: DataCubeMetadata };

export type DataCubeComponentTermsetsQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  locale: string;
  cubeFilter: DataCubeTermsetFilter;
}>;


export type DataCubeComponentTermsetsQuery = { __typename: 'Query', dataCubeComponentTermsets: Array<ComponentTermsets> };

export type DataCubeObservationsQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  locale: string;
  cubeFilter: DataCubeObservationFilter;
}>;


export type DataCubeObservationsQuery = { __typename: 'Query', dataCubeObservations: DataCubeObservations };

export type DataCubePreviewQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  locale: string;
  cubeFilter: DataCubePreviewFilter;
}>;


export type DataCubePreviewQuery = { __typename: 'Query', dataCubePreview: DataCubePreview };

export type PossibleFiltersQueryVariables = Exact<{
  sourceType: string;
  sourceUrl: DataSourceUrl;
  cubeFilter: DataCubePossibleFiltersCubeFilter;
}>;


export type PossibleFiltersQuery = { __typename: 'Query', possibleFilters: Array<{ __typename: 'PossibleFilterValue', type: string, id: string, value: unknown }> };


export const SearchCubesDocument = gql`
    query SearchCubes($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $query: String, $order: SearchCubeResultOrder, $includeDrafts: Boolean, $fetchDimensionTermsets: Boolean, $filters: [SearchCubeFilter!]) {
  searchCubes(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    query: $query
    order: $order
    includeDrafts: $includeDrafts
    fetchDimensionTermsets: $fetchDimensionTermsets
    filters: $filters
  ) {
    highlightedTitle
    highlightedDescription
    cube
  }
}
    `;

export function useSearchCubesQuery(options: Omit<Urql.UseQueryArgs<SearchCubesQueryVariables>, 'query'>) {
  return Urql.useQuery<SearchCubesQuery, SearchCubesQueryVariables>({ query: SearchCubesDocument, ...options });
};
export const DataCubeLatestIriDocument = gql`
    query DataCubeLatestIri($sourceType: String!, $sourceUrl: DataSourceUrl!, $cubeFilter: DataCubeLatestIriFilter!) {
  dataCubeLatestIri(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeLatestIriQuery(options: Omit<Urql.UseQueryArgs<DataCubeLatestIriQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubeLatestIriQuery, DataCubeLatestIriQueryVariables>({ query: DataCubeLatestIriDocument, ...options });
};
export const DataCubeUnversionedIriDocument = gql`
    query DataCubeUnversionedIri($sourceType: String!, $sourceUrl: DataSourceUrl!, $cubeFilter: DataCubeUnversionedIriFilter!) {
  dataCubeUnversionedIri(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeUnversionedIriQuery(options: Omit<Urql.UseQueryArgs<DataCubeUnversionedIriQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubeUnversionedIriQuery, DataCubeUnversionedIriQueryVariables>({ query: DataCubeUnversionedIriDocument, ...options });
};
export const DataCubeComponentsDocument = gql`
    query DataCubeComponents($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $cubeFilter: DataCubeComponentFilter!) {
  dataCubeComponents(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeComponentsQuery(options: Omit<Urql.UseQueryArgs<DataCubeComponentsQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubeComponentsQuery, DataCubeComponentsQueryVariables>({ query: DataCubeComponentsDocument, ...options });
};
export const DataCubeDimensionGeoShapesDocument = gql`
    query DataCubeDimensionGeoShapes($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $cubeFilter: DataCubeDimensionGeoShapesCubeFilter!) {
  dataCubeDimensionGeoShapes(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeDimensionGeoShapesQuery(options: Omit<Urql.UseQueryArgs<DataCubeDimensionGeoShapesQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubeDimensionGeoShapesQuery, DataCubeDimensionGeoShapesQueryVariables>({ query: DataCubeDimensionGeoShapesDocument, ...options });
};
export const DataCubeMetadataDocument = gql`
    query DataCubeMetadata($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $cubeFilter: DataCubeMetadataFilter!) {
  dataCubeMetadata(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeMetadataQuery(options: Omit<Urql.UseQueryArgs<DataCubeMetadataQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubeMetadataQuery, DataCubeMetadataQueryVariables>({ query: DataCubeMetadataDocument, ...options });
};
export const DataCubeComponentTermsetsDocument = gql`
    query DataCubeComponentTermsets($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $cubeFilter: DataCubeTermsetFilter!) {
  dataCubeComponentTermsets(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeComponentTermsetsQuery(options: Omit<Urql.UseQueryArgs<DataCubeComponentTermsetsQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubeComponentTermsetsQuery, DataCubeComponentTermsetsQueryVariables>({ query: DataCubeComponentTermsetsDocument, ...options });
};
export const DataCubeObservationsDocument = gql`
    query DataCubeObservations($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $cubeFilter: DataCubeObservationFilter!) {
  dataCubeObservations(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubeObservationsQuery(options: Omit<Urql.UseQueryArgs<DataCubeObservationsQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubeObservationsQuery, DataCubeObservationsQueryVariables>({ query: DataCubeObservationsDocument, ...options });
};
export const DataCubePreviewDocument = gql`
    query DataCubePreview($sourceType: String!, $sourceUrl: DataSourceUrl!, $locale: String!, $cubeFilter: DataCubePreviewFilter!) {
  dataCubePreview(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    locale: $locale
    cubeFilter: $cubeFilter
  )
}
    `;

export function useDataCubePreviewQuery(options: Omit<Urql.UseQueryArgs<DataCubePreviewQueryVariables>, 'query'>) {
  return Urql.useQuery<DataCubePreviewQuery, DataCubePreviewQueryVariables>({ query: DataCubePreviewDocument, ...options });
};
export const PossibleFiltersDocument = gql`
    query PossibleFilters($sourceType: String!, $sourceUrl: DataSourceUrl!, $cubeFilter: DataCubePossibleFiltersCubeFilter!) {
  possibleFilters(
    sourceType: $sourceType
    sourceUrl: $sourceUrl
    cubeFilter: $cubeFilter
  ) {
    type
    id
    value
  }
}
    `;

export function usePossibleFiltersQuery(options: Omit<Urql.UseQueryArgs<PossibleFiltersQueryVariables>, 'query'>) {
  return Urql.useQuery<PossibleFiltersQuery, PossibleFiltersQueryVariables>({ query: PossibleFiltersDocument, ...options });
};