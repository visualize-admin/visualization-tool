import {
  ChartType,
  ComponentType,
  SortingOrder,
  SortingType,
} from "@/configurator/config-types";

/**
 * This module controls chart controls displayed in the UI.
 * Related to config-types.ts.
 */

type MapEncodingFieldType = "baseLayer" | "areaLayer" | "symbolLayer";
type XYEncodingFieldType = "x" | "y" | "segment";
export type EncodingFieldType = MapEncodingFieldType | XYEncodingFieldType;

export type EncodingOptionType =
  // Generic.
  | "sorting"
  | "color"
  // Area.
  | "imputationType"
  // Column.
  | "chartSubType"
  | "showStandardError";

export type EncodingOption = {
  field: EncodingOptionType;
};

/**
 * @todo
 * - Differentiate sorting within chart vs. sorting legend / tooltip only
 */
export type EncodingSortingOption = {
  sortingType: SortingType;
  sortingOrder: SortingOrder[];
};

export interface EncodingSpec {
  field: EncodingFieldType;
  optional: boolean;
  componentTypes: ComponentType[];
  /** If false, using a dimension in this encoding will not prevent it to be used in an other encoding. Default: true */
  exclusive?: boolean;
  filters: boolean;
  sorting?: EncodingSortingOption[];
  options?: EncodingOption[];
}

// Should we also have dataFilters here?
type InteractiveFilterType = "legend" | "time";

export interface ChartSpec {
  chartType: ChartType;
  encodings: EncodingSpec[];
  interactiveFilters: InteractiveFilterType[];
}

interface ChartSpecs {
  area: ChartSpec;
  bar: ChartSpec;
  column: ChartSpec;
  line: ChartSpec;
  map: ChartSpec;
  pie: ChartSpec;
  scatterplot: ChartSpec;
  table: ChartSpec;
}

const SEGMENT_COMPONENT_TYPES: ComponentType[] = [
  "NominalDimension",
  "OrdinalDimension",
  "GeoCoordinatesDimension",
  "GeoShapesDimension",
];

export const AREA_SEGMENT_SORTING: EncodingSortingOption[] = [
  { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
  { sortingType: "byTotalSize", sortingOrder: ["asc", "desc"] },
];

export const COLUMN_SEGMENT_SORTING: EncodingSortingOption[] =
  AREA_SEGMENT_SORTING;

export const PIE_SEGMENT_SORTING: EncodingSortingOption[] = [
  { sortingType: "byMeasure", sortingOrder: ["asc", "desc"] },
  { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
];

export const chartConfigOptionsUISpec: ChartSpecs = {
  area: {
    chartType: "area",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "x",
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: AREA_SEGMENT_SORTING,
        options: [{ field: "color" }, { field: "imputationType" }],
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
        componentTypes: [
          "TemporalDimension",
          "NominalDimension",
          "OrdinalDimension",
          "GeoCoordinatesDimension",
          "GeoShapesDimension",
        ],
        filters: true,
      },
      {
        field: "x",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: [
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
          { sortingType: "byTotalSize", sortingOrder: ["asc", "desc"] },
        ],
        options: [{ field: "chartSubType" }, { field: "color" }],
      },
    ],
    interactiveFilters: ["legend", "time"],
  },
  column: {
    chartType: "column",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
        options: [{ field: "showStandardError" }],
      },
      {
        field: "x",
        optional: false,
        componentTypes: [
          "TemporalDimension",
          "NominalDimension",
          "OrdinalDimension",
          "GeoCoordinatesDimension",
          "GeoShapesDimension",
        ],
        filters: true,
        sorting: [
          { sortingType: "byMeasure", sortingOrder: ["asc", "desc"] },
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
        ],
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: COLUMN_SEGMENT_SORTING,
        options: [{ field: "chartSubType" }, { field: "color" }],
      },
    ],
    interactiveFilters: ["legend", "time"],
  },
  line: {
    chartType: "line",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "x",
        optional: false,
        componentTypes: ["TemporalDimension"],
        filters: true,
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        options: [{ field: "color" }],
      },
    ],
    interactiveFilters: ["legend", "time"],
  },
  map: {
    chartType: "map",
    encodings: [
      {
        field: "baseLayer",
        optional: true,
        componentTypes: [],
        filters: false,
      },
      {
        field: "areaLayer",
        optional: true,
        componentTypes: ["GeoShapesDimension"],
        exclusive: false,
        filters: true,
      },
      {
        field: "symbolLayer",
        optional: true,
        componentTypes: ["GeoCoordinatesDimension", "GeoShapesDimension"],
        exclusive: false,
        filters: true,
      },
    ],
    interactiveFilters: [],
  },
  pie: {
    chartType: "pie",
    encodings: [
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "segment",
        optional: false,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: PIE_SEGMENT_SORTING,
        options: [{ field: "color" }],
      },
    ],
    interactiveFilters: ["legend"],
  },
  scatterplot: {
    chartType: "scatterplot",
    encodings: [
      {
        field: "x",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "y",
        optional: false,
        componentTypes: ["NumericalMeasure"],
        filters: false,
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        options: [{ field: "color" }],
      },
    ],
    interactiveFilters: ["legend"],
  },
  table: {
    chartType: "table",
    encodings: [],
    interactiveFilters: [],
  },
};
