import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from "fp-ts/lib/Either";

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
const GenericField = t.type({ componentIri: t.string });
export type GenericField = t.TypeOf<typeof GenericField>;

export type GenericFields = Record<string, GenericField | undefined>;

const SortingOrder = t.union([t.literal("asc"), t.literal("desc")]);
export type SortingOrder = t.TypeOf<typeof SortingOrder>;

const AreaFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),
  t.partial({
    segment: t.type({
      componentIri: t.string,
      palette: t.string,
    }),
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

const BarFields = t.intersection([
  t.type({
    x: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.partial({
        sorting: t.type({
          sortingField: t.union([t.literal("alphabetical"), t.literal("y")]),
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
    y: GenericField,
  }),
  t.partial({
    segment: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.type({
        type: t.union([t.literal("stacked"), t.literal("grouped")]),
      }),
      t.type({ palette: t.string }),
      t.partial({
        sorting: t.type({
          sortingField: t.union([
            t.literal("alphabetical"),
            t.literal("totalSize"),
          ]),
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
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
          sortingField: t.union([t.literal("alphabetical"), t.literal("y")]),
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
    y: GenericField,
  }),
  t.partial({
    segment: t.intersection([
      t.type({
        componentIri: t.string,
      }),
      t.type({
        type: t.union([t.literal("stacked"), t.literal("grouped")]),
      }),
      t.type({ palette: t.string }),
      t.partial({
        sorting: t.type({
          sortingField: t.union([
            t.literal("alphabetical"),
            t.literal("totalSize"),
          ]),
          sortingOrder: SortingOrder,
        }),
      }),
    ]),
  }),
]);
const ColumnConfig = t.type(
  {
    chartType: t.literal("column"),
    filters: Filters,
    fields: ColumnFields,
    // FIXME: Should the sorting settings be at the ChartConfig level?
    // sorting: [{sortByField: "x", sortingField: "y", sortingOrder: "asc", }]
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
    segment: t.type({
      componentIri: t.string,
      palette: t.string,
    }),
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

const ScatterPlotFields = t.intersection([
  t.type({
    x: GenericField,
    y: GenericField,
  }),
  t.partial({
    segment: t.type({
      componentIri: t.string,
      palette: t.string,
    }),
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
  // FIXME: "segment" should be "x"
  segment: t.type({
    componentIri: t.string,
    palette: t.string,
    sorting: t.type({
      sortingField: t.union([
        t.literal("alphabetical"),
        t.literal("totalSize"),
      ]),
      sortingOrder: SortingOrder,
    }),
  }),
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

export type ChartFields =
  | ColumnFields
  | BarFields
  | LineFields
  | AreaFields
  | ScatterPlotFields
  | PieFields;

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
