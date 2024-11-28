import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";

export const ChartPanelLayoutVertical = ({
  blocks,
  renderBlock,
}: ChartPanelLayoutTypeProps) => {
  return <>{blocks.map(renderBlock)}</>;
};
