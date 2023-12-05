import { ConfiguratorStateLayouting, getChartConfig } from "@/config-types";

export const ChartLayouter = ({
  state,
}: {
  state: ConfiguratorStateLayouting;
}) => {
  const chartConfig = getChartConfig(state);

  return <></>;
};
