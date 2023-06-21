import { ChartConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export interface ChartProps {
  data: Observation[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  chartConfig: ChartConfig;
}
