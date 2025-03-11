import { useEffect, useMemo, useRef } from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import {
  RenderColumnDatum,
  renderColumns,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const ColumnsStacked = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { bounds, getX, xScale, yScale, colors, series, getRenderingKey } =
    useChartState() as StackedColumnsState;
  const { margins, height } = bounds;
  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = useMemo(() => {
    return series.flatMap((d) => {
      const color = colors(d.key);

      return d.map((segment) => {
        const observation = segment.data;

        return {
          key: getRenderingKey(observation, d.key),
          x: xScale(getX(observation)) as number,
          y: yScale(segment[1]),
          width: bandwidth,
          height: Math.max(0, yScale(segment[0]) - yScale(segment[1])),
          color,
        };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bandwidth,
    colors,
    getX,
    series,
    xScale,
    yScale,
    getRenderingKey,
    // Need to reset the yRange on height change
    height,
  ]);

  useEffect(() => {
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
