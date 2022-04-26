import { ComponentType } from "react";

import { DataCubeMetadata } from "../graphql/types";
import { IconName } from "../icons";

import { ChartConfig, SortingOrder } from "./config-types";

type ChartComponentProps = {
  dataSetIri: string;
  chartConfig: ChartConfig;
};

export type ChartModule = {
  name: string;
  iconName: IconName;
  isPossibleChartType: (dataCubeMetadata: any) => boolean;
  isValidConfig: (config: any) => boolean;
  getInitialConfig: ({
    dimensions,
    measures,
  }: {
    dimensions: DataCubeMetadata["dimensions"];
    measures: DataCubeMetadata["measures"];
  }) => ChartConfig;
  getConfigOptions: () => ChartSpec;
  previewComponent: ComponentType<ChartComponentProps>;
  publishedComponent: ComponentType<ChartComponentProps>;
};

/**
 * This module controls chart controls displayed in the UI.
 * Related to config-types.ts.
 */

// This should match graphQL Schema
type DimensionType =
  | "TemporalDimension"
  | "NominalDimension"
  | "OrdinalDimension"
  | "Measure"
  | "Attribute";

type EncodingField = "x" | "y" | "segment";
type EncodingOption = "chartSubType" | "sorting" | "color";

type EncodingOptions =
  | undefined
  | {
      field: EncodingOption;
      values: string[] | { field: string; values?: string | string[] }[];
    }[];
type EncodingSortingOption = {
  sortingType: "byDimensionLabel" | "byTotalSize" | "byMeasure";
  sortingOrder: SortingOrder[];
};
interface EncodingSpec {
  field: EncodingField;
  optional: boolean;
  values: DimensionType[];
  filters: boolean;
  sorting?: EncodingSortingOption[]; // { field: string; values: string | string[] }[];
  options?: EncodingOptions;
}
interface ChartSpec {
  encodings: EncodingSpec[];
}
