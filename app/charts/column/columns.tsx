import { schemeCategory10 } from "d3";
import React from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import {
  RenderColumnDatum,
  renderColumns,
  RenderWhiskerDatum,
  renderWhiskers,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";
import { useTheme } from "@/themes";

export const ErrorWhiskers = () => {
  const {
    getX,
    getYErrorRange,
    chartData,
    yScale,
    xScale,
    showYStandardError,
    bounds,
  } = useChartState() as ColumnsState;
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderWhiskerDatum[] = React.useMemo(() => {
    if (!getYErrorRange || !showYStandardError) {
      return [];
    }

    return chartData.map((d, i) => {
      const x0 = xScale(getX(d)) as number;
      const bandwidth = xScale.bandwidth();
      const barwidth = Math.min(bandwidth, 15);
      const [y1, y2] = getYErrorRange(d);

      return {
        key: `${i}`,
        x: x0 + bandwidth / 2 - barwidth / 2,
        y1: yScale(y1),
        y2: yScale(y2),
        width: barwidth,
      };
    });
  }, [chartData, getX, getYErrorRange, showYStandardError, xScale, yScale]);

  React.useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "columns-error-whiskers",
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

export const Columns = () => {
  const { chartData, bounds, getX, xScale, getY, yScale, getRenderingKey } =
    useChartState() as ColumnsState;
  const theme = useTheme();
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = React.useMemo(() => {
    const getColor = (d: number) => {
      return d <= 0 ? theme.palette.secondary.main : schemeCategory10[0];
    };

    return chartData.map((d) => {
      const key = getRenderingKey(d);
      const xScaled = xScale(getX(d)) as number;
      const y = getY(d) ?? NaN;
      const yScaled = yScale(y);
      const yRender = yScale(Math.max(y, 0));
      const height = Math.abs(yScaled - y0);
      const color = getColor(y);

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
    theme.palette.secondary.main,
    getRenderingKey,
  ]);

  React.useEffect(() => {
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
