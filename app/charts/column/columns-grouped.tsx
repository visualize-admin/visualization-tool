import { useEffect, useMemo, useRef } from "react";

import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import {
  RenderColumnDatum,
  renderColumns,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import {
  renderContainer,
  RenderVerticalWhiskerDatum,
  renderVerticalWhiskers,
} from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const ErrorWhiskers = () => {
  const {
    bounds,
    xScale,
    xScaleIn,
    getY,
    getYErrorRange,
    getYErrorPresent,
    yScale,
    getSegment,
    grouped,
    showYUncertainty,
  } = useChartState() as GroupedColumnsState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData = useMemo(() => {
    if (!getYErrorRange || !showYUncertainty) {
      return [];
    }

    const bandwidth = xScaleIn.bandwidth();

    return grouped
      .filter((d) => d[1].some(getYErrorPresent))
      .flatMap(([segment, observations]) =>
        observations.map((d) => {
          const x0 = xScaleIn(getSegment(d)) as number;
          const barWidth = Math.min(bandwidth, 15);
          const y = getY(d) as number;
          const [y1, y2] = getYErrorRange(d);

          return {
            key: `${segment}-${getSegment(d)}`,
            x: (xScale(segment) as number) + x0 + bandwidth / 2 - barWidth / 2,
            y: yScale(y),
            y1: yScale(y1),
            y2: yScale(y2),
            width: barWidth,
          } satisfies RenderVerticalWhiskerDatum;
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getSegment,
    getY,
    getYErrorRange,
    getYErrorPresent,
    grouped,
    showYUncertainty,
    xScale,
    xScaleIn,
    yScale,
    width,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "columns-grouped-error-whiskers",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderVerticalWhiskers(g, renderData, opts),
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

export const ColumnsGrouped = () => {
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
  } = useChartState() as GroupedColumnsState;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { margins, height } = bounds;
  const bandwidth = xScaleIn.bandwidth();
  const y0 = yScale(0);
  const renderData = useMemo(() => {
    return grouped.flatMap(([segment, observations]) => {
      return observations.map((d) => {
        const key = getRenderingKey(d, getSegment(d));
        const x = getSegment(d);
        const y = getY(d) as number;

        return {
          key,
          x: (xScale(segment) as number) + (xScaleIn(x) as number),
          y: yScale(Math.max(y, 0)),
          width: bandwidth,
          height: Math.max(0, Math.abs(yScale(y) - y0)),
          color: colors(x),
        } satisfies RenderColumnDatum;
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
        id: "columns-grouped",
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
