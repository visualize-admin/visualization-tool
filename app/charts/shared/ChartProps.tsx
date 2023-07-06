import { ChartConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export type BaseChartProps = {
  observations: Observation[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
};

export type ChartProps<TChartConfig extends ChartConfig> = BaseChartProps & {
  chartConfig: TChartConfig;
};
