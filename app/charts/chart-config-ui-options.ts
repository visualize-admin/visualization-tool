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

export type EncodingOption =
  | { field: "chartSubType" }
  | { field: "color"; type: "palette" }
  | {
      field: "color";
      type: "component";
      optional: boolean;
      componentTypes: ComponentType[];
    }
  | { field: "imputationType" }
  | { field: "showStandardError" }
  | { field: "sorting" }
  | { field: "size"; componentTypes: ComponentType[]; optional: boolean };

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

// dataFilters is enabled by default
// timeSlider is enabled dynamically based on availability of temporal dimensions
type InteractiveFilterType = "legend" | "timeRange";

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
  { sortingType: "byAuto", sortingOrder: ["asc", "desc"] },
  { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
  { sortingType: "byTotalSize", sortingOrder: ["asc", "desc"] },
];

export const LINE_SEGMENT_SORTING: EncodingSortingOption[] = [
  { sortingType: "byAuto", sortingOrder: ["asc", "desc"] },
  { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
];

export const COLUMN_SEGMENT_SORTING: EncodingSortingOption[] =
  AREA_SEGMENT_SORTING;

export const PIE_SEGMENT_SORTING: EncodingSortingOption[] = [
  { sortingType: "byAuto", sortingOrder: ["asc", "desc"] },
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
        options: [
          { field: "color", type: "palette" },
          { field: "imputationType" },
        ],
      },
    ],
    interactiveFilters: ["legend", "timeRange"],
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
        options: [
          { field: "chartSubType" },
          { field: "color", type: "palette" },
        ],
      },
    ],
    interactiveFilters: ["legend", "timeRange"],
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
        options: [
          { field: "chartSubType" },
          { field: "color", type: "palette" },
        ],
      },
    ],
    interactiveFilters: ["legend", "timeRange"],
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
        sorting: LINE_SEGMENT_SORTING,
        options: [{ field: "color", type: "palette" }],
      },
    ],
    interactiveFilters: ["legend", "timeRange"],
  },
  map: {
    chartType: "map",
    encodings: [
      // Should this even be an encoding when it's not mapped to a component?
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
        options: [
          {
            field: "color",
            type: "component",
            componentTypes: ["NumericalMeasure", "OrdinalMeasure"],
            optional: false,
          },
        ],
      },
      {
        field: "symbolLayer",
        optional: true,
        componentTypes: ["GeoCoordinatesDimension", "GeoShapesDimension"],
        exclusive: false,
        filters: true,
        options: [
          {
            field: "size",
            componentTypes: ["NumericalMeasure"],
            optional: true,
          },
          {
            field: "color",
            type: "component",
            componentTypes: [
              "NumericalMeasure",
              "OrdinalMeasure",
              "GeoCoordinatesDimension",
              "GeoShapesDimension",
              "NominalDimension",
              "OrdinalDimension",
            ],
            optional: true,
          },
        ],
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
        options: [{ field: "color", type: "palette" }],
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
        options: [{ field: "color", type: "palette" }],
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
