import {
  DataCubeMetadataWithComponentValuesAndHierarchiesQuery,
  DataCubeMetadataWithComponentValuesQuery,
} from "./query-hooks";

export type DataCubeMetadata = NonNullable<
  DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
>;

export type DataCubeMetadataWithHierarchies = NonNullable<
  DataCubeMetadataWithComponentValuesAndHierarchiesQuery["dataCubeByIri"]
>;
