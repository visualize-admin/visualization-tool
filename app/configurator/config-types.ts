/* eslint-disable no-redeclare */
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

import { DataCubeMetadata } from "@/graphql/types";

const ComponentType = t.union([
  t.literal("NumericalMeasure"),
  t.literal("OrdinalMeasure"),
  t.literal("GeoCoordinatesDimension"),
  t.literal("GeoShapesDimension"),
  t.literal("NominalDimension"),
  t.literal("OrdinalDimension"),
  t.literal("TemporalDimension"),
]);

export type ComponentType = t.TypeOf<typeof ComponentType>;

// Filters
const FilterValueMulti = t.type(
  {
    type: t.literal("multi"),
    values: t.record(t.string, t.literal(true)), // undefined values will be removed when serializing to JSON
  },
  "FilterValueMulti"
);

export type FilterValueMulti = t.TypeOf<typeof FilterValueMulti>;

const FilterValueSingle = t.type(
  {
    type: t.literal("single"),
    value: t.union([t.string, t.number]),
  },
  "FilterValueSingle"
);

export type FilterValueSingle = t.TypeOf<typeof FilterValueSingle>;

const FilterValueRange = t.type(
  {
    type: t.literal("range"),
    from: t.string,
    to: t.string,
  },
  "FilterValueRange"
);

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
export type QueryFilters = Filters | FilterValueSingle;

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

const InteractiveFiltersConfig = t.union([
  t.type({
    legend: InteractiveFiltersLegend,
    timeRange: InteractiveFiltersTimeRange,
    dataFilters: InteractiveFiltersDataConfig,
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
    duration: t.number,
    type: AnimationType,
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

const ColumnSegmentField = t.intersection([
  GenericSegmentField,
  SortingField,
  t.type({
    type: t.union([t.literal("stacked"), t.literal("grouped")]),
  }),
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
const ColumnConfig = t.type(
  {
    version: t.string,
    chartType: t.literal("column"),
    filters: Filters,
    interactiveFiltersConfig: InteractiveFiltersConfig,
    fields: ColumnFields,
  },
  "ColumnConfig"
);
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
const LineConfig = t.type(
  {
    version: t.string,
    chartType: t.literal("line"),
    filters: Filters,
    interactiveFiltersConfig: InteractiveFiltersConfig,
    fields: LineFields,
  },
  "LineConfig"
);
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
const AreaConfig = t.type(
  {
    version: t.string,
    chartType: t.literal("area"),
    filters: Filters,
    interactiveFiltersConfig: InteractiveFiltersConfig,
    fields: AreaFields,
  },
  "AreaConfig"
);
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
const ScatterPlotConfig = t.type(
  {
    version: t.string,
    chartType: t.literal("scatterplot"),
    filters: Filters,
    interactiveFiltersConfig: InteractiveFiltersConfig,
    fields: ScatterPlotFields,
  },
  "ScatterPlotConfig"
);
export type ScatterPlotFields = t.TypeOf<typeof ScatterPlotFields>;
export type ScatterPlotConfig = t.TypeOf<typeof ScatterPlotConfig>;

const PieSegmentField = t.intersection([GenericSegmentField, SortingField]);
export type PieSegmentField = t.TypeOf<typeof PieSegmentField>;

const PieFields = t.intersection([
  t.type({
    y: GenericField,
    // FIXME: "segment" should be "x" for consistency
    segment: PieSegmentField,
  }),
  t.partial({ animation: AnimationField }),
]);
const PieConfig = t.type(
  {
    version: t.string,
    chartType: t.literal("pie"),
    interactiveFiltersConfig: InteractiveFiltersConfig,
    filters: Filters,
    fields: PieFields,
  },
  "PieConfig"
);
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

const TableConfig = t.type(
  {
    version: t.string,
    chartType: t.literal("table"),
    fields: TableFields,
    filters: Filters,
    settings: TableSettings,
    sorting: t.array(TableSortingOption),
    interactiveFiltersConfig: t.undefined,
  },
  "TableConfig"
);
export type TableFields = t.TypeOf<typeof TableFields>;
export type TableConfig = t.TypeOf<typeof TableConfig>;

const BBox = t.tuple([
  t.tuple([t.number, t.number]),
  t.tuple([t.number, t.number]),
]);
export type BBox = t.TypeOf<typeof BBox>;

const ColorFieldType = t.union([
  t.literal("fixed"),
  t.literal("categorical"),
  t.literal("numerical"),
]);
export type ColorFieldType = t.TypeOf<typeof ColorFieldType>;

const FixedColorField = t.type({
  type: t.literal("fixed"),
  value: t.string,
  opacity: t.number,
});
export type FixedColorField = t.TypeOf<typeof FixedColorField>;

const CategoricalColorField = t.intersection([
  t.type({
    type: t.literal("categorical"),
    componentIri: t.string,
    palette: t.string,
    colorMapping: ColorMapping,
  }),
  t.partial({ useAbbreviations: t.boolean }),
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
]);
export type NumericalColorField = t.TypeOf<typeof NumericalColorField>;

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

const MapFields = t.intersection([
  t.partial({ areaLayer: MapAreaLayer }),
  t.partial({ symbolLayer: MapSymbolLayer }),
]);

const MapConfig = t.type(
  {
    version: t.string,
    chartType: t.literal("map"),
    interactiveFiltersConfig: InteractiveFiltersConfig,
    filters: Filters,
    fields: MapFields,
    baseLayer: BaseLayer,
  },
  "MapConfig"
);
export type MapFields = t.TypeOf<typeof MapFields>;
export type MapConfig = t.TypeOf<typeof MapConfig>;

export type ChartFields =
  | ColumnFields
  | LineFields
  | AreaFields
  | ScatterPlotFields
  | PieFields
  | TableFields
  | MapFields;

export type ChartSegmentField =
  | AreaSegmentField
  | ColumnSegmentField
  | LineSegmentField
  | PieSegmentField
  | ScatterPlotSegmentField;

const ChartConfig = t.union([
  AreaConfig,
  ColumnConfig,
  LineConfig,
  ScatterPlotConfig,
  PieConfig,
  TableConfig,
  MapConfig,
]);
// t.record(t.string, t.any)
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

export const isSegmentInConfig = (
  chartConfig: ChartConfig
): chartConfig is
  | AreaConfig
  | ColumnConfig
  | LineConfig
  | ScatterPlotConfig
  | PieConfig
  | TableConfig => {
  return !isTableConfig(chartConfig) && !isMapConfig(chartConfig);
};

export const isAnimationInConfig = (
  chartConfig: ChartConfig
): chartConfig is ColumnConfig | ScatterPlotConfig | PieConfig => {
  return (
    chartConfig.chartType === "column" ||
    chartConfig.chartType === "scatterplot" ||
    chartConfig.chartType === "pie"
  );
};

export const isColorFieldInConfig = (
  chartConfig: ChartConfig
): chartConfig is MapConfig => {
  return isMapConfig(chartConfig);
};

export const isSegmentColorMappingInConfig = (
  chartConfig: ChartConfig
): chartConfig is
  | AreaConfig
  | ColumnConfig
  | LineConfig
  | ScatterPlotConfig
  | PieConfig => {
  const { chartType } = chartConfig;
  return (
    chartType === "area" ||
    chartType === "column" ||
    chartType === "line" ||
    chartType === "scatterplot" ||
    chartType === "pie"
  );
};

// Chart Config Adjusters
export type FieldAdjuster<
  NewChartConfigType extends ChartConfig,
  OldValueType extends unknown
> = (params: {
  oldValue: OldValueType;
  oldChartConfig: ChartConfig;
  newChartConfig: NewChartConfigType;
  dimensions: DataCubeMetadata["dimensions"];
  measures: DataCubeMetadata["measures"];
}) => NewChartConfigType;

export type InteractiveFiltersAdjusters = {
  legend: FieldAdjuster<ChartConfig, InteractiveFiltersLegend>;
  time: {
    active: FieldAdjuster<ChartConfig, boolean>;
    componentIri: FieldAdjuster<ChartConfig, string>;
    presets: {
      type: FieldAdjuster<ChartConfig, "range">;
      from: FieldAdjuster<ChartConfig, string>;
      to: FieldAdjuster<ChartConfig, string>;
    };
  };
  dataFilters: {
    active: FieldAdjuster<ChartConfig, boolean>;
    componentIris: FieldAdjuster<ChartConfig, string[]>;
  };
};

type BaseAdjusters<NewChartConfigType extends ChartConfig> = {
  filters: FieldAdjuster<NewChartConfigType, Filters>;
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
  filters: FieldAdjuster<TableConfig, Filters>;
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
};

const DataSource = t.type({
  type: t.union([t.literal("sql"), t.literal("sparql")]),
  url: t.string,
});

export type DataSource = t.TypeOf<typeof DataSource>;

const Config = t.type(
  {
    dataSet: t.string,
    dataSource: DataSource,
    activeField: t.union([t.string, t.undefined]),
    meta: Meta,
    chartConfig: ChartConfig,
  },
  "Config"
);

export type Config = t.TypeOf<typeof Config>;

export const isValidConfig = (config: unknown): config is Config =>
  Config.is(config);

export const decodeConfig = (config: unknown) => Config.decode(config);

const ConfiguratorStateInitial = t.type({
  state: t.literal("INITIAL"),
  activeField: t.undefined,
  dataSet: t.undefined,
  dataSource: DataSource,
});
const ConfiguratorStateSelectingDataSet = t.type({
  state: t.literal("SELECTING_DATASET"),
  activeField: t.undefined,
  meta: Meta,
  dataSet: t.union([t.string, t.undefined]),
  dataSource: DataSource,
  chartConfig: t.undefined,
});
const ConfiguratorStateConfiguringChart = t.intersection([
  t.type({
    state: t.literal("CONFIGURING_CHART"),
  }),
  Config,
]);
const ConfiguratorStatePublishing = t.intersection([
  t.type({
    state: t.literal("PUBLISHING"),
  }),
  Config,
]);

export type ConfiguratorStateSelectingDataSet = t.TypeOf<
  typeof ConfiguratorStateSelectingDataSet
>;
export type ConfiguratorStateConfiguringChart = t.TypeOf<
  typeof ConfiguratorStateConfiguringChart
>;
export type ConfiguratorStatePublishing = t.TypeOf<
  typeof ConfiguratorStatePublishing
>;
const ConfiguratorState = t.union([
  ConfiguratorStateInitial,
  ConfiguratorStateSelectingDataSet,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
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
