import { ChartType, SortingOrder } from "../configurator";

/**
 * This module controls chart controls displayed in the UI.
 * Related to config-types.ts.
 */

// This should match graphQL Schema
export type DimensionType =
  | "TemporalDimension"
  | "NominalDimension"
  | "OrdinalDimension"
  | "Measure"
  | "Attribute";

export type EncodingField = "x" | "y" | "segment";
export type EncodingOption = "chartSubType" | "sorting" | "color";

export type EncodingOptions =
  | undefined
  | {
      field: EncodingOption;
      values: string[] | { field: string; values?: string | string[] }[];
    }[];
export type EncodingSortingOption = {
  sortingType: "byDimensionLabel" | "byTotalSize" | "byMeasure";
  sortingOrder: SortingOrder[];
};
type InteractiveFilterType = "legend" | "time";
export interface EncodingSpec {
  field: EncodingField;
  optional: boolean;
  values: DimensionType[];
  filters: boolean;
  sorting?: EncodingSortingOption[]; // { field: string; values: string | string[] }[];
  options?: EncodingOptions;
}
export interface ChartSpec {
  chartType: ChartType;
  encodings: EncodingSpec[];
  interactiveFilters: InteractiveFilterType[];
}

interface ChartSpecs {
  column: ChartSpec;
  bar: ChartSpec;
  line: ChartSpec;
  area: ChartSpec;
  scatterplot: ChartSpec;
  pie: ChartSpec;
  table: ChartSpec;
  map: ChartSpec;
}

/**
 * @todo
 * - Differentiate sorting within chart vs. sorting legend/tooltip only
 */

export const chartConfigOptionsUISpec: ChartSpecs = {
  column: {
    chartType: "column",
    encodings: [
      { field: "y", optional: false, values: ["Measure"], filters: false },
      {
        field: "x",
        optional: false,
        values: ["TemporalDimension", "NominalDimension", "OrdinalDimension"],
        filters: true,
        sorting: [
          { sortingType: "byMeasure", sortingOrder: ["asc", "desc"] },
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
        ],
      },
      {
        field: "segment",
        optional: true,
        values: ["NominalDimension", "OrdinalDimension"],
        filters: true,
        sorting: [
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
          { sortingType: "byTotalSize", sortingOrder: ["asc", "desc"] },
        ],
        options: [
          { field: "chartSubType", values: ["stacked", "grouped"] },
          { field: "color", values: ["palette"] },
        ],
      },
    ],
    interactiveFilters: ["legend", "time"],
  },
  bar: {
    chartType: "bar",
    encodings: [
      {
        field: "y",
        optional: false,
        values: ["TemporalDimension", "NominalDimension", "OrdinalDimension"],
        filters: true,
      },
      {
        field: "x",
        optional: false,
        values: ["Measure"],
        filters: false,
      },
      {
        field: "segment",
        optional: true,
        values: ["NominalDimension", "OrdinalDimension"],
        filters: true,
        sorting: [
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
          { sortingType: "byTotalSize", sortingOrder: ["asc", "desc"] },
        ],
        options: [
          { field: "chartSubType", values: ["grouped"] },
          { field: "color", values: ["palette"] },
        ],
      },
    ],
    interactiveFilters: ["legend", "time"],
  },
  line: {
    chartType: "line",
    encodings: [
      { field: "y", optional: false, values: ["Measure"], filters: false },
      {
        field: "x",
        optional: false,
        values: ["TemporalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        values: ["NominalDimension", "OrdinalDimension"],
        filters: true,
        // sorting: [
        //   { sortingType: "byTotalSize", sortingOrder: ["asc", "desc"] },
        //   { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
        // ],
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
    interactiveFilters: ["legend", "time"],
  },

  area: {
    chartType: "area",
    encodings: [
      { field: "y", optional: false, values: ["Measure"], filters: false },
      {
        field: "x",
        optional: false,
        values: ["TemporalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        values: ["NominalDimension", "OrdinalDimension"],
        filters: true,
        sorting: [
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
          { sortingType: "byTotalSize", sortingOrder: ["asc", "desc"] },
        ],
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
    interactiveFilters: ["legend", "time"],
  },
  scatterplot: {
    chartType: "scatterplot",
    encodings: [
      {
        field: "x",
        optional: false,
        values: ["Measure"],
        filters: false,
      },
      { field: "y", optional: false, values: ["Measure"], filters: false },
      {
        field: "segment",
        optional: true,
        values: ["NominalDimension", "OrdinalDimension"],
        filters: true,
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
    interactiveFilters: ["legend"],
  },
  pie: {
    chartType: "pie",
    encodings: [
      {
        field: "y",
        optional: false,
        values: ["Measure"],
        filters: false,
      },
      {
        field: "segment",
        optional: false,
        values: ["NominalDimension", "OrdinalDimension"],
        filters: true,
        sorting: [
          { sortingType: "byMeasure", sortingOrder: ["asc", "desc"] },
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
        ],
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
    interactiveFilters: ["legend"],
  },
  table: {
    chartType: "table",
    encodings: [],
    interactiveFilters: [],
  },
  map: {
    chartType: "map",
    encodings: [],
    interactiveFilters: [],
  },
};

// const tableOptions = {
//   chartType: "table",
//   settings: [
//     { field: "showSearch", optional: false, type: "boolean", default: false },
//     { field: "showAllRows", optional: false, type: "boolean", default: false },
//   ],
//   encodings: [
//     {
//       type: "section",
//       title: "groups",
//       encodings: [],
//     },
//     {
//       type: "section",
//       title: "columns",
//       encodings: [],
//     },
//   ],
// };
