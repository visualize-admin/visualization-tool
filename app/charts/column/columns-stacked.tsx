import React from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import {
  RenderColumnDatum,
  renderColumns,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const ColumnsStacked = () => {
  const ref = React.useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { bounds, getX, xScale, yScale, colors, series, getRenderingKey } =
    useChartState() as StackedColumnsState;
  const { margins } = bounds;
  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = React.useMemo(() => {
    return series.flatMap((d) => {
      const color = colors(d.key);

      return d.map((segment: $FixMe) => {
        const observation = segment.data;

        return {
          key: getRenderingKey(observation, d.key),
          x: xScale(getX(observation)) as number,
          y: yScale(segment[1]),
          width: bandwidth,
          height: yScale(segment[0]) - yScale(segment[1]),
          color,
        };
      });
    });
  }, [bandwidth, colors, getX, series, xScale, yScale, getRenderingKey]);

  React.useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "columns-stacked",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderColumns(g, renderData, { ...opts, y0 }),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
    y0,
  ]);

  return <g ref={ref} />;
};
