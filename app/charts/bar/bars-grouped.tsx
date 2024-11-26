import { useEffect, useMemo, useRef } from "react";

import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { RenderBarDatum, renderBars } from "@/charts/bar/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import {
  RenderWhiskerDatum,
  filterWithoutErrors,
  renderContainer,
  renderWhiskers,
} from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const ErrorWhiskers = () => {
  const {
    bounds,
    xScale,
    xScaleIn,
    getYErrorRange,
    getYError,
    yScale,
    getSegment,
    grouped,
    showYStandardError,
  } = useChartState() as GroupedBarsState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderWhiskerDatum[] = useMemo(() => {
    if (!getYErrorRange || !showYStandardError) {
      return [];
    }

    const bandwidth = xScaleIn.bandwidth();
    return grouped
      .filter((d) => d[1].some(filterWithoutErrors(getYError)))
      .flatMap(([segment, observations]) =>
        observations.map((d) => {
          const x0 = xScaleIn(getSegment(d)) as number;
          const barWidth = Math.min(bandwidth, 15);
          const [y1, y2] = getYErrorRange(d);
          return {
            key: `${segment}-${getSegment(d)}`,
            x: (xScale(segment) as number) + x0 + bandwidth / 2 - barWidth / 2,
            y1: yScale(y1),
            y2: yScale(y2),
            width: barWidth,
          } as RenderWhiskerDatum;
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getSegment,
    getYErrorRange,
    getYError,
    grouped,
    showYStandardError,
    xScale,
    xScaleIn,
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
        render: (g, opts) => renderWhiskers(g, renderData, opts),
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
    xScaleIn,
    getY,
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
  const bandwidth = xScaleIn.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderBarDatum[] = useMemo(() => {
    return grouped.flatMap(([segment, observations]) => {
      return observations.map((d) => {
        const key = getRenderingKey(d, getSegment(d));
        const x = getSegment(d);
        const y = getY(d) ?? NaN;

        return {
          key,
          x: (xScale(segment) as number) + (xScaleIn(x) as number),
          y: yScale(Math.max(y, 0)),
          width: bandwidth,
          height: Math.max(0, Math.abs(yScale(y) - y0)),
          color: colors(x),
        };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    colors,
    getSegment,
    bandwidth,
    getY,
    grouped,
    xScaleIn,
    xScale,
    yScale,
    y0,
    getRenderingKey,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars-grouped",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderBars(g, renderData, { ...opts, y0 }),
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
