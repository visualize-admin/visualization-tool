import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from "fp-ts/lib/Either";

// Filters
const FilterValueMulti = t.type(
  {
    type: t.literal("multi"),
    values: t.record(t.string, t.union([t.literal(true), t.undefined])) // undefined values will be removed when serializing to JSON
  },
  "FilterValueMulti"
);
export type FilterValueMulti = t.TypeOf<typeof FilterValueMulti>;

const FilterValueSingle = t.type(
  {
    type: t.literal("single"),
    value: t.string
  },
  "FilterValueSingle"
);
export type FilterValueSingle = t.TypeOf<typeof FilterValueSingle>;

const FilterValueRange = t.type(
  {
    type: t.literal("range"),
    from: t.string,
    to: t.string
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
  en: t.string
});
export type Title = t.TypeOf<typeof Title>;
const Description = t.type({
  de: t.string,
  fr: t.string,
  it: t.string,
  en: t.string
});
const Meta = t.type({ title: Title, description: Description });
export type Meta = t.TypeOf<typeof Meta>;
export type MetaKey = keyof Meta;

// Chart Config
export type ChartType = "bar" | "line" | "area" | "scatterplot" | "column";
const FieldType = t.type({ componentIri: t.string });
export type FieldType = t.TypeOf<typeof FieldType>;

const AnyFields = t.record(t.string, t.union([FieldType, t.undefined]));
type AnyFields = t.TypeOf<typeof AnyFields>;

const AreaFields = t.intersection([
  t.type({
    x: FieldType,
    y: FieldType
  }),
  t.partial({
    segment: t.type({
      componentIri: t.string,
      palette: t.string
    })
  }),
  AnyFields
]);
const AreaConfig = t.type(
  {
    chartType: t.literal("area"),
    filters: Filters,
    fields: AreaFields
  },
  "AreaConfig"
);

export type AreaFields = t.TypeOf<typeof AreaFields>;
export type AreaConfig = t.TypeOf<typeof AreaConfig>;

const BarFields = t.intersection([
  t.type({
    x: FieldType,
    y: FieldType
  }),
  t.partial({
    segment: t.type({
      componentIri: t.string,
      type: t.union([t.literal("stacked"), t.literal("grouped")]),
      palette: t.string
    })
  }),
  AnyFields
]);
const BarConfig = t.type(
  {
    chartType: t.literal("bar"),
    filters: Filters,
    fields: BarFields
  },
  "BarConfig"
);
export type BarFields = t.TypeOf<typeof BarFields>;
export type BarConfig = t.TypeOf<typeof BarConfig>;

const ColumnFields = t.intersection([
  t.type({
    x: FieldType,
    y: FieldType
  }),
  t.partial({
    segment: t.type({
      componentIri: t.string,
      type: t.union([t.literal("stacked"), t.literal("grouped")]),
      palette: t.string
    })
  }),
  AnyFields
]);
const ColumnConfig = t.type(
  {
    chartType: t.literal("column"),
    filters: Filters,
    fields: ColumnFields
  },
  "ColumnConfig"
);
export type ColumnFields = t.TypeOf<typeof ColumnFields>;
export type ColumnConfig = t.TypeOf<typeof ColumnConfig>;

const LineFields = t.intersection([
  t.type({
    x: FieldType,
    y: FieldType
  }),
  t.partial({
    segment: t.type({
      componentIri: t.string,
      palette: t.string
    })
  }),
  AnyFields
]);
const LineConfig = t.type(
  {
    chartType: t.literal("line"),
    filters: Filters,
    fields: LineFields
  },
  "LineConfig"
);
export type LineFields = t.TypeOf<typeof LineFields>;
export type LineConfig = t.TypeOf<typeof LineConfig>;

const ScatterPlotFields = t.intersection([
  t.type({
    x: FieldType,
    y: FieldType
  }),
  t.partial({
    segment: t.type({
      componentIri: t.string,
      palette: t.string
    })
  }),
  AnyFields
]);
const ScatterPlotConfig = t.type(
  {
    chartType: t.literal("scatterplot"),
    filters: Filters,
    fields: ScatterPlotFields
  },
  "ScatterPlotConfig"
);
export type ScatterPlotFields = t.TypeOf<typeof ScatterPlotFields>;
export type ScatterPlotConfig = t.TypeOf<typeof ScatterPlotConfig>;

export type ChartFields =
  | ColumnFields
  | BarFields
  | LineFields
  | AreaFields
  | ScatterPlotFields;

// interface IriBrand {
//   readonly IRI: unique symbol;
// }
// const Iri = t.brand(
//   t.string,
//   (s): s is t.Branded<string, IriBrand> => true,
//   "IRI"
// );

const ChartConfig = t.union([
  AreaConfig,
  BarConfig,
  ColumnConfig,
  LineConfig,
  ScatterPlotConfig
]);
// t.record(t.string, t.any)
export type ChartConfig = t.TypeOf<typeof ChartConfig>;

const Config = t.type(
  {
    dataSet: t.string,
    activeField: t.union([t.string, t.undefined]),
    meta: Meta,
    chartConfig: ChartConfig
  },
  "Config"
);

export type Config = t.TypeOf<typeof Config>;

export const isValidConfig = (config: unknown): config is Config =>
  Config.is(config);

export const decodeConfig = (config: unknown) => Config.decode(config);

const ConfiguratorStateInitial = t.type({ state: t.literal("INITIAL") });
const ConfiguratorStateSelectingDataSet = t.type({
  state: t.literal("SELECTING_DATASET"),
  activeField: t.union([t.string, t.undefined]),
  meta: Meta,
  dataSet: t.undefined,
  chartConfig: t.undefined
});
const ConfiguratorStateSelectingChartType = t.type({
  state: t.literal("SELECTING_CHART_TYPE"),
  dataSet: t.string,
  activeField: t.union([t.string, t.undefined]),
  meta: Meta,
  chartConfig: ChartConfig
});
const ConfiguratorStateConfiguringChart = t.intersection([
  t.type({
    state: t.literal("CONFIGURING_CHART"),
    meta: Meta,
    dataSet: t.string
  }),
  Config
]);
const ConfiguratorStateDescribingChart = t.intersection([
  t.type({
    state: t.literal("DESCRIBING_CHART")
  }),
  Config
]);
const ConfiguratorStatePublishing = t.intersection([
  t.type({
    state: t.literal("PUBLISHING")
  }),
  Config
]);
const ConfiguratorStatePublished = t.intersection([
  t.type({
    state: t.literal("PUBLISHED"),
    configKey: t.string
  }),
  Config
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
  ConfiguratorStatePublished
]);

export type ConfiguratorState = t.TypeOf<typeof ConfiguratorState>;

export const decodeConfiguratorState = (
  state: unknown
): ConfiguratorState | undefined => {
  return pipe(
    ConfiguratorState.decode(state),
    fold(
      err => {
        console.log(err)
        return undefined
      },
      d => d
    )
  );
};
