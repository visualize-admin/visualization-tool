import {
  AnimationField,
  AreaConfig,
  AreaFields,
  AreaSegmentField,
  BarConfig,
  BarFields,
  BarSegmentField,
  ChartConfig,
  ColorField,
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
  UnitConversionFieldExtension,
} from "@/config-types";
import { Dimension, Measure } from "@/domain/data";
import { ComponentId } from "@/graphql/make-component-id";

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
    componentId: FieldAdjuster<ChartConfig, ComponentId>;
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
    x: { componentId: FieldAdjuster<ColumnConfig, ComponentId> };
    y: {
      componentId: FieldAdjuster<ColumnConfig, ComponentId>;
      showValues: FieldAdjuster<ColumnConfig, boolean>;
      customDomain: FieldAdjuster<ColumnConfig, [number, number]>;
      unitConversion: FieldAdjuster<
        ColumnConfig,
        UnitConversionFieldExtension["unitConversion"]
      >;
    };
    color: FieldAdjuster<ColumnConfig, ColorField>;
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
    x: {
      componentId: FieldAdjuster<BarConfig, ComponentId>;
      showValues: FieldAdjuster<BarConfig, boolean>;
      customDomain: FieldAdjuster<BarConfig, [number, number]>;
      unitConversion: FieldAdjuster<
        BarConfig,
        UnitConversionFieldExtension["unitConversion"]
      >;
    };
    y: { componentId: FieldAdjuster<BarConfig, ComponentId> };
    color: FieldAdjuster<BarConfig, ColorField>;
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
    x: { componentId: FieldAdjuster<LineConfig, ComponentId> };
    y: {
      componentId: FieldAdjuster<LineConfig, ComponentId>;
      showValues: FieldAdjuster<LineConfig, boolean>;
      customDomain: FieldAdjuster<LineConfig, [number, number]>;
      unitConversion: FieldAdjuster<
        LineConfig,
        UnitConversionFieldExtension["unitConversion"]
      >;
    };
    color: FieldAdjuster<LineConfig, ColorField>;
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
    x: { componentId: FieldAdjuster<AreaConfig, ComponentId> };
    y: {
      componentId: FieldAdjuster<AreaConfig, ComponentId>;
      showValues: FieldAdjuster<AreaConfig, boolean>;
      customDomain: FieldAdjuster<AreaConfig, [number, number]>;
      unitConversion: FieldAdjuster<
        AreaConfig,
        UnitConversionFieldExtension["unitConversion"]
      >;
    };
    color: FieldAdjuster<AreaConfig, ColorField>;
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
    x: {
      componentId: FieldAdjuster<ScatterPlotConfig, ComponentId>;
      unitConversion: FieldAdjuster<
        ScatterPlotConfig,
        UnitConversionFieldExtension["unitConversion"]
      >;
    };
    y: {
      componentId: FieldAdjuster<ScatterPlotConfig, ComponentId>;
      unitConversion: FieldAdjuster<
        ScatterPlotConfig,
        UnitConversionFieldExtension["unitConversion"]
      >;
    };
    color: FieldAdjuster<ScatterPlotConfig, ColorField>;
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
    y: {
      componentId: FieldAdjuster<PieConfig, ComponentId>;
      showValues: FieldAdjuster<PieConfig, boolean>;
      unitConversion: FieldAdjuster<
        PieConfig,
        UnitConversionFieldExtension["unitConversion"]
      >;
    };
    color: FieldAdjuster<PieConfig, ColorField>;
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
      componentId: FieldAdjuster<MapConfig, ComponentId>;
      color: {
        componentId: FieldAdjuster<MapConfig, ComponentId>;
      };
    };
    animation: FieldAdjuster<MapConfig, AnimationField | undefined>;
  };
};

type ComboLineSingleAdjusters = BaseAdjusters<ComboLineSingleConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<ComboLineSingleConfig, ComponentId> };
    y: { componentIds: FieldAdjuster<ComboLineSingleConfig, ComponentId> };
  };
};

type ComboLineDualAdjusters = BaseAdjusters<ComboLineDualConfig> & {
  fields: {
    x: { componentId: FieldAdjuster<ComboLineDualConfig, ComponentId> };
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
    x: { componentId: FieldAdjuster<ComboLineColumnConfig, ComponentId> };
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
