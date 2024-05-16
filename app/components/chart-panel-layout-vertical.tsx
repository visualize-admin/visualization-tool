import { ChartConfig } from "@/config-types";

type ChartPanelLayoutVerticalProps = {
  chartConfigs: ChartConfig[];
  renderChart: (chartConfig: ChartConfig) => JSX.Element;
};

export const ChartPanelLayoutVertical = (
  props: ChartPanelLayoutVerticalProps
) => {
  const { chartConfigs, renderChart } = props;
  return <>{chartConfigs.map(renderChart)}</>;
};
