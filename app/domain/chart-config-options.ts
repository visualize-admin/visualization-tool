import { ChartType } from "./config-types";

// Control UI elements with chart options

// cf also: getPossibleChartType
// cf also: config-types

// FIXME: This should match graphQL Schema?
export type DimensionType =
  | "TemporalDimension"
  | "NominalDimension"
  | "OrdinalDimension"
  | "Measure"
  | "Attribute";

export type EncodingField = "x" | "y" | "segment";
export type EncodingOption = "chartSubType" | "color";
export type EncodingOptions =
  | undefined
  | { field: EncodingOption; values: string[] }[];
export interface EncodingSpec {
  field: EncodingField;
  optional: boolean;
  values: DimensionType[];
  filters: boolean;
  options?: EncodingOptions;
}
export interface ChartSpec {
  chartType: ChartType;
  encodings: EncodingSpec[];
}

interface ChartSpecs {
  column: ChartSpec;
  bar: ChartSpec;
  line: ChartSpec;
  area: ChartSpec;
  scatterplot: ChartSpec;
  pie: ChartSpec;
}
export const chartConfigOptionsSpec: ChartSpecs = {
  column: {
    chartType: "column",
    encodings: [
      { field: "y", optional: false, values: ["Measure"], filters: false },
      {
        field: "x",
        optional: false,
        values: ["TemporalDimension", "NominalDimension", "OrdinalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        values: ["TemporalDimension", "NominalDimension", "OrdinalDimension"],
        filters: true,
        options: [
          { field: "chartSubType", values: ["stacked", "grouped"] },
          { field: "color", values: ["palette"] },
        ],
      },
    ],
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
      { field: "x", optional: false, values: ["Measure"], filters: false },
      {
        field: "segment",
        optional: true,
        values: ["TemporalDimension", "NominalDimension", "OrdinalDimension"],
        filters: true,
        options: [
          { field: "chartSubType", values: ["stacked", "grouped"] },
          { field: "color", values: ["palette"] },
        ],
      },
    ],
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
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
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
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
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
        values: ["TemporalDimension", "NominalDimension", "OrdinalDimension"],
        filters: true,
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
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
        values: ["TemporalDimension", "NominalDimension", "OrdinalDimension"],
        filters: true,
        options: [{ field: "color", values: ["palette"] }],
      },
    ],
  },
};
