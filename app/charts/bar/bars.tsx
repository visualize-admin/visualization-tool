import { schemeCategory10 } from "d3-scale-chromatic";
import { useEffect, useMemo, useRef } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { RenderBarDatum, renderBars } from "@/charts/bar/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import {
  RenderHorizontalWhiskerDatum,
  renderContainer,
  renderHorizontalWhisker,
} from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";
import { useTheme } from "@/themes";

export const ErrorWhiskers = () => {
  const {
    getY,
    getXErrorPresent,
    getXErrorRange,
    chartData,
    yScale,
    xScale,
    showXUncertainty,
    bounds,
  } = useChartState() as BarsState;
  const { margins, width, chartHeight } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderHorizontalWhiskerDatum[] = useMemo(() => {
    if (!getXErrorRange || !showXUncertainty) {
      return [];
    }

    const bandwidth = yScale.bandwidth();
    return chartData.filter(getXErrorPresent).map((d, i) => {
      const y0 = yScale(getY(d)) as number;
      const barHeight = Math.min(bandwidth, 16);
      const [x1, x2] = getXErrorRange(d);
      return {
        key: `${i}`,
        y: y0 + bandwidth / 2 - barHeight / 2,
        x1: xScale(x1),
        x2: xScale(x2),
        height: barHeight,
      } as RenderHorizontalWhiskerDatum;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chartData,
    getY,
    getXErrorPresent,
    getXErrorRange,
    showXUncertainty,
    xScale,
    yScale,
    width,
    chartHeight,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars-error-whiskers",
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

export const Bars = () => {
  const {
    chartData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    getRenderingKey,
    colors,
  } = useChartState() as BarsState;
  const theme = useTheme();
  const { margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = yScale.bandwidth();
  const x0 = xScale(0);
  const renderData: RenderBarDatum[] = useMemo(() => {
    return chartData.map((d) => {
      const key = getRenderingKey(d);
      const yScaled = yScale(getY(d)) as number;
      const xRaw = getX(d);
      const x = xRaw === null || isNaN(xRaw) ? 0 : xRaw;
      const xScaled = xScale(x);
      const xRender = xScale(Math.min(x, 0));
      const width = Math.max(0, Math.abs(xScaled - x0));

      return {
        key,
        x: xRender,
        y: yScaled,
        width,
        height: bandwidth,
        color: colors(d.key as string) ?? schemeCategory10[0],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bounds.width,
    chartData,
    bandwidth,
    getX,
    getY,
    xScale,
    yScale,
    x0,
    theme.palette.secondary.main,
    getRenderingKey,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "bars",
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
