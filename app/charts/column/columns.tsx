import { select } from "d3";
import React from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import {
  RenderColumnDatum,
  RenderWhiskerDatum,
  renderColumn,
  renderWhisker,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useTheme } from "@/themes";

export const ErrorWhiskers = () => {
  const state = useChartState() as ColumnsState;
  const {
    getX,
    getYErrorRange,
    chartData,
    yScale,
    xScale,
    showYStandardError,
  } = state;
  const { margins } = state.bounds;
  const ref = React.useRef<SVGGElement>(null);

  const renderData: RenderWhiskerDatum[] | undefined = React.useMemo(() => {
    if (!getYErrorRange || !showYStandardError) {
      return;
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
    if (ref.current && renderData) {
      select(ref.current)
        .selectAll<SVGGElement, RenderWhiskerDatum>("g")
        .data(renderData, (d) => d.key)
        .call(renderWhisker);
    }
  }, [renderData]);

  return renderData ? (
    <g
      id="whiskers"
      ref={ref}
      transform={`translate(${margins.left} ${margins.top})`}
    />
  ) : null;
};

export const Columns = () => {
  const { chartData, bounds, getX, xScale, getY, yScale, getRenderingKey } =
    useChartState() as ColumnsState;
  const theme = useTheme();
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);

  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = React.useMemo(() => {
    const getColor = (d: number) => {
      return d <= 0 ? theme.palette.secondary.main : theme.palette.primary.main;
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
    theme.palette.primary.main,
    theme.palette.secondary.main,
    getRenderingKey,
  ]);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current)
        .selectAll<SVGRectElement, RenderColumnDatum>("rect")
        .data(renderData, (d) => d.key)
        .call(renderColumn, y0);
    }
  }, [renderData, yScale, y0]);

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`} />
  );
};
