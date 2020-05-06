import { ChartType } from "./config-types";

// Control UI elements with chart options

// cf also: getPossibleChartType
// cf also: config-types

/**
 * Dimension types: "TemporalDimension" | "NominalDimension" | "OrdinalDimension" | "Measure"
 */

export type DimensionType =
  | "TemporalDimension"
  | "NominalDimension"
  | "OrdinalDimension"
  | "Measure"
  | "Attribute";
export interface EncodingSpec {
  field: string;
  optional: boolean;
  values: DimensionType[];
  filters: boolean;
  options?: undefined | { field: string; values: string[] }[];
}
export interface ChartSpec {
  chartType: ChartType;
  encodings: EncodingSpec[];
}

interface ChartSpecs {
  column: ChartSpec;
  bar: {};
  line: {};
  area: {};
  scatterplot: {};
  pie: {};
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
          { field: "color", values: ["none", "palette"] },
        ],
      },
    ],
  },
  bar: {},
  line: {
    chartType: "line",
    encodings: {
      field: "x",
      values: ["TemporalDimension"],
    },
  },

  area: {},
  scatterplot: {},
  pie: {},
};
