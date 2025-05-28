import { EmbedQueryParams } from "@/components/embed-params";
import { ChartConfig, DataSource } from "@/config-types";
import { Dimension, Measure, Observation } from "@/domain/data";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

export type DimensionsById = Record<string, Dimension>;

export type MeasuresById = Record<string, Measure>;

export type BaseChartProps = {
  observations: Observation[];
  dimensions: Dimension[];
  dimensionsById: DimensionsById;
  measures: Measure[];
  measuresById: MeasuresById;
  embedParams?: EmbedQueryParams;
};

export type ChartProps<TChartConfig extends ChartConfig> = BaseChartProps & {
  chartConfig: TChartConfig;
};

export type VisualizationProps<TChartConfig extends ChartConfig> = {
  dataSource: DataSource;
  componentIds: string[] | undefined;
  chartConfig: TChartConfig;
  observationQueryFilters: DataCubeObservationFilter[];
  embedParams?: EmbedQueryParams;
};
