import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";

export const ChartPanelLayoutVertical = (props: ChartPanelLayoutTypeProps) => {
  const { chartConfigs, renderChart } = props;
  return <>{chartConfigs.map(renderChart)}</>;
};
