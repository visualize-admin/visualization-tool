import { t } from "@lingui/macro";
import { group } from "d3";

import {
  checkForMissingValuesInSegments,
  getSegment,
} from "@/charts/shared/chart-helpers";
import {
  AreaConfig,
  ChartConfig,
  ChartSubType,
  ChartType,
  ColumnConfig,
  ComponentType,
  SortingOrder,
  SortingType,
  getAnimationField,
  isSortingInConfig,
} from "@/config-types";
import {
  Observation,
  isTemporalDimension,
  isTemporalOrdinalDimension,
} from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

/**
 * This module controls chart controls displayed in the UI.
 * Related to config-types.ts.
 */

type BaseEncodingFieldType = "animation";
type MapEncodingFieldType = "baseLayer" | "areaLayer" | "symbolLayer";
type XYEncodingFieldType = "x" | "y" | "segment";
export type EncodingFieldType =
  | BaseEncodingFieldType
  | MapEncodingFieldType
  | XYEncodingFieldType;

export type EncodingOptionChartSubType = {
  field: "chartSubType";
  getValues: (
    chartConfig: ChartConfig,
    dimensions: DimensionMetadataFragment[]
  ) => {
    value: ChartSubType;
    disabled: boolean;
    warnMessage?: string;
  }[];
};

export type EncodingOption =
  | EncodingOptionChartSubType
  | {
      field: "calculation";
      getDisabledState?: (chartConfig: ChartConfig) => {
        disabled: boolean;
        warnMessage?: string;
      };
    }
  | {
      field: "color";
      type: "palette";
    }
  | {
      field: "color";
      type: "component";
      optional: boolean;
      componentTypes: ComponentType[];
      enableUseAbbreviations: boolean;
    }
  | EncodingOptionImputation
  | {
      field: "showStandardError";
    }
  | {
      field: "sorting";
    }
  | {
      field: "size";
      componentTypes: ComponentType[];
      optional: boolean;
    }
  | {
      field: "useAbbreviations";
    };

export type EncodingOptionImputation = {
  field: "imputation";
  shouldShow: (chartConfig: ChartConfig, data: Observation[]) => boolean;
};
/**
 * @todo
 * - Differentiate sorting within chart vs. sorting legend / tooltip only
 */
export type EncodingSortingOption = {
  sortingType: SortingType;
  sortingOrder: SortingOrder[];
  getDisabledState?: (chartConfig: ChartConfig) => {
    disabled: boolean;
    warnMessage?: string;
  };
};

export interface EncodingSpec {
  field: EncodingFieldType;
  optional: boolean;
  componentTypes: ComponentType[];
  /** If false, using a dimension in this encoding will not prevent it to be used in an other encoding. Default: true */
  exclusive?: boolean;
  filters: boolean;
  disableInteractiveFilters?: boolean;
  sorting?: EncodingSortingOption[];
  options?: EncodingOption[];
  getDisabledState?: (
    chartConfig: ChartConfig,
    dimensions: DimensionMetadataFragment[],
    observations: Observation[]
  ) => {
    disabled: boolean;
    warnMessage?: string;
  };
}

// dataFilters is enabled by default
type InteractiveFilterType = "legend" | "timeRange" | "animation";

export interface ChartSpec {
  chartType: ChartType;
  encodings: EncodingSpec[];
  interactiveFilters: InteractiveFilterType[];
}

interface ChartSpecs {
  area: ChartSpec;
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
  "TemporalOrdinalDimension",
  "GeoCoordinatesDimension",
  "GeoShapesDimension",
];

export const AREA_SEGMENT_SORTING: EncodingSortingOption[] = [
  {
    sortingType: "byAuto",
    sortingOrder: ["asc", "desc"],
  },
  {
    sortingType: "byDimensionLabel",
    sortingOrder: ["asc", "desc"],
  },
  {
    sortingType: "byTotalSize",
    sortingOrder: ["asc", "desc"],
    getDisabledState: (
      chartConfig
    ): {
      disabled: boolean;
      warnMessage?: string;
    } => {
      const animationPresent = !!getAnimationField(chartConfig);

      if (animationPresent) {
        return {
          disabled: true,
          warnMessage: t({
            id: "controls.sorting.byTotalSize.disabled-by-animation",
            message: "Sorting by total size is disabled during animation.",
          }),
        };
      }

      return {
        disabled: false,
      };
    },
  },
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

export const ANIMATION_FIELD_SPEC: EncodingSpec = {
  field: "animation",
  optional: true,
  componentTypes: ["TemporalDimension", "TemporalOrdinalDimension"],
  filters: true,
  disableInteractiveFilters: true,
  getDisabledState: (
    chartConfig,
    dimensions
  ): {
    disabled: boolean;
    warnMessage?: string;
  } => {
    const noTemporalDimensions = !dimensions.some((d) => {
      return isTemporalDimension(d) || isTemporalOrdinalDimension(d);
    });

    if (noTemporalDimensions) {
      return {
        disabled: true,
        warnMessage: t({
          id: "controls.section.animation.no-temporal-dimensions",
          message: "There is no dimension that can be animated.",
        }),
      };
    }

    if (
      isSortingInConfig(chartConfig) &&
      chartConfig.fields.segment?.sorting?.sortingType === "byTotalSize"
    ) {
      return {
        disabled: true,
        warnMessage: t({
          id: "controls.section.animation.disabled-by-sorting",
          message: "Animation is disabled when sorting by total size.",
        }),
      };
    }

    return {
      disabled: false,
    };
  },
};

const isMissingDataPresent = (chartConfig: AreaConfig, data: Observation[]) => {
  const { fields } = chartConfig;
  const grouped = group(
    data.filter((d) => {
      const y = d[fields.y.componentIri];
      return y !== null && y !== undefined;
    }),
    (d) => d[fields.x.componentIri] as string
  );
  const segments = Array.from(
    new Set(data.map((d) => getSegment(fields.segment?.componentIri)(d)))
  );

  return checkForMissingValuesInSegments(grouped, segments);
};

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
        getDisabledState: (_chartConfig, _, data) => {
          const chartConfig = _chartConfig as AreaConfig;
          const missingDataPresent = isMissingDataPresent(chartConfig, data);
          const imputationType = chartConfig.fields.y.imputationType;
          const disabled = false;
          const warnMessage =
            missingDataPresent && imputationType === "none"
              ? t({
                  id: "controls.section.imputation.explanation",
                  message:
                    "For this chart type, replacement values should be assigned to missing values. Decide on the imputation logic or switch to another chart type.",
                })
              : undefined;

          return {
            disabled,
            warnMessage,
          };
        },
        options: [
          { field: "calculation" },
          { field: "color", type: "palette" },
          {
            field: "imputation",
            shouldShow: (chartConfig, data) => {
              return isMissingDataPresent(chartConfig as AreaConfig, data);
            },
          },
          { field: "useAbbreviations" },
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
          "TemporalOrdinalDimension",
          "NominalDimension",
          "OrdinalDimension",
          "GeoCoordinatesDimension",
          "GeoShapesDimension",
        ],
        filters: true,
        sorting: [
          { sortingType: "byAuto", sortingOrder: ["asc", "desc"] },
          { sortingType: "byMeasure", sortingOrder: ["asc", "desc"] },
          { sortingType: "byDimensionLabel", sortingOrder: ["asc", "desc"] },
        ],
        options: [{ field: "useAbbreviations" }],
      },
      {
        field: "segment",
        optional: true,
        componentTypes: SEGMENT_COMPONENT_TYPES,
        filters: true,
        sorting: COLUMN_SEGMENT_SORTING,
        options: [
          {
            field: "chartSubType",
            getValues: (d, dimensions) => {
              const chartConfig = d as ColumnConfig;
              const yIri = chartConfig.fields.y.componentIri;
              const yDimension = dimensions.find((d) => d.iri === yIri);
              const disabledStacked = yDimension?.scaleType !== "Ratio";

              return [
                {
                  value: "stacked",
                  disabled: disabledStacked,
                  warnMessage: disabledStacked
                    ? t({
                        id: "controls.segment.stacked.disabled-by-scale-type",
                        message:
                          "Stacked layout can only be enabled if the dimension mapped to the vertical axis has a ratio scale.",
                      })
                    : undefined,
                },
                {
                  value: "grouped",
                  disabled: false,
                },
              ];
            },
          },
          {
            field: "calculation",
            getDisabledState: (d) => {
              const grouped =
                (d as ColumnConfig).fields.segment?.type === "grouped";

              return {
                disabled: grouped,
                warnMessage: grouped
                  ? t({
                      id: "controls.calculation.disabled-by-grouped",
                      message:
                        "100% mode cannot be used with a grouped layout.",
                    })
                  : undefined,
              };
            },
          },
          { field: "color", type: "palette" },
          { field: "useAbbreviations" },
        ],
      },
    ],
    interactiveFilters: ["legend", "timeRange", "animation"],
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
        options: [
          { field: "color", type: "palette" },
          { field: "useAbbreviations" },
        ],
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
            componentTypes: [
              "NumericalMeasure",
              "OrdinalMeasure",
              "TemporalOrdinalDimension",
            ],
            optional: false,
            enableUseAbbreviations: true,
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
              "TemporalOrdinalDimension",
            ],
            optional: true,
            enableUseAbbreviations: true,
          },
        ],
      },
    ],
    interactiveFilters: ["animation"],
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
        options: [
          { field: "color", type: "palette" },
          { field: "useAbbreviations" },
        ],
      },
    ],
    interactiveFilters: ["legend", "animation"],
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
        options: [
          { field: "color", type: "palette" },
          { field: "useAbbreviations" },
        ],
      },
    ],
    interactiveFilters: ["legend", "animation"],
  },
  table: {
    // TODO: Add abbreviations here.
    chartType: "table",
    encodings: [],
    interactiveFilters: [],
  },
};
