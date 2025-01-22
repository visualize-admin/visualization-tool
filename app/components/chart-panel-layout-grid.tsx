import clsx from "clsx";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Layouts } from "react-grid-layout";

import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";
import {
  ChartGridLayout,
  FREE_CANVAS_BREAKPOINTS,
} from "@/components/react-grid";
import { hasChartConfigs, ReactGridLayoutsType } from "@/configurator";
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

export const ChartPanelLayoutCanvas = ({
  blocks,
  renderBlock,
  className,
}: ChartPanelLayoutTypeProps) => {
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const layout = state.layout;
  assert(
    layout.type === "dashboard" && layout.layout === "canvas",
    "ChartPanelLayoutGrid should be rendered only for dashboard layout with canvas"
  );
  const handleChangeLayouts = (layouts: Layouts) => {
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
  };

  return (
    <ChartGridLayout
      key={state.state}
      className={clsx(chartPanelLayoutGridClasses.root, className)}
      layouts={layout.layouts}
      resize={state.state === "LAYOUTING"}
      draggableHandle={`.${chartPanelLayoutGridClasses.dragHandle}`}
      onLayoutChange={(_, allLayouts) => handleChangeLayouts(allLayouts)}
      breakpoints={FREE_CANVAS_BREAKPOINTS}
    >
      {blocks.map(renderBlock)}
    </ChartGridLayout>
  );
};
