import clsx from "clsx";
import { fold } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { Layouts } from "react-grid-layout";
import { ObjectInspector } from "react-inspector";

import { ChartPanelLayoutTypeProps } from "@/components/chart-panel";
import ChartGridLayout, { generateLayout } from "@/components/react-grid";
import { ReactGridLayoutsType, isLayouting } from "@/configurator";
import { useConfiguratorState } from "@/src";

export const chartPanelLayoutGridClasses = {
  root: "chart-panel-grid-layout",
};

const ChartPanelLayoutGrid = (props: ChartPanelLayoutTypeProps) => {
  const { chartConfigs } = props;
  const [config, dispatch] = useConfiguratorState(isLayouting);
  const [layouts, setLayouts] = useState<Layouts>(() => {
    if (
      config.layout.type === "dashboard" &&
      config.layout.layout === "tiles"
    ) {
      return config.layout.layouts;
    }
    return {
      lg: generateLayout({
        count: props.chartConfigs.length,
        layout: "tiles",
      }),
    };
  });

  const handleChangeLayouts = (layouts: Layouts) => {
    const layout = config.layout;
    if (layout.type !== "dashboard" || layout.layout !== "tiles") {
      // Should not happen
      return;
    }

    const parsedLayouts = pipe(
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
    <>
      <ChartGridLayout
        className={clsx("layout", chartPanelLayoutGridClasses.root)}
        layouts={layouts}
        resize
        onLayoutChange={(_l, allLayouts) => handleChangeLayouts(allLayouts)}
      >
        {chartConfigs.map((chartConfig) => props.renderChart(chartConfig))}
      </ChartGridLayout>
      <ObjectInspector data={layouts} />
    </>
  );
};

export default ChartPanelLayoutGrid;
