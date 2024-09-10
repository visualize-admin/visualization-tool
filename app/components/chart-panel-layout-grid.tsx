import clsx from "clsx";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Layouts } from "react-grid-layout";

import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";
import ChartGridLayout from "@/components/react-grid";
import { ReactGridLayoutsType, hasChartConfigs } from "@/configurator";
import { useConfiguratorState } from "@/src";
import { assert } from "@/utils/assert";

export const chartPanelLayoutGridClasses = {
  root: "chart-panel-grid-layout",
  dragHandle: "chart-panel-grid-layout-drag-handle",
};

const decodeLayouts = (layouts: Layouts) => {
  return pipe(
    ReactGridLayoutsType.decode(layouts),
    fold(
      (err) => {
        console.error("Error while decoding react-grid-layout", err);
        return undefined;
      },
      (d) => {
        return d;
      }
    )
  );
};

const ChartPanelLayoutCanvas = (props: ChartPanelLayoutTypeProps) => {
  const { chartConfigs } = props;
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const [layouts, setLayouts] = useState<Layouts>(() => {
    assert(
      state.layout.type === "dashboard" && state.layout.layout === "canvas",
      "ChartPanelLayoutGrid should be rendered only for dashboard layout with canvas"
    );

    return state.layout.layouts;
  });

  const handleChangeLayouts = (layouts: Layouts) => {
    const layout = state.layout;
    assert(
      layout.type === "dashboard" && layout.layout === "canvas",
      "ChartPanelLayoutGrid should be rendered only for dashboard layout with canvas"
    );

    const parsedLayouts = decodeLayouts(layouts);
    if (!parsedLayouts) {
      return;
    }

    dispatch({
      type: "LAYOUT_CHANGED",
      value: {
        ...layout,
        layouts: parsedLayouts,
      },
    });
    setLayouts(layouts);
  };

  return (
    <ChartGridLayout
      key={state.state}
      className={clsx(chartPanelLayoutGridClasses.root, props.className)}
      layouts={layouts}
      resize={state.state === "LAYOUTING"}
      draggableHandle={`.${chartPanelLayoutGridClasses.dragHandle}`}
      onLayoutChange={(_l, allLayouts) => handleChangeLayouts(allLayouts)}
    >
      {chartConfigs.map((chartConfig) => props.renderChart(chartConfig))}
    </ChartGridLayout>
  );
};

export default ChartPanelLayoutCanvas;
