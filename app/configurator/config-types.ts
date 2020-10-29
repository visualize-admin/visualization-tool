/* eslint-disable no-redeclare */
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";

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
    value: t.string,
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

// Chart Config

const SortingOrder = t.union([t.literal("asc"), t.literal("desc")]);
export type SortingOrder = t.TypeOf<typeof SortingOrder>;

const SortingType = t.union([
  t.literal("byDimensionLabel"),
  t.literal("byMeasure"),
  t.literal("byTotalSize"),
]);
export type SortingType = t.TypeOf<typeof SortingType>;

const ColorMapping = t.record(t.string, t.string);
export type ColorMapping = t.TypeOf<typeof ColorMapping>;

const GenericField = t.type({ componentIri: t.string });
export type GenericField = t.TypeOf<typeof GenericField>;

const GenericFields = t.record(t.string, t.union([GenericField, t.undefined]));
export type GenericFields = t.TypeOf<typeof GenericFields>;

const SegmentField = t.intersection([
  t.type({
    componentIri: t.string,
  }),
  t.type({
    type: t.union([t.literal("stacked"), t.literal("grouped")]),
  }),
  t.type({ palette: t.string }),
  t.partial({
    colorMapping: ColorMapping,
  }),
  t.partial({
    sorting: t.type({
      sortingType: SortingType,
      sortingOrder: SortingOrder,
    }),
  }),
]);

export type SegmentField = t.TypeOf<typeof SegmentField>;
export type SegmentFields = Record<string, SegmentField | undefined>;

const BarFields = t.intersection([
  t.type({
    x: GenericField,
    y: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.partial({
        sorting: t.type({
          sortingType: SortingType,
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
  }),
  t.partial({
    segment: SegmentField,
  }),
]);
const BarConfig = t.type(
  {
    chartType: t.literal("bar"),
    filters: Filters,
    fields: BarFields,
  },
  "BarConfig"
);
export type BarFields = t.TypeOf<typeof BarFields>;
export type BarConfig = t.TypeOf<typeof BarConfig>;

const ColumnFields = t.intersection([
  t.type({
    x: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.partial({
        sorting: t.type({
          sortingType: SortingType,
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
    y: GenericField,
  }),
  t.partial({
    segment: SegmentField,
  }),
]);
const ColumnConfig = t.type(
  {
    chartType: t.literal("column"),
    filters: Filters,
    fields: ColumnFields,
  },
  "ColumnConfig"
);
export type ColumnFields = t.TypeOf<typeof ColumnFields>;
export type ColumnConfig = t.TypeOf<typeof ColumnConfig>;

const LineFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),
  t.partial({
    segment: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.type({ palette: t.string }),
      t.partial({
        colorMapping: ColorMapping,
      }),
    ]),
  }),
]);
const LineConfig = t.type(
  {
    chartType: t.literal("line"),
    filters: Filters,
    fields: LineFields,
  },
  "LineConfig"
);
export type LineFields = t.TypeOf<typeof LineFields>;
export type LineConfig = t.TypeOf<typeof LineConfig>;

const AreaFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),

  t.partial({
    segment: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.type({ palette: t.string }),
      t.partial({
        colorMapping: ColorMapping,
      }),
      t.partial({
        sorting: t.type({
          sortingType: SortingType,
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
  }),
]);
const AreaConfig = t.type(
  {
    chartType: t.literal("area"),
    filters: Filters,
    fields: AreaFields,
  },
  "AreaConfig"
);

export type AreaFields = t.TypeOf<typeof AreaFields>;
export type AreaConfig = t.TypeOf<typeof AreaConfig>;

const ScatterPlotFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),
  t.partial({
    segment: t.intersection([
      t.type({ componentIri: t.string }),
      t.type({ palette: t.string }),
      t.partial({
        colorMapping: ColorMapping,
      }),
    ]),
  }),
]);
const ScatterPlotConfig = t.type(
  {
    chartType: t.literal("scatterplot"),
    filters: Filters,
    fields: ScatterPlotFields,
  },
  "ScatterPlotConfig"
);
export type ScatterPlotFields = t.TypeOf<typeof ScatterPlotFields>;
export type ScatterPlotConfig = t.TypeOf<typeof ScatterPlotConfig>;

const PieFields = t.type({
  y: GenericField,
  // FIXME: "segment" should be "x" for consistency
  segment: t.intersection([
    t.type({
      componentIri: t.string,
      palette: t.string,
    }),
    t.partial({
      colorMapping: ColorMapping,
    }),
    t.partial({
      sorting: t.type({
        sortingType: SortingType,
        sortingOrder: SortingOrder,
      }),
    }),
  ]),
});
const PieConfig = t.type(
  {
    chartType: t.literal("pie"),
    filters: Filters,
    fields: PieFields,
  },
  "PieConfig"
);
export type PieFields = t.TypeOf<typeof PieFields>;
export type PieConfig = t.TypeOf<typeof PieConfig>;

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
  palette: t.string,
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

export type ColumnStyleText = t.TypeOf<typeof ColumnStyleText>;
export type ColumnStyleCategory = t.TypeOf<typeof ColumnStyleCategory>;
export type ColumnStyleHeatmap = t.TypeOf<typeof ColumnStyleHeatmap>;
export type ColumnStyleBar = t.TypeOf<typeof ColumnStyleBar>;
export type ColumnStyle = t.TypeOf<typeof ColumnStyle>;

const TableColumn = t.type({
  componentIri: t.string,
  isGroup: t.boolean,
  isHidden: t.boolean,
  columnStyle: ColumnStyle,
});
export type TableColumn = t.TypeOf<typeof TableColumn>;

const TableFields = t.record(t.string, TableColumn);
const TableConfig = t.type(
  {
    chartType: t.literal("table"),
    fields: TableFields,
    filters: Filters,
    settings: t.type({
      showSearch: t.boolean,
      showAllRows: t.boolean,
    }),
    sorting: t.array(
      t.type({
        componentIri: t.string,
        sortingOrder: SortingOrder,
      })
    ),
  },
  "TableConfig"
);
export type TableFields = t.TypeOf<typeof TableFields>;
export type TableConfig = t.TypeOf<typeof TableConfig>;

export type ChartFields =
  | ColumnFields
  | BarFields
  | LineFields
  | AreaFields
  | ScatterPlotFields
  | PieFields
  | TableFields;

// interface IriBrand {
//   readonly IRI: unique symbol;
// }
// const Iri = t.brand(
//   t.string,
//   (s): s is t.Branded<string, IriBrand> => true,
//   "IRI"
// );

// const ChartConfig = t.intersection([
//   t.union([AreaConfig, BarConfig, ColumnConfig, LineConfig, ScatterPlotConfig]),
//   t.type({
//     fields: GenericFields
//   })
// ]);
const ChartConfig = t.union([
  AreaConfig,
  BarConfig,
  ColumnConfig,
  LineConfig,
  ScatterPlotConfig,
  PieConfig,
  TableConfig,
]);
// t.record(t.string, t.any)
export type ChartConfig = t.TypeOf<typeof ChartConfig>;

export type ChartType = ChartConfig["chartType"];

const Config = t.type(
  {
    dataSet: t.string,
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
});
const ConfiguratorStateSelectingDataSet = t.type({
  state: t.literal("SELECTING_DATASET"),
  activeField: t.undefined,
  meta: Meta,
  dataSet: t.union([t.string, t.undefined]),
  chartConfig: t.undefined,
});
const ConfiguratorStateSelectingChartType = t.intersection([
  t.type({
    state: t.literal("SELECTING_CHART_TYPE"),
  }),
  Config,
]);
const ConfiguratorStateConfiguringChart = t.intersection([
  t.type({
    state: t.literal("CONFIGURING_CHART"),
  }),
  Config,
]);
const ConfiguratorStateDescribingChart = t.intersection([
  t.type({
    state: t.literal("DESCRIBING_CHART"),
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
export type ConfiguratorStateSelectingChartType = t.TypeOf<
  typeof ConfiguratorStateSelectingChartType
>;
export type ConfiguratorStateConfiguringChart = t.TypeOf<
  typeof ConfiguratorStateConfiguringChart
>;
export type ConfiguratorStateDescribingChart = t.TypeOf<
  typeof ConfiguratorStateDescribingChart
>;
export type ConfiguratorStatePublishing = t.TypeOf<
  typeof ConfiguratorStatePublishing
>;
const ConfiguratorState = t.union([
  ConfiguratorStateInitial,
  ConfiguratorStateSelectingDataSet,
  ConfiguratorStateSelectingChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
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
        console.log(err);
        return undefined;
      },
      (d) => d
    )
  );
};
