import { ChartConfig } from "@/configurator";
import { DataCubeDimension, DataCubeMeasure, Observation } from "@/domain/data";

export type ComponentsByIri = Record<
  string,
  DataCubeDimension | DataCubeMeasure
>;

export type DimensionsByIri = Record<string, DataCubeDimension>;

export type MeasuresByIri = Record<string, DataCubeMeasure>;

export type BaseChartProps = {
  observations: Observation[];
  dimensions: DataCubeDimension[];
  dimensionsByIri: DimensionsByIri;
  measures: DataCubeMeasure[];
  measuresByIri: MeasuresByIri;
};

export type ChartProps<TChartConfig extends ChartConfig> = BaseChartProps & {
  chartConfig: TChartConfig;
};
