import * as t from "io-ts";

const AreaConfig = t.type(
  {
    type: t.literal("area")
  },
  "AreaConfig"
);
export type AreaConfig = t.TypeOf<typeof AreaConfig>;

const BarConfig = t.type(
  {
    type: t.literal("bar")
  },
  "BarConfig"
);
export type BarConfig = t.TypeOf<typeof BarConfig>;

const LineConfig = t.type(
  {
    type: t.literal("line")
  },
  "LineConfig"
);
export type LineConfig = t.TypeOf<typeof LineConfig>;

const ScatterPlotConfig = t.type(
  {
    type: t.literal("scatterplot")
  },
  "ScatterPlotConfig"
);
export type ScatterPlotConfig = t.TypeOf<typeof ScatterPlotConfig>;

// interface IriBrand {
//   readonly IRI: unique symbol;
// }
// const Iri = t.brand(
//   t.string,
//   (s): s is t.Branded<string, IriBrand> => true,
//   "IRI"
// );

const Filters = t.record(
  t.string,
  t.record(t.string, t.boolean, "FilterValue"),
  "FilterDimension"
);

export type Filters = t.TypeOf<typeof Filters>;

const Config = t.type(
  {
    filters: Filters,
    chartConfig: t.union([AreaConfig, BarConfig, LineConfig, ScatterPlotConfig])
  },
  "Config"
);

export type Config = t.TypeOf<typeof Config>;
