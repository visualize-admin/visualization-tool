import { ChartConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export type ComponentsByIri = Record<string, DimensionMetadataFragment>;

export type BaseChartProps = {
  observations: Observation[];
  dimensions: DimensionMetadataFragment[];
  dimensionsByIri: ComponentsByIri;
  measures: DimensionMetadataFragment[];
  measuresByIri: ComponentsByIri;
};

export type ChartProps<TChartConfig extends ChartConfig> = BaseChartProps & {
  chartConfig: TChartConfig;
};
