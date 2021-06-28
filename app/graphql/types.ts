import { DataCubeMetadataWithComponentValuesQuery } from "./query-hooks";

export type DataCubeMetadata = NonNullable<
  DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
>;
