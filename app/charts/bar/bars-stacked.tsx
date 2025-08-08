import { useEffect, useMemo, useRef } from "react";

import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import {
  renderBars,
  useGetRenderStackedBarDatum,
} from "@/charts/bar/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const BarsStacked = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const {
    bounds: { height, margins },
    xScale,
    series,
  } = useChartState() as StackedBarsState;
  const getRenderDatum = useGetRenderStackedBarDatum();

  const renderData = useMemo(() => {
    return series.flatMap(getRenderDatum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getRenderDatum,
    series,
    // We need to reset the yRange on height change.
    height,
  ]);

  const x0 = xScale(0);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars-stacked",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderBars(g, renderData, { ...opts, x0 }),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
    x0,
  ]);

  return <g ref={ref} />;
};
