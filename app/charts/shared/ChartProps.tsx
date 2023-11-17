import { ChartConfig } from "@/configurator";
import { Dimension, Measure, Observation } from "@/domain/data";

export type ComponentsByIri = Record<string, Dimension | Measure>;

export type DimensionsByIri = Record<string, Dimension>;

export type MeasuresByIri = Record<string, Measure>;

export type BaseChartProps = {
  observations: Observation[];
  dimensions: Dimension[];
  dimensionsByIri: DimensionsByIri;
  measures: Measure[];
  measuresByIri: MeasuresByIri;
};

export type ChartProps<TChartConfig extends ChartConfig> = BaseChartProps & {
  chartConfig: TChartConfig;
};
