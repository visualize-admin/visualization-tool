/* eslint-disable no-redeclare */
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { useMemo } from "react";

import { Dimension, Measure, ObservationValue } from "@/domain/data";
import { mkJoinById } from "@/graphql/join";

const DimensionType = t.union([
  t.literal("NominalDimension"),
  t.literal("OrdinalDimension"),
  t.literal("TemporalDimension"),
  t.literal("TemporalEntityDimension"),
  t.literal("TemporalOrdinalDimension"),
  t.literal("GeoCoordinatesDimension"),
  t.literal("GeoShapesDimension"),
  t.literal("StandardErrorDimension"),
]);
export type DimensionType = t.TypeOf<typeof DimensionType>;

const MeasureType = t.union([
  t.literal("NumericalMeasure"),
  t.literal("OrdinalMeasure"),
]);
export type MeasureType = t.TypeOf<typeof MeasureType>;

const ComponentType = t.union([DimensionType, MeasureType]);
export type ComponentType = t.TypeOf<typeof ComponentType>;

// Filters
const FilterValueMulti = t.intersection([
  t.type(
    {
      type: t.literal("multi"),
      values: t.record(t.string, t.literal(true)), // undefined values will be removed when serializing to JSON
    },
    "FilterValueMulti"
  ),
  t.partial({
    position: t.number,
  }),
]);
export type FilterValueMulti = t.TypeOf<typeof FilterValueMulti>;

export const makeMultiFilter = (
  values: ObservationValue[]
): FilterValueMulti => {
  return {
    type: "multi",
    values: Object.fromEntries(values.map((d) => [d, true])),
  };
};

const FilterValueSingle = t.intersection([
  t.type(
    {
      type: t.literal("single"),
      value: t.union([t.string, t.number]),
    },
    "FilterValueSingle"
  ),
  t.partial({
    position: t.number,
  }),
]);
export type FilterValueSingle = t.TypeOf<typeof FilterValueSingle>;

const isFilterValueSingle = (
  filterValue: FilterValue
): filterValue is FilterValueSingle => {
  return filterValue.type === "single";
};

const FilterValueRange = t.intersection([
  t.type(
    {
      type: t.literal("range"),
      from: t.string,
      to: t.string,
    },
    "FilterValueRange"
  ),
  t.partial({
    position: t.number,
  }),
]);
export type FilterValueRange = t.TypeOf<typeof FilterValueRange>;

const FilterValue = t.union(
  [FilterValueSingle, FilterValueMulti, FilterValueRange],
  "FilterValue"
);
export type FilterValue = t.TypeOf<typeof FilterValue>;

export type FilterValueType = FilterValue["type"];

export type FilterValueMultiValues = FilterValueMulti["values"];

const Filters = t.record(t.string, FilterValue, "Filters");
export type Filters = t.TypeOf<typeof Filters>;

const SingleFilters = t.record(t.string, FilterValueSingle, "SingleFilters");
export type SingleFilters = t.TypeOf<typeof SingleFilters>;

export const isSingleFilters = (filters: Filters): filters is SingleFilters => {
  return Object.values(filters).every(isFilterValueSingle);
};
export const extractSingleFilters = (filters: Filters): SingleFilters => {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value.type === "single")
  ) as SingleFilters;
};

// Meta
const Title = t.type({
  de: t.string,
  fr: t.string,
  it: t.string,
  en: t.string,
});
export type Title = t.TypeOf<typeof Title>;
const Description = t.type({
  de: t.string,
  fr: t.string,
  it: t.string,
  en: t.string,
});
const Meta = t.type({ title: Title, description: Description });
export type Meta = t.TypeOf<typeof Meta>;
export type MetaKey = keyof Meta;

const InteractiveFiltersLegend = t.type({
  active: t.boolean,
  componentIri: t.string,
});
export type InteractiveFiltersLegend = t.TypeOf<
  typeof InteractiveFiltersLegend
>;

const InteractiveFiltersTimeRange = t.type({
  active: t.boolean,
  componentIri: t.string,
  presets: t.type({
    type: t.literal("range"),
    from: t.string,
    to: t.string,
  }),
});
export type InteractiveFiltersTimeRange = t.TypeOf<
  typeof InteractiveFiltersTimeRange
>;

const InteractiveFiltersDataConfig = t.type({
  active: t.boolean,
  componentIris: t.array(t.string),
});
export type InteractiveFiltersDataConfig = t.TypeOf<
  typeof InteractiveFiltersDataConfig
>;

const CalculationType = t.union([t.literal("identity"), t.literal("percent")]);
export type CalculationType = t.TypeOf<typeof CalculationType>;

const InteractiveFiltersCalculation = t.type({
  active: t.boolean,
  type: CalculationType,
});
export type InteractiveFiltersCalculation = t.TypeOf<
  typeof InteractiveFiltersCalculation
>;

const InteractiveFiltersConfig = t.union([
  t.type({
    legend: InteractiveFiltersLegend,
    timeRange: InteractiveFiltersTimeRange,
    dataFilters: InteractiveFiltersDataConfig,
    calculation: InteractiveFiltersCalculation,
  }),
  t.undefined,
]);
export type InteractiveFiltersConfig = t.TypeOf<
  typeof InteractiveFiltersConfig
>;

// Chart Config
const SortingOrder = t.union([t.literal("asc"), t.literal("desc")]);
export type SortingOrder = t.TypeOf<typeof SortingOrder>;

const SortingType = t.union([
  t.literal("byDimensionLabel"),
  t.literal("byMeasure"),
  t.literal("byTotalSize"),
  t.literal("byAuto"),
]);
export type SortingType = t.TypeOf<typeof SortingType>;

const ColorMapping = t.record(t.string, t.string);
export type ColorMapping = t.TypeOf<typeof ColorMapping>;

const GenericField = t.intersection([
  t.type({ componentIri: t.string }),
  t.partial({ useAbbreviations: t.boolean }),
]);
export type GenericField = t.TypeOf<typeof GenericField>;

const GenericFields = t.record(t.string, t.union([GenericField, t.undefined]));
export type GenericFields = t.TypeOf<typeof GenericFields>;

const GenericSegmentField = t.intersection([
  GenericField,
  t.type({
    palette: t.string,
  }),
  t.partial({
    colorMapping: ColorMapping,
  }),
]);
export type GenericSegmentField = t.TypeOf<typeof GenericSegmentField>;

const AnimationType = t.union([t.literal("continuous"), t.literal("stepped")]);
export type AnimationType = t.TypeOf<typeof AnimationType>;

const AnimationField = t.intersection([
  GenericField,
  t.type({
    showPlayButton: t.boolean,
    type: AnimationType,
    duration: t.number,
    dynamicScales: t.boolean,
  }),
]);
export type AnimationField = t.TypeOf<typeof AnimationField>;

const SortingField = t.partial({
  sorting: t.type({
    sortingType: SortingType,
    sortingOrder: SortingOrder,
  }),
});
export type SortingField = t.TypeOf<typeof SortingField>;

const Cube = t.intersection([
  t.type({
    /** The IRI of the cube, used for querying */
    iri: t.string,
    /** The IRI of the cube used when first published */
    publishIri: t.string,
    filters: Filters,
  }),
  t.partial({
    joinBy: t.array(t.string),
  }),
]);
export type Cube = t.TypeOf<typeof Cube>;

const GenericChartConfig = t.type({
  key: t.string,
  version: t.string,
  meta: Meta,
  cubes: t.array(Cube),
  activeField: t.union([t.string, t.undefined]),
});

export type GenericChartConfig = t.TypeOf<typeof GenericChartConfig>;

const ChartSubType = t.union([t.literal("stacked"), t.literal("grouped")]);
export type ChartSubType = t.TypeOf<typeof ChartSubType>;

const ColumnSegmentField = t.intersection([
  GenericSegmentField,
  SortingField,
  t.type({ type: ChartSubType }),
]);
export type ColumnSegmentField = t.TypeOf<typeof ColumnSegmentField>;

const ColumnFields = t.intersection([
  t.type({
    x: t.intersection([GenericField, SortingField]),
    y: GenericField,
  }),
  t.partial({
    segment: ColumnSegmentField,
    animation: AnimationField,
  }),
]);
const ColumnConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("column"),
      interactiveFiltersConfig: InteractiveFiltersConfig,
      fields: ColumnFields,
    },
    "ColumnConfig"
  ),
]);
export type ColumnFields = t.TypeOf<typeof ColumnFields>;
export type ColumnConfig = t.TypeOf<typeof ColumnConfig>;

const LineSegmentField = t.intersection([GenericSegmentField, SortingField]);
export type LineSegmentField = t.TypeOf<typeof LineSegmentField>;

const LineFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),
  t.partial({
    segment: LineSegmentField,
  }),
]);
const LineConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("line"),
      interactiveFiltersConfig: InteractiveFiltersConfig,
      fields: LineFields,
    },
    "LineConfig"
  ),
]);
export type LineFields = t.TypeOf<typeof LineFields>;
export type LineConfig = t.TypeOf<typeof LineConfig>;

const AreaSegmentField = t.intersection([GenericSegmentField, SortingField]);
export type AreaSegmentField = t.TypeOf<typeof AreaSegmentField>;

const ImputationType = t.union([
  t.literal("none"),
  t.literal("zeros"),
  t.literal("linear"),
]);
export type ImputationType = t.TypeOf<typeof ImputationType>;
export const imputationTypes: ImputationType[] = ["none", "zeros", "linear"];

const AreaFields = t.intersection([
  t.type({
    x: GenericField,
    y: t.intersection([
      GenericField,
      t.partial({ imputationType: ImputationType }),
    ]),
  }),
  t.partial({
    segment: AreaSegmentField,
  }),
]);
const AreaConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("area"),
      interactiveFiltersConfig: InteractiveFiltersConfig,
      fields: AreaFields,
    },
    "AreaConfig"
  ),
]);
export type AreaFields = t.TypeOf<typeof AreaFields>;
export type AreaConfig = t.TypeOf<typeof AreaConfig>;

const ScatterPlotSegmentField = GenericSegmentField;
export type ScatterPlotSegmentField = t.TypeOf<typeof ScatterPlotSegmentField>;

const ScatterPlotFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),
  t.partial({
    segment: ScatterPlotSegmentField,
    animation: AnimationField,
  }),
]);
const ScatterPlotConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("scatterplot"),
      interactiveFiltersConfig: InteractiveFiltersConfig,
      fields: ScatterPlotFields,
    },
    "ScatterPlotConfig"
  ),
]);
export type ScatterPlotFields = t.TypeOf<typeof ScatterPlotFields>;
export type ScatterPlotConfig = t.TypeOf<typeof ScatterPlotConfig>;

const PieSegmentField = t.intersection([GenericSegmentField, SortingField]);
export type PieSegmentField = t.TypeOf<typeof PieSegmentField>;

const PieFields = t.intersection([
  t.type({
    y: GenericField,
    segment: PieSegmentField,
  }),
  t.partial({ animation: AnimationField }),
]);
const PieConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("pie"),
      interactiveFiltersConfig: InteractiveFiltersConfig,
      fields: PieFields,
    },
    "PieConfig"
  ),
]);
export type PieFields = t.TypeOf<typeof PieFields>;
export type PieConfig = t.TypeOf<typeof PieConfig>;

const DivergingPaletteType = t.union([
  t.literal("BrBG"),
  t.literal("PiYG"),
  t.literal("PRGn"),
  t.literal("PuOr"),
  t.literal("RdBu"),
  t.literal("RdYlBu"),
  t.literal("RdYlGn"),
]);

export type DivergingPaletteType = t.TypeOf<typeof DivergingPaletteType>;

const SequentialPaletteType = t.union([
  t.literal("blues"),
  t.literal("greens"),
  t.literal("greys"),
  t.literal("oranges"),
  t.literal("purples"),
  t.literal("reds"),
]);

export type SequentialPaletteType = t.TypeOf<typeof SequentialPaletteType>;

export type PaletteType = DivergingPaletteType | SequentialPaletteType;

const ColorScaleType = t.union([
  t.literal("continuous"),
  t.literal("discrete"),
]);
export type ColorScaleType = t.TypeOf<typeof ColorScaleType>;

const ColorScaleInterpolationType = t.union([
  t.literal("linear"),
  t.literal("quantize"),
  t.literal("quantile"),
  t.literal("jenks"),
]);
export type ColorScaleInterpolationType = t.TypeOf<
  typeof ColorScaleInterpolationType
>;

const ColumnTextStyle = t.union([t.literal("regular"), t.literal("bold")]);

const ColumnStyleText = t.type({
  type: t.literal("text"),
  textStyle: ColumnTextStyle,
  textColor: t.string,
  columnColor: t.string,
});
const ColumnStyleCategory = t.type({
  type: t.literal("category"),
  textStyle: ColumnTextStyle,
  palette: t.string,
  colorMapping: ColorMapping,
});
const ColumnStyleHeatmap = t.type({
  type: t.literal("heatmap"),
  textStyle: ColumnTextStyle,
  palette: DivergingPaletteType,
});
const ColumnStyleBar = t.type({
  type: t.literal("bar"),
  textStyle: ColumnTextStyle,
  barColorPositive: t.string,
  barColorNegative: t.string,
  barColorBackground: t.string,
  barShowBackground: t.boolean,
});
const ColumnStyle = t.union([
  ColumnStyleText,
  ColumnStyleCategory,
  ColumnStyleHeatmap,
  ColumnStyleBar,
]);
export type ColumnStyle = t.TypeOf<typeof ColumnStyle>;

export type ColumnStyleText = t.TypeOf<typeof ColumnStyleText>;
export type ColumnStyleCategory = t.TypeOf<typeof ColumnStyleCategory>;
export type ColumnStyleHeatmap = t.TypeOf<typeof ColumnStyleHeatmap>;
export type ColumnStyleBar = t.TypeOf<typeof ColumnStyleBar>;

const TableColumn = t.type({
  componentIri: t.string,
  componentType: ComponentType,
  index: t.number,
  isGroup: t.boolean,
  isHidden: t.boolean,
  columnStyle: ColumnStyle,
});
export type TableColumn = t.TypeOf<typeof TableColumn>;
const TableSettings = t.type({
  showSearch: t.boolean,
  showAllRows: t.boolean,
});
export type TableSettings = t.TypeOf<typeof TableSettings>;
const TableFields = t.record(t.string, TableColumn);

const TableSortingOption = t.type({
  componentIri: t.string,
  componentType: ComponentType,
  sortingOrder: SortingOrder,
});
export type TableSortingOption = t.TypeOf<typeof TableSortingOption>;

const TableConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("table"),
      fields: TableFields,
      settings: TableSettings,
      sorting: t.array(TableSortingOption),
      interactiveFiltersConfig: t.undefined,
    },
    "TableConfig"
  ),
]);
export type TableFields = t.TypeOf<typeof TableFields>;
export type TableConfig = t.TypeOf<typeof TableConfig>;

const BBox = t.tuple([
  t.tuple([t.number, t.number]),
  t.tuple([t.number, t.number]),
]);
export type BBox = t.TypeOf<typeof BBox>;

const ColorFieldOpacity = t.type({
  opacity: t.number,
});
export type ColorFieldOpacity = t.TypeOf<typeof ColorFieldOpacity>;

const ColorFieldType = t.union([
  t.literal("fixed"),
  t.literal("categorical"),
  t.literal("numerical"),
]);
export type ColorFieldType = t.TypeOf<typeof ColorFieldType>;

const FixedColorField = t.intersection([
  t.type({
    type: t.literal("fixed"),
    value: t.string,
  }),
  ColorFieldOpacity,
]);
export type FixedColorField = t.TypeOf<typeof FixedColorField>;

const CategoricalColorField = t.intersection([
  t.type({
    type: t.literal("categorical"),
    componentIri: t.string,
    palette: t.string,
    colorMapping: ColorMapping,
  }),
  t.partial({ useAbbreviations: t.boolean }),
  ColorFieldOpacity,
]);

export type CategoricalColorField = t.TypeOf<typeof CategoricalColorField>;

const NumericalColorField = t.intersection([
  t.type({
    type: t.literal("numerical"),
    componentIri: t.string,
    palette: t.union([DivergingPaletteType, SequentialPaletteType]),
  }),
  t.union([
    t.type({
      scaleType: t.literal("continuous"),
      interpolationType: t.literal("linear"),
    }),
    t.type({
      scaleType: t.literal("discrete"),
      interpolationType: t.union([
        t.literal("quantize"),
        t.literal("quantile"),
        t.literal("jenks"),
      ]),
      nbClass: t.number,
    }),
  ]),
  ColorFieldOpacity,
]);
export type NumericalColorField = t.TypeOf<typeof NumericalColorField>;

export type ColorField =
  | FixedColorField
  | CategoricalColorField
  | NumericalColorField;

const MapAreaLayer = t.type({
  componentIri: t.string,
  color: t.union([CategoricalColorField, NumericalColorField]),
});
export type MapAreaLayer = t.TypeOf<typeof MapAreaLayer>;

const MapSymbolLayer = t.type({
  componentIri: t.string,
  // symbol radius (size)
  measureIri: t.string,
  color: t.union([FixedColorField, CategoricalColorField, NumericalColorField]),
});
export type MapSymbolLayer = t.TypeOf<typeof MapSymbolLayer>;

const BaseLayer = t.type({
  show: t.boolean,
  locked: t.boolean,
  bbox: t.union([BBox, t.undefined]),
});
export type BaseLayer = t.TypeOf<typeof BaseLayer>;

const MapFields = t.partial({
  areaLayer: MapAreaLayer,
  symbolLayer: MapSymbolLayer,
  animation: AnimationField,
});
export type MapFields = t.TypeOf<typeof MapFields>;

const MapConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("map"),
      interactiveFiltersConfig: InteractiveFiltersConfig,
      fields: MapFields,
      baseLayer: BaseLayer,
    },
    "MapConfig"
  ),
]);
export type MapConfig = t.TypeOf<typeof MapConfig>;

const ComboLineSingleFields = t.type({
  x: GenericField,
  y: t.type({
    componentIris: t.array(t.string),
    palette: t.string,
    colorMapping: ColorMapping,
  }),
});
export type ComboLineSingleFields = t.TypeOf<typeof ComboLineSingleFields>;

const ComboLineSingleConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("comboLineSingle"),
      fields: ComboLineSingleFields,
      interactiveFiltersConfig: InteractiveFiltersConfig,
    },
    "ComboLineSingleConfig"
  ),
]);
export type ComboLineSingleConfig = t.TypeOf<typeof ComboLineSingleConfig>;

const ComboLineDualFields = t.type({
  x: GenericField,
  y: t.type({
    leftAxisComponentIri: t.string,
    rightAxisComponentIri: t.string,
    palette: t.string,
    colorMapping: ColorMapping,
  }),
});
export type ComboLineDualFields = t.TypeOf<typeof ComboLineDualFields>;

const ComboLineDualConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("comboLineDual"),
      fields: ComboLineDualFields,
      interactiveFiltersConfig: InteractiveFiltersConfig,
    },
    "ComboLineDualConfig"
  ),
]);
export type ComboLineDualConfig = t.TypeOf<typeof ComboLineDualConfig>;

const ComboLineColumnFields = t.type({
  x: GenericField,
  y: t.type({
    lineComponentIri: t.string,
    lineAxisOrientation: t.union([t.literal("left"), t.literal("right")]),
    columnComponentIri: t.string,
    palette: t.string,
    colorMapping: ColorMapping,
  }),
});

export type ComboLineColumnFields = t.TypeOf<typeof ComboLineColumnFields>;

const ComboLineColumnConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("comboLineColumn"),
      fields: ComboLineColumnFields,
      interactiveFiltersConfig: InteractiveFiltersConfig,
    },
    "ComboLineColumnConfig"
  ),
]);
export type ComboLineColumnConfig = t.TypeOf<typeof ComboLineColumnConfig>;

export type ChartSegmentField =
  | AreaSegmentField
  | ColumnSegmentField
  | LineSegmentField
  | PieSegmentField
  | ScatterPlotSegmentField;

const RegularChartConfig = t.union([
  AreaConfig,
  ColumnConfig,
  LineConfig,
  MapConfig,
  PieConfig,
  ScatterPlotConfig,
  TableConfig,
]);
export type RegularChartConfig = t.TypeOf<typeof RegularChartConfig>;

const ComboChartConfig = t.union([
  ComboLineSingleConfig,
  ComboLineDualConfig,
  ComboLineColumnConfig,
]);
export type ComboChartConfig = t.TypeOf<typeof ComboChartConfig>;

const ChartConfig = t.union([RegularChartConfig, ComboChartConfig]);
export type ChartConfig = t.TypeOf<typeof ChartConfig>;

export const decodeChartConfig = (
  chartConfig: unknown
): ChartConfig | undefined => {
  return pipe(
    ChartConfig.decode(chartConfig),
    fold(
      (err) => {
        console.error("Error while decoding chart config", err);
        return undefined;
      },
      (d) => d
    )
  );
};

export type ChartType = ChartConfig["chartType"];
export type RegularChartType = RegularChartConfig["chartType"];
export type ComboChartType = ComboChartConfig["chartType"];

export const isComboChartConfig = (
  chartConfig: ChartConfig
): chartConfig is ComboChartConfig => {
  return (
    isComboLineSingleConfig(chartConfig) ||
    isComboLineDualConfig(chartConfig) ||
    isComboLineColumnConfig(chartConfig)
  );
};

export const isAreaConfig = (
  chartConfig: ChartConfig
): chartConfig is AreaConfig => {
  return chartConfig.chartType === "area";
};

export const isColumnConfig = (
  chartConfig: ChartConfig
): chartConfig is ColumnConfig => {
  return chartConfig.chartType === "column";
};

export const isComboLineSingleConfig = (
  chartConfig: ChartConfig
): chartConfig is ComboLineSingleConfig => {
  return chartConfig.chartType === "comboLineSingle";
};

export const isComboLineDualConfig = (
  chartConfig: ChartConfig
): chartConfig is ComboLineDualConfig => {
  return chartConfig.chartType === "comboLineDual";
};

export const isComboLineColumnConfig = (
  chartConfig: ChartConfig
): chartConfig is ComboLineColumnConfig => {
  return chartConfig.chartType === "comboLineColumn";
};

export const isLineConfig = (
  chartConfig: ChartConfig
): chartConfig is LineConfig => {
  return chartConfig.chartType === "line";
};

export const isScatterPlotConfig = (
  chartConfig: ChartConfig
): chartConfig is ScatterPlotConfig => {
  return chartConfig.chartType === "scatterplot";
};

export const isPieConfig = (
  chartConfig: ChartConfig
): chartConfig is PieConfig => {
  return chartConfig.chartType === "pie";
};

export const isTableConfig = (
  chartConfig: ChartConfig
): chartConfig is TableConfig => {
  return chartConfig.chartType === "table";
};

export const isMapConfig = (
  chartConfig: ChartConfig
): chartConfig is MapConfig => {
  return chartConfig.chartType === "map";
};

export const canBeNormalized = (
  chartConfig: ChartConfig
): chartConfig is AreaConfig | ColumnConfig => {
  return (
    chartConfig.chartType === "area" ||
    (chartConfig.chartType === "column" &&
      chartConfig.fields.segment !== undefined &&
      chartConfig.fields.segment.type === "stacked")
  );
};

export const isSegmentInConfig = (
  chartConfig: ChartConfig
): chartConfig is
  | AreaConfig
  | ColumnConfig
  | LineConfig
  | PieConfig
  | ScatterPlotConfig => {
  return ["area", "column", "line", "pie", "scatterplot"].includes(
    chartConfig.chartType
  );
};

export const isSortingInConfig = (
  chartConfig: ChartConfig
): chartConfig is AreaConfig | ColumnConfig | LineConfig | PieConfig => {
  return ["area", "column", "line", "pie"].includes(chartConfig.chartType);
};

export const isAnimationInConfig = (
  chartConfig: ChartConfig
): chartConfig is ColumnConfig | MapConfig | PieConfig | ScatterPlotConfig => {
  return ["column", "map", "pie", "scatterplot"].includes(
    chartConfig.chartType
  );
};

export const getAnimationField = (
  chartConfig: ChartConfig
): AnimationField | undefined => {
  if (isAnimationInConfig(chartConfig)) {
    return chartConfig.fields.animation;
  }
};

export const isColorFieldInConfig = (
  chartConfig: ChartConfig
): chartConfig is MapConfig => {
  return isMapConfig(chartConfig);
};

// Chart Config Adjusters
export type FieldAdjuster<
  NewChartConfigType extends ChartConfig,
  OldValueType extends unknown,
> = (params: {
  oldValue: OldValueType;
  oldChartConfig: ChartConfig;
  newChartConfig: NewChartConfigType;
  dimensions: Dimension[];
  measures: Measure[];
}) => NewChartConfigType;

type AssureKeys<T, U extends { [K in keyof T]: unknown }> = {
  [K in keyof T]: U[K];
};

export type InteractiveFiltersAdjusters = AssureKeys<
  InteractiveFiltersConfig,
  _InteractiveFiltersAdjusters
>;

type _InteractiveFiltersAdjusters = {
  legend: FieldAdjuster<ChartConfig, InteractiveFiltersLegend>;
  timeRange: {
    active: FieldAdjuster<ChartConfig, boolean>;
    componentIri: FieldAdjuster<ChartConfig, string>;
    presets: {
      type: FieldAdjuster<ChartConfig, "range">;
      from: FieldAdjuster<ChartConfig, string>;
      to: FieldAdjuster<ChartConfig, string>;
    };
  };
  dataFilters: FieldAdjuster<ChartConfig, InteractiveFiltersDataConfig>;
  calculation: FieldAdjuster<ChartConfig, InteractiveFiltersCalculation>;
};

type BaseAdjusters<NewChartConfigType extends ChartConfig> = {
  cubes: FieldAdjuster<NewChartConfigType, GenericChartConfig["cubes"]>;
  interactiveFiltersConfig: InteractiveFiltersAdjusters;
};

type ColumnAdjusters = BaseAdjusters<ColumnConfig> & {
  fields: {
    x: { componentIri: FieldAdjuster<ColumnConfig, string> };
    y: { componentIri: FieldAdjuster<ColumnConfig, string> };
    segment: FieldAdjuster<
      ColumnConfig,
      | LineSegmentField
      | AreaSegmentField
      | ScatterPlotSegmentField
      | PieSegmentField
      | TableFields
    >;
    animation: FieldAdjuster<ColumnConfig, AnimationField | undefined>;
  };
};

type LineAdjusters = BaseAdjusters<LineConfig> & {
  fields: {
    x: { componentIri: FieldAdjuster<LineConfig, string> };
    y: { componentIri: FieldAdjuster<LineConfig, string> };
    segment: FieldAdjuster<
      LineConfig,
      | ColumnSegmentField
      | AreaSegmentField
      | ScatterPlotSegmentField
      | PieSegmentField
      | TableFields
    >;
  };
};

type AreaAdjusters = BaseAdjusters<AreaConfig> & {
  fields: {
    x: { componentIri: FieldAdjuster<AreaConfig, string> };
    y: { componentIri: FieldAdjuster<AreaConfig, string> };
    segment: FieldAdjuster<
      AreaConfig,
      | ColumnSegmentField
      | LineSegmentField
      | ScatterPlotSegmentField
      | PieSegmentField
      | TableFields
    >;
  };
};

type ScatterPlotAdjusters = BaseAdjusters<ScatterPlotConfig> & {
  fields: {
    y: { componentIri: FieldAdjuster<ScatterPlotConfig, string> };
    segment: FieldAdjuster<
      ScatterPlotConfig,
      | ColumnSegmentField
      | LineSegmentField
      | AreaSegmentField
      | PieSegmentField
      | TableFields
    >;
    animation: FieldAdjuster<ScatterPlotConfig, AnimationField | undefined>;
  };
};

type PieAdjusters = BaseAdjusters<PieConfig> & {
  fields: {
    y: { componentIri: FieldAdjuster<PieConfig, string> };
    segment: FieldAdjuster<
      PieConfig,
      | ColumnSegmentField
      | LineSegmentField
      | AreaSegmentField
      | ScatterPlotSegmentField
      | TableFields
    >;
    animation: FieldAdjuster<PieConfig, AnimationField | undefined>;
  };
};

type TableAdjusters = {
  cubes: FieldAdjuster<TableConfig, GenericChartConfig["cubes"]>;
  fields: FieldAdjuster<
    TableConfig,
    | ColumnSegmentField
    | LineSegmentField
    | AreaSegmentField
    | ScatterPlotSegmentField
    | PieSegmentField
  >;
};

type MapAdjusters = BaseAdjusters<MapConfig> & {
  fields: {
    areaLayer: {
      componentIri: FieldAdjuster<MapConfig, string>;
      color: {
        componentIri: FieldAdjuster<MapConfig, string>;
      };
    };
    animation: FieldAdjuster<MapConfig, AnimationField | undefined>;
  };
};

type ComboLineSingleAdjusters = BaseAdjusters<ComboLineSingleConfig> & {
  fields: {
    x: { componentIri: FieldAdjuster<ComboLineSingleConfig, string> };
    y: { componentIris: FieldAdjuster<ComboLineSingleConfig, string> };
  };
};

type ComboLineDualAdjusters = BaseAdjusters<ComboLineDualConfig> & {
  fields: {
    x: { componentIri: FieldAdjuster<ComboLineDualConfig, string> };
    y: FieldAdjuster<
      ComboLineDualConfig,
      | AreaFields
      | ColumnFields
      | LineFields
      | MapFields
      | PieFields
      | ScatterPlotFields
      | TableFields
      | ComboLineSingleFields
      | ComboLineColumnFields
    >;
  };
};

type ComboLineColumnAdjusters = BaseAdjusters<ComboLineColumnConfig> & {
  fields: {
    x: { componentIri: FieldAdjuster<ComboLineColumnConfig, string> };
    y: FieldAdjuster<
      ComboLineColumnConfig,
      | AreaFields
      | ColumnFields
      | LineFields
      | MapFields
      | PieFields
      | ScatterPlotFields
      | TableFields
      | ComboLineSingleFields
      | ComboLineDualFields
    >;
  };
};

export type ChartConfigsAdjusters = {
  column: ColumnAdjusters;
  line: LineAdjusters;
  area: AreaAdjusters;
  scatterplot: ScatterPlotAdjusters;
  pie: PieAdjusters;
  table: TableAdjusters;
  map: MapAdjusters;
  comboLineSingle: ComboLineSingleAdjusters;
  comboLineDual: ComboLineDualAdjusters;
  comboLineColumn: ComboLineColumnAdjusters;
};

const DataSource = t.type({
  type: t.union([t.literal("sql"), t.literal("sparql")]),
  url: t.string,
});
export type DataSource = t.TypeOf<typeof DataSource>;

const ResizeHandle = t.keyof({
  s: null,
  w: null,
  e: null,
  n: null,
  sw: null,
  nw: null,
  se: null,
  ne: null,
});

const ReactGridLayoutType = t.type({
  w: t.number,
  h: t.number,
  x: t.number,
  y: t.number,
  i: t.string,
  resizeHandles: t.union([t.array(ResizeHandle), t.undefined]),
});

export const ReactGridLayoutsType = t.record(
  t.string,
  t.array(ReactGridLayoutType)
);

const Layout = t.intersection([
  t.type({
    activeField: t.union([t.undefined, t.string]),
    meta: Meta,
  }),
  t.union([
    t.type({
      type: t.literal("tab"),
    }),
    t.type({
      type: t.literal("dashboard"),
      layout: t.union([t.literal("vertical"), t.literal("tall")]),
    }),
    t.type({
      type: t.literal("dashboard"),
      layout: t.literal("canvas"),
      layouts: ReactGridLayoutsType,
    }),
    t.type({
      type: t.literal("singleURLs"),
      publishableChartKeys: t.array(t.string),
    }),
  ]),
]);
export type Layout = t.TypeOf<typeof Layout>;
export type LayoutType = Layout["type"];
export type LayoutDashboard = Extract<Layout, { type: "dashboard" }>;

const DashboardTimeRangeFilter = t.type({
  active: t.boolean,
  timeUnit: t.string,
  presets: t.type({
    from: t.string,
    to: t.string,
  }),
});
export type DashboardTimeRangeFilter = t.TypeOf<
  typeof DashboardTimeRangeFilter
>;

const DashboardDataFiltersConfig = t.type({
  componentIris: t.array(t.string),
  filters: SingleFilters,
});
export type DashboardDataFiltersConfig = t.TypeOf<
  typeof DashboardDataFiltersConfig
>;

const DashboardFiltersConfig = t.type({
  timeRange: DashboardTimeRangeFilter,
  dataFilters: DashboardDataFiltersConfig,
});
export type DashboardFiltersConfig = t.TypeOf<typeof DashboardFiltersConfig>;

const Config = t.intersection([
  t.type(
    {
      version: t.string,
      dataSource: DataSource,
      layout: Layout,
      chartConfigs: t.array(ChartConfig),
      activeChartKey: t.string,
      dashboardFilters: t.union([DashboardFiltersConfig, t.undefined]),
    },
    "Config"
  ),
  t.partial({ key: t.string }),
]);

export type Config = t.TypeOf<typeof Config>;

const ConfiguratorStateInitial = t.type({
  state: t.literal("INITIAL"),
  version: t.string,
  dataSource: DataSource,
});
export type ConfiguratorStateInitial = t.TypeOf<
  typeof ConfiguratorStateInitial
>;

const ConfiguratorStateSelectingDataSet = t.type({
  state: t.literal("SELECTING_DATASET"),
  version: t.string,
  dataSource: DataSource,
  chartConfigs: t.undefined,
  layout: t.undefined,
  activeChartKey: t.undefined,
});
export type ConfiguratorStateSelectingDataSet = t.TypeOf<
  typeof ConfiguratorStateSelectingDataSet
>;

const ConfiguratorStateConfiguringChart = t.intersection([
  t.type({ state: t.literal("CONFIGURING_CHART") }),
  Config,
]);
export type ConfiguratorStateConfiguringChart = t.TypeOf<
  typeof ConfiguratorStateConfiguringChart
>;

export const CONFIGURATOR_STATE_LAYOUTING = "LAYOUTING";

const ConfiguratorStateLayouting = t.intersection([
  t.type({ state: t.literal(CONFIGURATOR_STATE_LAYOUTING) }),
  Config,
]);
export type ConfiguratorStateLayouting = t.TypeOf<
  typeof ConfiguratorStateLayouting
>;

export const enableLayouting = (
  state:
    | ConfiguratorStateConfiguringChart
    | ConfiguratorStateLayouting
    | ConfiguratorStatePublishing
    | ConfiguratorStatePublished
) => {
  return state.chartConfigs.length > 1;
};

const ConfiguratorStatePublishing = t.intersection([
  t.type({
    state: t.literal("PUBLISHING"),
  }),
  Config,
]);
export type ConfiguratorStatePublishing = t.TypeOf<
  typeof ConfiguratorStatePublishing
>;

const ConfiguratorStatePublished = t.intersection([
  t.type({
    state: t.literal("PUBLISHED"),
  }),
  Config,
]);
export type ConfiguratorStatePublished = t.TypeOf<
  typeof ConfiguratorStatePublished
>;

const ConfiguratorState = t.union([
  ConfiguratorStateInitial,
  ConfiguratorStateSelectingDataSet,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateLayouting,
  ConfiguratorStatePublishing,
  ConfiguratorStatePublished,
]);
export type ConfiguratorState = t.TypeOf<typeof ConfiguratorState>;

export const decodeConfiguratorState = (
  state: unknown
): ConfiguratorState | undefined => {
  return pipe(
    ConfiguratorState.decode(state),
    fold(
      (err) => {
        console.error("Error while decoding configurator state", err);
        return undefined;
      },
      (d) => d
    )
  );
};

/** Use to extract the chart config from configurator state. Handy in the editor mode,
 * where the is a need to edit the active chart config.
 *
 * @param state configurator state
 * @param chartKey optional chart key. If not provided, the active chart config will be returned.
 *
 */
export const getChartConfig = (
  state: ConfiguratorState,
  chartKey?: string | null
): ChartConfig => {
  if (state.state === "INITIAL" || state.state === "SELECTING_DATASET") {
    throw new Error("No chart config available!");
  }

  const { chartConfigs, activeChartKey } = state;
  const key = chartKey ?? activeChartKey;

  return chartConfigs.find((d) => d.key === key) ?? chartConfigs[0];
};

/**
 * Get all filters from cubes and returns an object containing all values.
 */
export const getChartConfigFilters = (
  cubes: Cube[],
  {
    cubeIri,
    joined,
  }: {
    /** If passed, only filters for a particular cube will be considered */
    cubeIri?: string;
    /**
     * If true, filters for joined dimensions will be deduped. Useful in contexts where filters
     * for multiple join dimensions should be considered unique (for example, in the left data filters).
     */
    joined?: boolean;
  } = {}
): Filters => {
  const relevantCubes = cubes.filter((c) =>
    cubeIri ? c.iri === cubeIri : true
  );
  const dimIriToJoinId = joined
    ? Object.fromEntries(
        relevantCubes.flatMap((x) =>
          (x.joinBy ?? []).map(
            (iri, index) => [iri, mkJoinById(index)] as const
          )
        )
      )
    : {};
  return Object.fromEntries(
    relevantCubes.flatMap((c) =>
      Object.entries(c.filters).map(([iri, value]) => [
        dimIriToJoinId[iri] ?? iri,
        value,
      ])
    )
  );
};

export const useChartConfigFilters = (
  chartConfig: ChartConfig,
  options?: Parameters<typeof getChartConfigFilters>[1]
): Filters => {
  return useMemo(() => {
    return getChartConfigFilters(chartConfig.cubes, {
      cubeIri: options?.cubeIri,
      joined: options?.joined,
    });
  }, [chartConfig.cubes, options?.cubeIri, options?.joined]);
};
