import {
  DimensionFieldsWithValuesFragment,
  ComponentFieldsFragment,
} from "./query-hooks";

export type DataCubeMetadata = {
  iri: string;
  title: string;
  dimensions: DimensionFieldsWithValuesFragment[];
  measures: ComponentFieldsFragment[];
};
