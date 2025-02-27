import { useEffect, useMemo, useRef } from "react";

import { ColumnsState } from "@/charts/column/columns-state";
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
    getX,
    getYErrorPresent,
    getYErrorRange,
    chartData,
    yScale,
    xScale,
    showYUncertainty,
    bounds,
  } = useChartState() as ColumnsState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderVerticalWhiskerDatum[] = useMemo(() => {
    if (!getYErrorRange || !showYUncertainty) {
      return [];
    }

    const bandwidth = xScale.bandwidth();
    return chartData.filter(getYErrorPresent).map((d, i) => {
      const x0 = xScale(getX(d)) as number;
      const barWidth = Math.min(bandwidth, 15);
      const [y1, y2] = getYErrorRange(d);
      return {
        key: `${i}`,
        x: x0 + bandwidth / 2 - barWidth / 2,
        y1: yScale(y1),
        y2: yScale(y2),
        width: barWidth,
      } as RenderVerticalWhiskerDatum;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chartData,
    getX,
    getYErrorPresent,
    getYErrorRange,
    showYUncertainty,
    xScale,
    yScale,
    width,
    height,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "columns-error-whiskers",
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

export const Columns = () => {
  const {
    chartData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    getRenderingKey,
    colors,
  } = useChartState() as ColumnsState;
  const { margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = useMemo(() => {
    return chartData.map((d) => {
      const key = getRenderingKey(d);
      const xScaled = xScale(getX(d)) as number;
      const yRaw = getY(d);
      const y = yRaw === null || isNaN(yRaw) ? 0 : yRaw;
      const yScaled = yScale(y);
      const yRender = yScale(Math.max(y, 0));
      const height = Math.max(0, Math.abs(yScaled - y0));
      // Calling colors(key) directly results in every key being added to the domain,
      // which is not what we want.
      const color = colors.copy()(key);

      return {
        key,
        x: xScaled,
        y: yRender,
        width: bandwidth,
        height,
        color,
      };
    });
  }, [
    chartData,
    bandwidth,
    getX,
    getY,
    xScale,
    yScale,
    y0,
    colors,
    getRenderingKey,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "columns",
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
