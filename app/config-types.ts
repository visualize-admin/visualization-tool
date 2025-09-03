/* eslint-disable no-redeclare */
import { PALETTE_TYPE } from "@prisma/client";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

const DimensionType = t.union([
  t.literal("NominalDimension"),
  t.literal("OrdinalDimension"),
  t.literal("TemporalDimension"),
  t.literal("TemporalEntityDimension"),
  t.literal("TemporalOrdinalDimension"),
  t.literal("GeoCoordinatesDimension"),
  t.literal("GeoShapesDimension"),
  t.literal("StandardErrorDimension"),
  t.literal("ConfidenceUpperBoundDimension"),
  t.literal("ConfidenceLowerBoundDimension"),
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
export type Description = t.TypeOf<typeof Description>;

const Label = t.type({
  de: t.string,
  fr: t.string,
  it: t.string,
  en: t.string,
});
export type Label = t.TypeOf<typeof Label>;

const Meta = t.type({
  title: Title,
  description: Description,
  label: Label,
});
export type Meta = t.TypeOf<typeof Meta>;
export type MetaKey = keyof Meta;

const InteractiveFiltersLegend = t.type({
  active: t.boolean,
  componentId: t.string,
});
export type InteractiveFiltersLegend = t.TypeOf<
  typeof InteractiveFiltersLegend
>;

const InteractiveFiltersTimeRange = t.type({
  active: t.boolean,
  componentId: t.string,
  presets: t.type({
    type: t.literal("range"),
    from: t.string,
    to: t.string,
  }),
});
export type InteractiveFiltersTimeRange = t.TypeOf<
  typeof InteractiveFiltersTimeRange
>;

const DefaultValueOverrides = t.record(t.string, t.array(t.string));
export type DefaultValueOverrides = t.TypeOf<typeof DefaultValueOverrides>;

const InteractiveDataFilterType = t.union([
  t.literal("single"),
  t.literal("multi"),
]);
export type InteractiveDataFilterType = t.TypeOf<
  typeof InteractiveDataFilterType
>;

const InteractiveFiltersDataConfig = t.intersection([
  t.type({
    active: t.boolean,
    componentIds: t.array(t.string),
    defaultValueOverrides: DefaultValueOverrides,
    filterTypes: t.record(t.string, InteractiveDataFilterType),
  }),
  t.partial({
    defaultOpen: t.boolean,
  }),
]);
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

const InteractiveFiltersConfig = t.type({
  legend: InteractiveFiltersLegend,
  timeRange: InteractiveFiltersTimeRange,
  dataFilters: InteractiveFiltersDataConfig,
  calculation: InteractiveFiltersCalculation,
});

export type InteractiveFiltersConfig = t.TypeOf<
  typeof InteractiveFiltersConfig
>;

// Chart Config
const ColorMapping = t.record(t.string, t.string);
export type ColorMapping = t.TypeOf<typeof ColorMapping>;

const SingleColorField = t.type({
  type: t.literal("single"),
  paletteId: t.string,
  color: t.string,
});
export type SingleColorField = t.TypeOf<typeof SingleColorField>;

const SegmentColorField = t.type({
  type: t.literal("segment"),
  paletteId: t.string,
  colorMapping: ColorMapping,
});
export type SegmentColorField = t.TypeOf<typeof SegmentColorField>;

const MeasuresColorField = t.type({
  type: t.literal("measures"),
  paletteId: t.string,
  colorMapping: ColorMapping,
});
export type MeasuresColorField = t.TypeOf<typeof MeasuresColorField>;

const ColorField = t.union([
  SingleColorField,
  SegmentColorField,
  MeasuresColorField,
]);
export type ColorField = t.TypeOf<typeof ColorField>;

const GenericField = t.intersection([
  t.type({ componentId: t.string }),
  t.partial({ useAbbreviations: t.boolean }),
]);
export type GenericField = t.TypeOf<typeof GenericField>;

const GenericFields = t.record(t.string, t.union([GenericField, t.undefined]));
export type GenericFields = t.TypeOf<typeof GenericFields>;

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

const SortingOrder = t.union([t.literal("asc"), t.literal("desc")]);
export type SortingOrder = t.TypeOf<typeof SortingOrder>;

const SortingType = t.union([
  t.literal("byDimensionLabel"),
  t.literal("byMeasure"),
  t.literal("byTotalSize"),
  t.literal("byAuto"),
]);
export type SortingType = t.TypeOf<typeof SortingType>;

const SortingField = t.partial({
  sorting: t.type({
    sortingType: SortingType,
    sortingOrder: SortingOrder,
  }),
});
export type SortingField = t.TypeOf<typeof SortingField>;

const ShowValuesBySegmentFieldExtension = t.type({
  showValuesMapping: t.record(t.string, t.boolean),
});
export type ShowValuesSegmentFieldExtension = t.TypeOf<
  typeof ShowValuesBySegmentFieldExtension
>;
export const shouldEnableSettingShowValuesBySegment = (
  chartConfig: ChartConfig
) => {
  return (
    (isBarConfig(chartConfig) || isColumnConfig(chartConfig)) &&
    chartConfig.fields.segment?.type === "stacked"
  );
};

const Cube = t.intersection([
  t.type({
    /** * Cube iri at publish time (stored in the database) and latest one on the client side. */
    iri: t.string,
    filters: Filters,
  }),
  t.partial({
    joinBy: t.array(t.string),
  }),
]);
export type Cube = t.TypeOf<typeof Cube>;

const AnnotationTarget = t.type({
  componentId: t.string,
  value: t.string,
});
export type AnnotationTarget = t.TypeOf<typeof AnnotationTarget>;

const HighlightAnnotation = t.type({
  key: t.string,
  type: t.literal("highlight"),
  targets: t.array(AnnotationTarget),
  text: t.type({
    de: t.string,
    fr: t.string,
    it: t.string,
    en: t.string,
  }),
  highlightType: t.union([t.literal("none"), t.literal("filled")]),
  color: t.union([t.string, t.undefined]),
  defaultOpen: t.boolean,
});
export type HighlightAnnotation = t.TypeOf<typeof HighlightAnnotation>;

const Annotation = HighlightAnnotation;
export type Annotation = t.TypeOf<typeof Annotation>;

export const supportsAnnotations = (chartConfig: ChartConfig) => {
  switch (chartConfig.chartType) {
    case "area":
    case "bar":
    case "column":
    case "line":
    case "pie":
    case "scatterplot":
      return true;
    case "comboLineColumn":
    case "comboLineDual":
    case "comboLineSingle":
    case "map":
    case "table":
      return false;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

const Limit = t.intersection([
  t.type({
    related: t.array(
      t.type({
        dimensionId: t.string,
        value: t.string,
      })
    ),
    color: t.string,
    lineType: t.union([t.literal("dashed"), t.literal("solid")]),
  }),
  t.partial({
    symbolType: t.union([
      t.literal("cross"),
      t.literal("circle"),
      t.literal("triangle"),
    ]),
  }),
]);
export type Limit = t.TypeOf<typeof Limit>;

const ConversionUnit = t.type({
  multiplier: t.number,
  labels: t.type({
    de: t.string,
    fr: t.string,
    it: t.string,
    en: t.string,
  }),
});
export type ConversionUnit = t.TypeOf<typeof ConversionUnit>;

const GenericChartConfig = t.type({
  key: t.string,
  version: t.string,
  meta: Meta,
  cubes: t.array(Cube),
  interactiveFiltersConfig: InteractiveFiltersConfig,
  annotations: t.array(Annotation),
  limits: t.record(t.string, t.array(Limit)),
  conversionUnitsByComponentId: t.record(t.string, ConversionUnit),
  activeField: t.union([t.string, t.undefined]),
});

export type GenericChartConfig = t.TypeOf<typeof GenericChartConfig>;

const ShowTitleFieldExtension = t.partial({
  showTitle: t.boolean,
});
export type ShowTitleFieldExtension = t.TypeOf<typeof ShowTitleFieldExtension>;

const ShowValuesFieldExtension = t.partial({
  showValues: t.boolean,
});
export type ShowValuesFieldExtension = t.TypeOf<
  typeof ShowValuesFieldExtension
>;

const UncertaintyFieldExtension = t.partial({
  showStandardError: t.boolean,
  showConfidenceInterval: t.boolean,
});
export type UncertaintyFieldExtension = t.TypeOf<
  typeof UncertaintyFieldExtension
>;

const CustomScaleDomainFieldExtension = t.partial({
  customDomain: t.tuple([t.number, t.number]),
});
export type CustomScaleDomainFieldExtension = t.TypeOf<
  typeof CustomScaleDomainFieldExtension
>;

const ChartSubType = t.union([t.literal("stacked"), t.literal("grouped")]);
export type ChartSubType = t.TypeOf<typeof ChartSubType>;

const ColumnSegmentField = t.intersection([
  GenericField,
  SortingField,
  t.type({ type: ChartSubType }),
  ShowTitleFieldExtension,
  ShowValuesBySegmentFieldExtension,
]);
export type ColumnSegmentField = t.TypeOf<typeof ColumnSegmentField>;

const ColumnFields = t.intersection([
  t.type({
    x: t.intersection([GenericField, SortingField]),
    y: t.intersection([
      GenericField,
      ShowValuesFieldExtension,
      UncertaintyFieldExtension,
      CustomScaleDomainFieldExtension,
    ]),
    color: t.union([SegmentColorField, SingleColorField]),
  }),
  t.partial({
    segment: ColumnSegmentField,
    animation: AnimationField,
  }),
]);
export type ColumnFields = t.TypeOf<typeof ColumnFields>;

const ColumnConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("column"),
      fields: ColumnFields,
    },
    "ColumnConfig"
  ),
]);
export type ColumnConfig = t.TypeOf<typeof ColumnConfig>;

const BarSegmentField = t.intersection([
  GenericField,
  SortingField,
  t.type({ type: ChartSubType }),
  ShowTitleFieldExtension,
  ShowValuesBySegmentFieldExtension,
]);
export type BarSegmentField = t.TypeOf<typeof BarSegmentField>;

const BarFields = t.intersection([
  t.type({
    x: t.intersection([
      GenericField,
      ShowValuesFieldExtension,
      CustomScaleDomainFieldExtension,
    ]),
    y: t.intersection([GenericField, SortingField]),
    color: t.union([SegmentColorField, SingleColorField]),
  }),
  t.partial({
    segment: BarSegmentField,
    animation: AnimationField,
  }),
]);
export type BarFields = t.TypeOf<typeof BarFields>;

const BarConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("bar"),
      fields: BarFields,
    },
    "BarConfig"
  ),
]);
export type BarConfig = t.TypeOf<typeof BarConfig>;

const LineSegmentField = t.intersection([
  GenericField,
  SortingField,
  ShowTitleFieldExtension,
  ShowValuesBySegmentFieldExtension,
]);
export type LineSegmentField = t.TypeOf<typeof LineSegmentField>;

const ShowDotsSize = t.union([
  t.literal("Small"),
  t.literal("Medium"),
  t.literal("Large"),
]);
export type ShowDotsSize = t.TypeOf<typeof ShowDotsSize>;

const LineFields = t.intersection([
  t.type({
    x: GenericField,
    y: t.intersection([
      GenericField,
      ShowValuesFieldExtension,
      UncertaintyFieldExtension,
      CustomScaleDomainFieldExtension,
      t.partial({
        showDots: t.boolean,
        showDotsSize: ShowDotsSize,
      }),
    ]),
    color: t.union([SegmentColorField, SingleColorField]),
  }),
  t.partial({
    segment: LineSegmentField,
  }),
]);
export type LineFields = t.TypeOf<typeof LineFields>;

const LineConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("line"),
      fields: LineFields,
    },
    "LineConfig"
  ),
]);
export type LineConfig = t.TypeOf<typeof LineConfig>;

const AreaSegmentField = t.intersection([
  GenericField,
  SortingField,
  ShowTitleFieldExtension,
  ShowValuesBySegmentFieldExtension,
]);
export type AreaSegmentField = t.TypeOf<typeof AreaSegmentField>;

const ImputationType = t.union([
  t.literal("none"),
  t.literal("zeros"),
  t.literal("linear"),
]);
export type ImputationType = t.TypeOf<typeof ImputationType>;
export const IMPUTATION_TYPES: ImputationType[] = ["none", "zeros", "linear"];

const AreaFields = t.intersection([
  t.type({
    x: GenericField,
    y: t.intersection([
      GenericField,
      ShowValuesFieldExtension,
      CustomScaleDomainFieldExtension,
      t.partial({ imputationType: ImputationType }),
    ]),
    color: t.union([SegmentColorField, SingleColorField]),
  }),
  t.partial({
    segment: AreaSegmentField,
  }),
]);
export type AreaFields = t.TypeOf<typeof AreaFields>;

const AreaConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("area"),
      fields: AreaFields,
    },
    "AreaConfig"
  ),
]);
export type AreaConfig = t.TypeOf<typeof AreaConfig>;

const ScatterPlotSegmentField = t.intersection([
  GenericField,
  ShowTitleFieldExtension,
  ShowValuesBySegmentFieldExtension,
]);
export type ScatterPlotSegmentField = t.TypeOf<typeof ScatterPlotSegmentField>;

const ScatterPlotFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
    color: t.union([SegmentColorField, SingleColorField]),
  }),
  t.partial({
    segment: ScatterPlotSegmentField,
    animation: AnimationField,
  }),
]);
export type ScatterPlotFields = t.TypeOf<typeof ScatterPlotFields>;

const ScatterPlotConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("scatterplot"),
      fields: ScatterPlotFields,
    },
    "ScatterPlotConfig"
  ),
]);
export type ScatterPlotConfig = t.TypeOf<typeof ScatterPlotConfig>;

const PieSegmentField = t.intersection([
  GenericField,
  SortingField,
  ShowTitleFieldExtension,
  ShowValuesBySegmentFieldExtension,
]);
export type PieSegmentField = t.TypeOf<typeof PieSegmentField>;

const PieFields = t.intersection([
  t.type({
    y: t.intersection([GenericField, ShowValuesFieldExtension]),
    segment: PieSegmentField,
    color: SegmentColorField,
  }),
  t.partial({ animation: AnimationField }),
]);
export type PieFields = t.TypeOf<typeof PieFields>;

const PieConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("pie"),
      fields: PieFields,
    },
    "PieConfig"
  ),
]);
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

const DimensionPaletteType = t.literal("dimension");
const CategoricalPaletteType = t.union([
  DimensionPaletteType,
  t.literal("accent"),
  t.literal("category10"),
  t.literal("dark2"),
  t.literal("paired"),
  t.literal("pastel1"),
  t.literal("pastel2"),
  t.literal("set1"),
  t.literal("set2"),
  t.literal("set3"),
  t.literal("tableau10"),
]);

export type CategoricalPaletteType = t.TypeOf<typeof CategoricalPaletteType>;

const DivergingPalette = t.type({
  type: t.literal("diverging"),
  paletteId: DivergingPaletteType,
  name: DivergingPaletteType,
});

const SequentialPalette = t.type({
  type: t.literal("sequential"),
  paletteId: SequentialPaletteType,
  name: SequentialPaletteType,
});

const CategoricalPalette = t.type({
  type: t.literal("categorical"),
  paletteId: CategoricalPaletteType,
  name: CategoricalPaletteType,
});

const CustomPalette = t.type({
  type: t.union([
    t.literal("diverging"),
    t.literal("sequential"),
    t.literal("categorical"),
  ]),
  paletteId: t.string,
  name: t.string,
  colors: t.array(t.string),
});

export type CustomPaletteType = t.TypeOf<typeof CustomPalette>;
export const convertPaletteTypeToDBType = (
  type: CustomPaletteType["type"]
): PALETTE_TYPE => {
  switch (type) {
    case "diverging":
      return "DIVERGING";
    case "sequential":
      return "SEQUENTIAL";
    case "categorical":
      return "CATEGORICAL";
    default:
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }
};

export const convertDBTypeToPaletteType = (
  type: PALETTE_TYPE
): CustomPaletteType["type"] => {
  switch (type) {
    case "DIVERGING":
      return "diverging";
    case "SEQUENTIAL":
      return "sequential";
    case "CATEGORICAL":
      return "categorical";
    default:
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }
};

export const PaletteType = t.union([
  DivergingPalette,
  SequentialPalette,
  CategoricalPalette,
  CustomPalette,
]);

export type PaletteType = t.TypeOf<typeof PaletteType>;

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
  paletteId: t.string,
  colorMapping: ColorMapping,
});
const ColumnStyleHeatmap = t.type({
  type: t.literal("heatmap"),
  textStyle: ColumnTextStyle,
  paletteId: DivergingPaletteType,
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
  componentId: t.string,
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
export type TableFields = t.TypeOf<typeof TableFields>;

const TableSortingOption = t.type({
  componentId: t.string,
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
    },
    "TableConfig"
  ),
]);
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
    componentId: t.string,
    paletteId: t.string,
    colorMapping: ColorMapping,
  }),
  t.partial({ useAbbreviations: t.boolean }),
  ColorFieldOpacity,
]);

export type CategoricalColorField = t.TypeOf<typeof CategoricalColorField>;

const NumericalColorField = t.intersection([
  t.type({
    type: t.literal("numerical"),
    componentId: t.string,
    paletteId: t.string,
  }),
  t.partial({
    paletteType: t.union([t.literal("sequential"), t.literal("diverging")]),
    colors: t.array(t.string),
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

export type MapColorField =
  | FixedColorField
  | CategoricalColorField
  | NumericalColorField;

const MapAreaLayer = t.type({
  componentId: t.string,
  // FIXME: convert to new color field type
  color: t.union([CategoricalColorField, NumericalColorField]),
});
export type MapAreaLayer = t.TypeOf<typeof MapAreaLayer>;

const MapSymbolLayer = t.type({
  componentId: t.string,
  /** Symbol radius (size) */
  measureId: t.string,
  // FIXME: convert to new color field type
  color: t.union([FixedColorField, CategoricalColorField, NumericalColorField]),
});
export type MapSymbolLayer = t.TypeOf<typeof MapSymbolLayer>;

const BaseCustomLayer = t.type({
  id: t.string,
  isBehindAreaLayer: t.boolean,
  syncTemporalFilters: t.boolean,
  endpoint: t.union([t.string, t.undefined]),
});
export type BaseCustomLayer = t.TypeOf<typeof BaseCustomLayer>;

const WMSCustomLayer = t.intersection([
  t.type({
    type: t.literal("wms"),
    endpoint: t.string,
  }),
  BaseCustomLayer,
]);
export type WMSCustomLayer = t.TypeOf<typeof WMSCustomLayer>;
export const getWMSCustomLayers = (
  customLayers: BaseLayer["customLayers"]
): WMSCustomLayer[] => {
  return customLayers.filter((l) => l.type === "wms") as WMSCustomLayer[];
};

const WMTSCustomLayer = t.intersection([
  t.type({
    type: t.literal("wmts"),
    url: t.string,
  }),
  BaseCustomLayer,
]);
export type WMTSCustomLayer = t.TypeOf<typeof WMTSCustomLayer>;
export const getWMTSCustomLayers = (
  customLayers: BaseLayer["customLayers"]
): WMTSCustomLayer[] => {
  return customLayers.filter((l) => l.type === "wmts") as WMTSCustomLayer[];
};

const BaseLayer = t.type({
  show: t.boolean,
  locked: t.boolean,
  bbox: t.union([BBox, t.undefined]),
  customLayers: t.array(t.union([WMSCustomLayer, WMTSCustomLayer])),
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
    componentIds: t.array(t.string),
  }),
  color: MeasuresColorField,
});
export type ComboLineSingleFields = t.TypeOf<typeof ComboLineSingleFields>;

const ComboLineSingleConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("comboLineSingle"),
      fields: ComboLineSingleFields,
    },
    "ComboLineSingleConfig"
  ),
]);
export type ComboLineSingleConfig = t.TypeOf<typeof ComboLineSingleConfig>;

const ComboLineDualFields = t.type({
  x: GenericField,
  y: t.type({
    leftAxisComponentId: t.string,
    rightAxisComponentId: t.string,
  }),
  color: MeasuresColorField,
});
export type ComboLineDualFields = t.TypeOf<typeof ComboLineDualFields>;

const ComboLineDualConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("comboLineDual"),
      fields: ComboLineDualFields,
    },
    "ComboLineDualConfig"
  ),
]);
export type ComboLineDualConfig = t.TypeOf<typeof ComboLineDualConfig>;

const ComboLineColumnFields = t.type({
  x: GenericField,
  y: t.type({
    lineComponentId: t.string,
    lineAxisOrientation: t.union([t.literal("left"), t.literal("right")]),
    columnComponentId: t.string,
  }),
  color: MeasuresColorField,
});

export type ComboLineColumnFields = t.TypeOf<typeof ComboLineColumnFields>;

const ComboLineColumnConfig = t.intersection([
  GenericChartConfig,
  t.type(
    {
      chartType: t.literal("comboLineColumn"),
      fields: ComboLineColumnFields,
    },
    "ComboLineColumnConfig"
  ),
]);
export type ComboLineColumnConfig = t.TypeOf<typeof ComboLineColumnConfig>;

export type ChartSegmentField =
  | AreaSegmentField
  | BarSegmentField
  | ColumnSegmentField
  | LineSegmentField
  | PieSegmentField
  | ScatterPlotSegmentField;

const RegularChartConfig = t.union([
  AreaConfig,
  ColumnConfig,
  BarConfig,
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

export const ChartConfig = t.union([RegularChartConfig, ComboChartConfig]);
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

export const fieldHasComponentId = (chartConfig: ChartConfig) => {
  const validFields = Object.entries(chartConfig.fields).reduce(
    (acc, [key, field]) => {
      if (field && typeof field.componentId === "string") {
        acc[key] = field;
      }
      return acc;
    },
    {} as { [key: string]: GenericField }
  );

  return validFields as {
    [s: string]: { componentId: string } & {
      useAbbreviations?: boolean | undefined;
    };
  };
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

export const isBarConfig = (
  chartConfig: ChartConfig
): chartConfig is BarConfig => {
  return chartConfig.chartType === "bar";
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
): chartConfig is AreaConfig | ColumnConfig | BarConfig => {
  return (
    chartConfig.chartType === "area" ||
    (chartConfig.chartType === "column" &&
      chartConfig.fields.segment !== undefined &&
      chartConfig.fields.segment.type === "stacked") ||
    (chartConfig.chartType === "bar" &&
      chartConfig.fields.segment !== undefined &&
      chartConfig.fields.segment.type === "stacked")
  );
};

export const isSegmentInConfig = (
  chartConfig: ChartConfig
): chartConfig is
  | AreaConfig
  | ColumnConfig
  | BarConfig
  | LineConfig
  | PieConfig
  | ScatterPlotConfig => {
  return ["area", "column", "bar", "line", "pie", "scatterplot"].includes(
    chartConfig.chartType
  );
};

export const isColorInConfig = (
  chartConfig: ChartConfig
): chartConfig is Exclude<ChartConfig, { chartType: "table" | "map" }> => {
  return !isTableConfig(chartConfig) && !isMapConfig(chartConfig);
};

export const isNotTableOrMap = (chartConfig: ChartConfig) => {
  return !isTableConfig(chartConfig) && !isMapConfig(chartConfig);
};

export const isSortingInConfig = (
  chartConfig: ChartConfig
): chartConfig is
  | AreaConfig
  | ColumnConfig
  | BarConfig
  | LineConfig
  | PieConfig => {
  return ["area", "column", "bar", "line", "pie"].includes(
    chartConfig.chartType
  );
};

export const isAnimationInConfig = (
  chartConfig: ChartConfig
): chartConfig is
  | ColumnConfig
  | BarConfig
  | MapConfig
  | PieConfig
  | ScatterPlotConfig => {
  return ["column", "bar", "map", "pie", "scatterplot"].includes(
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
  minH: t.union([t.number, t.undefined]),
  x: t.number,
  y: t.number,
  i: t.string,
  resizeHandles: t.union([t.array(ResizeHandle), t.undefined]),
});
export type ReactGridLayoutType = t.TypeOf<typeof ReactGridLayoutType>;

export const ReactGridLayoutsType = t.record(
  t.string,
  t.array(ReactGridLayoutType)
);
export type ReactGridLayoutsType = t.TypeOf<typeof ReactGridLayoutsType>;

const LayoutChartBlock = t.type({
  type: t.literal("chart"),
  key: t.string,
});
export type LayoutChartBlock = t.TypeOf<typeof LayoutChartBlock>;

const LayoutTextBlock = t.type({
  type: t.literal("text"),
  key: t.string,
  text: t.type({
    de: t.string,
    fr: t.string,
    it: t.string,
    en: t.string,
  }),
});
export type LayoutTextBlock = t.TypeOf<typeof LayoutTextBlock>;

const LayoutBlock = t.intersection([
  t.union([LayoutChartBlock, LayoutTextBlock]),
  t.type({ initialized: t.boolean }),
]);
export type LayoutBlock = t.TypeOf<typeof LayoutBlock>;

const Layout = t.intersection([
  t.type({
    activeField: t.union([t.undefined, t.string]),
    meta: Meta,
    blocks: t.array(LayoutBlock),
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
export type LayoutDashboardFreeCanvas = Extract<
  Layout,
  { type: "dashboard"; layout: "canvas" }
>;

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
  componentIds: t.array(t.string),
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

export const areDataFiltersActive = (
  dashboardFilters: DashboardFiltersConfig | undefined
) => {
  return !!dashboardFilters?.dataFilters.componentIds.length;
};

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

export const ConfiguratorState = t.union([
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
