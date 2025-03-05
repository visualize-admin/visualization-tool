import {
  AnimationField,
  AreaConfig,
  AreaFields,
  AreaSegmentField,
  BarConfig,
  BarFields,
  BarSegmentField,
  ChartConfig,
  ColumnConfig,
  ColumnFields,
  ColumnSegmentField,
  ComboLineColumnConfig,
  ComboLineColumnFields,
  ComboLineDualConfig,
  ComboLineDualFields,
  ComboLineSingleConfig,
  ComboLineSingleFields,
  GenericChartConfig,
  InteractiveFiltersCalculation,
  InteractiveFiltersConfig,
  InteractiveFiltersDataConfig,
  InteractiveFiltersLegend,
  LineConfig,
  LineFields,
  LineSegmentField,
  MapConfig,
  MapFields,
  PieConfig,
  PieFields,
  PieSegmentField,
  ScatterPlotConfig,
  ScatterPlotFields,
  ScatterPlotSegmentField,
  TableConfig,
  TableFields,
} from "@/config-types";
import { Dimension, Measure } from "@/domain/data";

export type FieldAdjuster<
  NewChartConfigType extends ChartConfig,
  OldValueType extends unknown,
> = (params: {
  oldValue: OldValueType;
  oldChartConfig: ChartConfig;
  newChartConfig: NewChartConfigType;
  dimensions: Dimension[];
  measures: Measure[];
  isAddingNewCube?: boolean;
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
    componentId: FieldAdjuster<ChartConfig, string>;
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
  limits: FieldAdjuster<NewChartConfigType, GenericChartConfig["limits"]>;
  interactiveFiltersConfig: InteractiveFiltersAdjusters;
};

type ColumnAdjusters = BaseAdjusters<ColumnConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<ColumnConfig, string> };
    y: {
      componentId: FieldAdjuster<ColumnConfig, string>;
      showValues: FieldAdjuster<ColumnConfig, boolean>;
    };
    segment: FieldAdjuster<
      ColumnConfig,
      | BarSegmentField
      | LineSegmentField
      | AreaSegmentField
      | ScatterPlotSegmentField
      | PieSegmentField
      | TableFields
    >;
    animation: FieldAdjuster<ColumnConfig, AnimationField | undefined>;
  };
};

type BarAdjusters = BaseAdjusters<BarConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<BarConfig, string> };
    y: { componentId: FieldAdjuster<BarConfig, string> };
    segment: FieldAdjuster<
      BarConfig,
      | ColumnSegmentField
      | LineSegmentField
      | AreaSegmentField
      | ScatterPlotSegmentField
      | PieSegmentField
      | TableFields
    >;
    animation: FieldAdjuster<BarConfig, AnimationField | undefined>;
  };
};

type LineAdjusters = BaseAdjusters<LineConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<LineConfig, string> };
    y: {
      componentId: FieldAdjuster<LineConfig, string>;
      showValues: FieldAdjuster<LineConfig, boolean>;
    };
    segment: FieldAdjuster<
      LineConfig,
      | ColumnSegmentField
      | BarSegmentField
      | AreaSegmentField
      | ScatterPlotSegmentField
      | PieSegmentField
      | TableFields
    >;
  };
};

type AreaAdjusters = BaseAdjusters<AreaConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<AreaConfig, string> };
    y: {
      componentId: FieldAdjuster<AreaConfig, string>;
      showValues: FieldAdjuster<AreaConfig, boolean>;
    };
    segment: FieldAdjuster<
      AreaConfig,
      | ColumnSegmentField
      | BarSegmentField
      | LineSegmentField
      | ScatterPlotSegmentField
      | PieSegmentField
      | TableFields
    >;
  };
};

type ScatterPlotAdjusters = BaseAdjusters<ScatterPlotConfig> & {
  fields: {
    y: { componentId: FieldAdjuster<ScatterPlotConfig, string> };
    segment: FieldAdjuster<
      ScatterPlotConfig,
      | ColumnSegmentField
      | BarSegmentField
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
    y: { componentId: FieldAdjuster<PieConfig, string> };
    segment: FieldAdjuster<
      PieConfig,
      | ColumnSegmentField
      | BarSegmentField
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
    | BarSegmentField
    | LineSegmentField
    | AreaSegmentField
    | ScatterPlotSegmentField
    | PieSegmentField
  >;
};

type MapAdjusters = BaseAdjusters<MapConfig> & {
  fields: {
    areaLayer: {
      componentId: FieldAdjuster<MapConfig, string>;
      color: {
        componentId: FieldAdjuster<MapConfig, string>;
      };
    };
    animation: FieldAdjuster<MapConfig, AnimationField | undefined>;
  };
};

type ComboLineSingleAdjusters = BaseAdjusters<ComboLineSingleConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<ComboLineSingleConfig, string> };
    y: { componentIds: FieldAdjuster<ComboLineSingleConfig, string> };
  };
};

type ComboLineDualAdjusters = BaseAdjusters<ComboLineDualConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<ComboLineDualConfig, string> };
    y: FieldAdjuster<
      ComboLineDualConfig,
      | AreaFields
      | ColumnFields
      | BarFields
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
    x: { componentId: FieldAdjuster<ComboLineColumnConfig, string> };
    y: FieldAdjuster<
      ComboLineColumnConfig,
      | AreaFields
      | ColumnFields
      | BarFields
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
  bar: BarAdjusters;
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
