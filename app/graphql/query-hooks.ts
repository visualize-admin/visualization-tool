import { ComponentTermsets } from "../domain/data";
import { DataCubeComponents } from "../domain/data";
import { DataCubeMetadata } from "../domain/data";
import { DataCubeObservations } from "../domain/data";
import { DataCubePreview } from "../domain/data";
import { DataSourceUrl } from "../domain/data-source";
import { DimensionValue } from "../domain/data";
import { Filters } from "../configurator";
import { GeoShapes } from "../domain/data";
import { HierarchyValue } from "../domain/data";
import { Observation } from "../domain/data";
import { RawObservation } from "../domain/data";
import { SearchCube } from "../domain/data";
import { SingleFilters } from "../configurator";
import { Termset } from "../domain/data";
import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
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
  DataSourceUrl: DataSourceUrl;
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
  iri: Scalars["String"];
  filters?: Maybe<Scalars["Filters"]>;
  componentIds?: Maybe<Array<Scalars["String"]>>;
  joinBy?: Maybe<Array<Scalars["String"]>>;
  loadValues?: Maybe<Scalars["Boolean"]>;
};

export type DataCubeDimensionGeoShapesCubeFilter = {
  iri: Scalars["String"];
  dimensionId: Scalars["String"];
};

export type DataCubeLatestIriFilter = {
  iri: Scalars["String"];
};

export type DataCubeMetadataFilter = {
  iri: Scalars["String"];
};

export type DataCubeObservationFilter = {
  iri: Scalars["String"];
  filters?: Maybe<Scalars["Filters"]>;
  componentIds?: Maybe<Array<Scalars["String"]>>;
  joinBy?: Maybe<Array<Scalars["String"]>>;
};

export type DataCubeOrganization = {
  __typename: "DataCubeOrganization";
  iri: Scalars["String"];
  label?: Maybe<Scalars["String"]>;
};

export type DataCubePossibleFiltersCubeFilter = {
  iri: Scalars["String"];
  filters: Scalars["SingleFilters"];
};

export type DataCubePreviewFilter = {
  iri: Scalars["String"];
};

export enum DataCubePublicationStatus {
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export type DataCubeTermset = {
  __typename: "DataCubeTermset";
  iri: Scalars["String"];
  label?: Maybe<Scalars["String"]>;
};

export type DataCubeTermsetFilter = {
  iri: Scalars["String"];
};

export type DataCubeTheme = {
  __typename: "DataCubeTheme";
  iri: Scalars["String"];
  label?: Maybe<Scalars["String"]>;
};

export type DataCubeUnversionedIriFilter = {
  iri: Scalars["String"];
};

export type PossibleFilterValue = {
  __typename: "PossibleFilterValue";
  type: Scalars["String"];
  id: Scalars["String"];
  value?: Maybe<Scalars["FilterValue"]>;
};

export type Query = {
  __typename: "Query";
  dataCubeLatestIri: Scalars["String"];
  dataCubeUnversionedIri?: Maybe<Scalars["String"]>;
  dataCubeComponents: Scalars["DataCubeComponents"];
  dataCubeComponentTermsets: Array<Scalars["ComponentTermsets"]>;
  dataCubeMetadata: Scalars["DataCubeMetadata"];
  dataCubeObservations: Scalars["DataCubeObservations"];
  dataCubePreview: Scalars["DataCubePreview"];
  possibleFilters: Array<PossibleFilterValue>;
  searchCubes: Array<SearchCubeResult>;
  dataCubeDimensionGeoShapes?: Maybe<Scalars["GeoShapes"]>;
};

export type QueryDataCubeLatestIriArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  cubeFilter: DataCubeLatestIriFilter;
};

export type QueryDataCubeUnversionedIriArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  cubeFilter: DataCubeUnversionedIriFilter;
};

export type QueryDataCubeComponentsArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeComponentFilter;
};

export type QueryDataCubeComponentTermsetsArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeTermsetFilter;
};

export type QueryDataCubeMetadataArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeMetadataFilter;
};

export type QueryDataCubeObservationsArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeObservationFilter;
};

export type QueryDataCubePreviewArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubePreviewFilter;
};

export type QueryPossibleFiltersArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  cubeFilter: DataCubePossibleFiltersCubeFilter;
};

export type QuerySearchCubesArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale?: Maybe<Scalars["String"]>;
  query?: Maybe<Scalars["String"]>;
  order?: Maybe<SearchCubeResultOrder>;
  includeDrafts?: Maybe<Scalars["Boolean"]>;
  fetchDimensionTermsets?: Maybe<Scalars["Boolean"]>;
  filters?: Maybe<Array<SearchCubeFilter>>;
};

export type QueryDataCubeDimensionGeoShapesArgs = {
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeDimensionGeoShapesCubeFilter;
};

export type RelatedDimension = {
  __typename: "RelatedDimension";
  type: RelatedDimensionType;
  id: Scalars["String"];
};

export enum RelatedDimensionType {
  StandardError = "StandardError",
  ConfidenceUpperBound = "ConfidenceUpperBound",
  ConfidenceLowerBound = "ConfidenceLowerBound",
}

export enum ScaleType {
  Ordinal = "Ordinal",
  Nominal = "Nominal",
  Interval = "Interval",
  Ratio = "Ratio",
}

export type SearchCubeFilter = {
  type: SearchCubeFilterType;
  label?: Maybe<Scalars["String"]>;
  value: Scalars["String"];
};

export enum SearchCubeFilterType {
  TemporalDimension = "TemporalDimension",
  DataCubeTheme = "DataCubeTheme",
  DataCubeOrganization = "DataCubeOrganization",
  DataCubeAbout = "DataCubeAbout",
  DataCubeTermset = "DataCubeTermset",
}

export type SearchCubeResult = {
  __typename: "SearchCubeResult";
  score?: Maybe<Scalars["Float"]>;
  cube: Scalars["SearchCube"];
  highlightedTitle?: Maybe<Scalars["String"]>;
  highlightedDescription?: Maybe<Scalars["String"]>;
};

export enum SearchCubeResultOrder {
  Score = "SCORE",
  TitleAsc = "TITLE_ASC",
  CreatedDesc = "CREATED_DESC",
}

export enum TimeUnit {
  Year = "Year",
  Month = "Month",
  Week = "Week",
  Day = "Day",
  Hour = "Hour",
  Minute = "Minute",
  Second = "Second",
}

export type SearchCubesQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  query?: Maybe<Scalars["String"]>;
  order?: Maybe<SearchCubeResultOrder>;
  includeDrafts?: Maybe<Scalars["Boolean"]>;
  fetchDimensionTermsets?: Maybe<Scalars["Boolean"]>;
  filters?: Maybe<Array<SearchCubeFilter> | SearchCubeFilter>;
}>;

export type SearchCubesQuery = {
  __typename: "Query";
  searchCubes: Array<{
    __typename: "SearchCubeResult";
    highlightedTitle?: Maybe<string>;
    highlightedDescription?: Maybe<string>;
    cube: SearchCube;
  }>;
};

export type DataCubeLatestIriQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  cubeFilter: DataCubeLatestIriFilter;
}>;

export type DataCubeLatestIriQuery = {
  __typename: "Query";
  dataCubeLatestIri: string;
};

export type DataCubeUnversionedIriQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  cubeFilter: DataCubeUnversionedIriFilter;
}>;

export type DataCubeUnversionedIriQuery = {
  __typename: "Query";
  dataCubeUnversionedIri?: Maybe<string>;
};

export type DataCubeComponentsQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeComponentFilter;
}>;

export type DataCubeComponentsQuery = {
  __typename: "Query";
  dataCubeComponents: DataCubeComponents;
};

export type DataCubeDimensionGeoShapesQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeDimensionGeoShapesCubeFilter;
}>;

export type DataCubeDimensionGeoShapesQuery = {
  __typename: "Query";
  dataCubeDimensionGeoShapes?: Maybe<GeoShapes>;
};

export type DataCubeMetadataQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeMetadataFilter;
}>;

export type DataCubeMetadataQuery = {
  __typename: "Query";
  dataCubeMetadata: DataCubeMetadata;
};

export type DataCubeComponentTermsetsQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeTermsetFilter;
}>;

export type DataCubeComponentTermsetsQuery = {
  __typename: "Query";
  dataCubeComponentTermsets: Array<ComponentTermsets>;
};

export type DataCubeObservationsQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubeObservationFilter;
}>;

export type DataCubeObservationsQuery = {
  __typename: "Query";
  dataCubeObservations: DataCubeObservations;
};

export type DataCubePreviewQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  locale: Scalars["String"];
  cubeFilter: DataCubePreviewFilter;
}>;

export type DataCubePreviewQuery = {
  __typename: "Query";
  dataCubePreview: DataCubePreview;
};

export type PossibleFiltersQueryVariables = Exact<{
  sourceType: Scalars["String"];
  sourceUrl: Scalars["DataSourceUrl"];
  cubeFilter: DataCubePossibleFiltersCubeFilter;
}>;

export type PossibleFiltersQuery = {
  __typename: "Query";
  possibleFilters: Array<{
    __typename: "PossibleFilterValue";
    type: string;
    id: string;
    value?: Maybe<any>;
  }>;
};

export const SearchCubesDocument = gql`
  query SearchCubes(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $locale: String!
    $query: String
    $order: SearchCubeResultOrder
    $includeDrafts: Boolean
    $fetchDimensionTermsets: Boolean
    $filters: [SearchCubeFilter!]
  ) {
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

export function useSearchCubesQuery(
  options: Omit<Urql.UseQueryArgs<SearchCubesQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<SearchCubesQuery>({
    query: SearchCubesDocument,
    ...options,
  });
}
export const DataCubeLatestIriDocument = gql`
  query DataCubeLatestIri(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $cubeFilter: DataCubeLatestIriFilter!
  ) {
    dataCubeLatestIri(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubeLatestIriQuery(
  options: Omit<
    Urql.UseQueryArgs<DataCubeLatestIriQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<DataCubeLatestIriQuery>({
    query: DataCubeLatestIriDocument,
    ...options,
  });
}
export const DataCubeUnversionedIriDocument = gql`
  query DataCubeUnversionedIri(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $cubeFilter: DataCubeUnversionedIriFilter!
  ) {
    dataCubeUnversionedIri(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubeUnversionedIriQuery(
  options: Omit<
    Urql.UseQueryArgs<DataCubeUnversionedIriQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<DataCubeUnversionedIriQuery>({
    query: DataCubeUnversionedIriDocument,
    ...options,
  });
}
export const DataCubeComponentsDocument = gql`
  query DataCubeComponents(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $locale: String!
    $cubeFilter: DataCubeComponentFilter!
  ) {
    dataCubeComponents(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      locale: $locale
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubeComponentsQuery(
  options: Omit<
    Urql.UseQueryArgs<DataCubeComponentsQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<DataCubeComponentsQuery>({
    query: DataCubeComponentsDocument,
    ...options,
  });
}
export const DataCubeDimensionGeoShapesDocument = gql`
  query DataCubeDimensionGeoShapes(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $locale: String!
    $cubeFilter: DataCubeDimensionGeoShapesCubeFilter!
  ) {
    dataCubeDimensionGeoShapes(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      locale: $locale
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubeDimensionGeoShapesQuery(
  options: Omit<
    Urql.UseQueryArgs<DataCubeDimensionGeoShapesQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<DataCubeDimensionGeoShapesQuery>({
    query: DataCubeDimensionGeoShapesDocument,
    ...options,
  });
}
export const DataCubeMetadataDocument = gql`
  query DataCubeMetadata(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $locale: String!
    $cubeFilter: DataCubeMetadataFilter!
  ) {
    dataCubeMetadata(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      locale: $locale
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubeMetadataQuery(
  options: Omit<Urql.UseQueryArgs<DataCubeMetadataQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<DataCubeMetadataQuery>({
    query: DataCubeMetadataDocument,
    ...options,
  });
}
export const DataCubeComponentTermsetsDocument = gql`
  query DataCubeComponentTermsets(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $locale: String!
    $cubeFilter: DataCubeTermsetFilter!
  ) {
    dataCubeComponentTermsets(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      locale: $locale
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubeComponentTermsetsQuery(
  options: Omit<
    Urql.UseQueryArgs<DataCubeComponentTermsetsQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<DataCubeComponentTermsetsQuery>({
    query: DataCubeComponentTermsetsDocument,
    ...options,
  });
}
export const DataCubeObservationsDocument = gql`
  query DataCubeObservations(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $locale: String!
    $cubeFilter: DataCubeObservationFilter!
  ) {
    dataCubeObservations(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      locale: $locale
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubeObservationsQuery(
  options: Omit<
    Urql.UseQueryArgs<DataCubeObservationsQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<DataCubeObservationsQuery>({
    query: DataCubeObservationsDocument,
    ...options,
  });
}
export const DataCubePreviewDocument = gql`
  query DataCubePreview(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $locale: String!
    $cubeFilter: DataCubePreviewFilter!
  ) {
    dataCubePreview(
      sourceType: $sourceType
      sourceUrl: $sourceUrl
      locale: $locale
      cubeFilter: $cubeFilter
    )
  }
`;

export function useDataCubePreviewQuery(
  options: Omit<Urql.UseQueryArgs<DataCubePreviewQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<DataCubePreviewQuery>({
    query: DataCubePreviewDocument,
    ...options,
  });
}
export const PossibleFiltersDocument = gql`
  query PossibleFilters(
    $sourceType: String!
    $sourceUrl: DataSourceUrl!
    $cubeFilter: DataCubePossibleFiltersCubeFilter!
  ) {
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

export function usePossibleFiltersQuery(
  options: Omit<Urql.UseQueryArgs<PossibleFiltersQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<PossibleFiltersQuery>({
    query: PossibleFiltersDocument,
    ...options,
  });
}
