import { ChartConfig, DataSource } from "@/config-types";
import { Dimension, Measure, Observation } from "@/domain/data";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

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

export type VisualizationProps<TChartConfig extends ChartConfig> = {
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: TChartConfig;
  observationQueryFilters: DataCubeObservationFilter[];
};
