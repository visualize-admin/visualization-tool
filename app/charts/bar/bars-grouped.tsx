import { useEffect, useMemo, useRef } from "react";

import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { RenderBarDatum, renderBars } from "@/charts/bar/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import {
  renderContainer,
  renderHorizontalWhisker,
  RenderHorizontalWhiskerDatum,
} from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const ErrorWhiskers = () => {
  const {
    bounds,
    xScale,
    yScaleIn,
    getXErrorRange,
    getXErrorPresent,
    yScale,
    getSegment,
    grouped,
    showXUncertainty,
  } = useChartState() as GroupedBarsState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData = useMemo(() => {
    if (!getXErrorRange || !showXUncertainty) {
      return [];
    }

    const bandwidth = yScaleIn.bandwidth();

    return grouped
      .filter((d) => d[1].some(getXErrorPresent))
      .flatMap(([segment, observations]) =>
        observations.map((d) => {
          const y0 = yScaleIn(getSegment(d)) as number;
          const barHeight = Math.min(bandwidth, 15);
          const [x1, x2] = getXErrorRange(d);

          return {
            key: `${segment}-${getSegment(d)}`,
            y: (yScale(segment) as number) + y0 + bandwidth / 2 - barHeight / 2,
            x1: xScale(x1),
            x2: xScale(x2),
            height: barHeight,
          } satisfies RenderHorizontalWhiskerDatum;
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getSegment,
    getXErrorRange,
    getXErrorPresent,
    grouped,
    showXUncertainty,
    xScale,
    yScaleIn,
    yScale,
    width,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars-grouped-error-whiskers",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderHorizontalWhisker(g, renderData, opts),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
  ]);

  return <g ref={ref} />;
};

export const BarsGrouped = () => {
  const {
    bounds,
    xScale,
    yScaleIn,
    getX,
    yScale,
    getSegment,
    colors,
    grouped,
    getRenderingKey,
  } = useChartState() as GroupedBarsState;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { margins, height } = bounds;
  const bandwidth = yScaleIn.bandwidth();
  const x0 = xScale(0);
  const renderData: RenderBarDatum[] = useMemo(() => {
    return grouped.flatMap(([segment, observations]) => {
      return observations.map((d) => {
        const key = getRenderingKey(d, getSegment(d));
        const y = getSegment(d);
        const x = getX(d) ?? NaN;

        return {
          key,
          y: (yScale(segment) as number) + (yScaleIn(y) as number),
          x: xScale(Math.min(x, 0)),
          width: Math.max(0, Math.abs(xScale(x) - x0)),
          height: bandwidth,
          color: colors(y),
          observation: d,
        };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    colors,
    getSegment,
    bandwidth,
    getX,
    grouped,
    yScaleIn,
    xScale,
    yScale,
    x0,
    getRenderingKey,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars-grouped",
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
