import { schemeCategory10 } from "d3-scale-chromatic";
import { useEffect, useMemo, useRef } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { RenderBarDatum, renderBars } from "@/charts/bar/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import {
  RenderHorizontalWhiskerDatum,
  filterWithoutErrors,
  renderContainer,
  renderHorizontalWhisker,
} from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";
import { useTheme } from "@/themes";

export const ErrorWhiskers = () => {
  const {
    getY,
    getXError,
    getXErrorRange,
    chartData,
    yScale,
    xScale,
    showXStandardError,
    bounds,
  } = useChartState() as BarsState;
  const { margins, width, height } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderHorizontalWhiskerDatum[] = useMemo(() => {
    if (!getXErrorRange || !showXStandardError) {
      return [];
    }

    const bandwidth = yScale.bandwidth();
    return chartData.filter(filterWithoutErrors(getXError)).map((d, i) => {
      const y0 = yScale(getY(d)) as number;
      const barWidth = Math.min(bandwidth, 15);
      const [x1, x2] = getXErrorRange(d);
      return {
        key: `${i}`,
        y: y0 + bandwidth / 2 - barWidth / 2,
        x1: xScale(x1),
        x2: xScale(x2),
        width: barWidth,
      } as RenderHorizontalWhiskerDatum;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chartData,
    getY,
    getXError,
    getXErrorRange,
    showXStandardError,
    xScale,
    yScale,
    width,
    height,
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
  const { chartData, bounds, getX, xScale, getY, yScale, getRenderingKey } =
    useChartState() as BarsState;
  const theme = useTheme();
  const { margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = yScale.bandwidth();
  const x0 = xScale(0);
  const renderData: RenderBarDatum[] = useMemo(() => {
    const getColor = (d: number) => {
      return d <= 0 ? theme.palette.secondary.main : schemeCategory10[0];
    };

    return chartData.map((d) => {
      const key = getRenderingKey(d);
      const yScaled = yScale(getY(d)) as number;
      const xRaw = getX(d);
      const x = xRaw === null || isNaN(xRaw) ? 0 : xRaw;
      const xScaled = xScale(x);
      const xRender = xScale(Math.min(x, 0));
      const width = Math.max(0, Math.abs(xScaled - x0));
      const color = getColor(x);

      return {
        key,
        x: xRender,
        y: yScaled,
        width,
        height: bandwidth,
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
