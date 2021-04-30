import {
  DimensionFieldsWithValuesFragment,
  DimensionFieldsFragment,
} from "./query-hooks";

export type DataCubeMetadata = {
  iri: string;
  title: string;
  dimensions: DimensionFieldsWithValuesFragment[];
  measures: DimensionFieldsFragment[];
};
