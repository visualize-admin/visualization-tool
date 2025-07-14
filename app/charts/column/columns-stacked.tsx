import { useEffect, useMemo, useRef } from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import {
  renderColumns,
  useGetRenderColumnDatum,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const ColumnsStacked = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { bounds, yScale, series } = useChartState() as StackedColumnsState;
  const { margins, height } = bounds;
  const getRenderColumnDatum = useGetRenderColumnDatum();
  const renderData = useMemo(() => {
    return series.flatMap(getRenderColumnDatum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getRenderColumnDatum,
    series,
    // We need to reset the yRange on height change.
    height,
  ]);
  const y0 = yScale(0);

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
