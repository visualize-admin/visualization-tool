import { ChartConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export type BaseChartProps = {
  /** Data used to draw the shapes. */
  chartData: Observation[];
  /** Data used to compute the scales. */
  scalesData: Observation[];
  /** Non-filtered data used e.g. in timeline. */
  allData: Observation[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
};

export type ChartProps<TChartConfig extends ChartConfig> = BaseChartProps & {
  chartConfig: TChartConfig;
};
