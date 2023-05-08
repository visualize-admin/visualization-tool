import {
  ComponentsQuery,
  ComponentsWithHierarchiesQuery,
  DataCubeMetadataQuery,
} from "./query-hooks";

export type DataCubeMetadata = NonNullable<
  DataCubeMetadataQuery["dataCubeByIri"] & ComponentsQuery["dataCubeByIri"]
>;

export type DataCubeMetadataWithHierarchies = NonNullable<
  DataCubeMetadataQuery["dataCubeByIri"] &
    ComponentsWithHierarchiesQuery["dataCubeByIri"]
>;
