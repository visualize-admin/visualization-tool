import { useEffect, useState } from "react";
import { Layouts } from "react-grid-layout";

import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";
import ChartGridLayout, {
  availableHandles,
  generateLayout,
} from "@/components/react-grid";

const ChartPanelLayoutGrid = (props: ChartPanelLayoutTypeProps) => {
  const { chartConfigs } = props;
  const [resizeHandles, setResizeHandles] = useState(() => availableHandles);
  const [layouts, setLayouts] = useState<Layouts>(() => {
    return {
      lg: generateLayout({
        count: props.chartConfigs.length,
        layout: "tiles",
      }),
    };
  });
  useEffect(() => {
    setLayouts({
      lg: generateLayout({
        count: chartConfigs.length,
        layout: "tiles",
      }),
    });
  }, [chartConfigs.length, resizeHandles]);

  return (
    <ChartGridLayout
      className={"layout"}
      layouts={layouts}
      resize
      resizeHandles={resizeHandles}
      onLayoutChange={(_l, allLayouts) => setLayouts(allLayouts)}
    >
      {chartConfigs.map((chartConfig) => props.renderChart(chartConfig))}
    </ChartGridLayout>
  );
};

export default ChartPanelLayoutGrid;
