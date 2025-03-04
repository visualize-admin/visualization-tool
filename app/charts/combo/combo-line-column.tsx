import { line } from "d3-shape";
import { memo, useEffect, useMemo, useRef } from "react";

import {
  RenderColumnDatum,
  renderColumns,
} from "@/charts/column/rendering-utils";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { Observation } from "@/domain/data";
import { useTransitionStore } from "@/stores/transition";

const Columns = () => {
  const {
    chartData,
    bounds,
    xScale,
    getX,
    y,
    yOrientationScales,
    colors,
    getRenderingKey,
  } = useChartState() as ComboLineColumnState;
  const { margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const bandwidth = xScale.bandwidth();
  const yColumn = y.left.chartType === "column" ? y.left : y.right;
  const yScale =
    y.left.chartType === "column"
      ? yOrientationScales.left
      : yOrientationScales.right;
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = useMemo(() => {
    return chartData.map((d) => {
      const key = getRenderingKey(d);
      const xScaled = xScale(getX(d)) as number;
      const y = yColumn.getY(d) ?? NaN;
      const yScaled = yScale(y);
      const yRender = yScale(Math.max(y, 0));
      const height = Math.max(0, Math.abs(yScaled - y0));
      const color = colors(yColumn.label);

      return {
        key,
        value: y,
        x: xScaled,
        y: yRender,
        width: bandwidth,
        height,
        color,
      };
    });
  }, [
    chartData,
    getRenderingKey,
    xScale,
    getX,
    yColumn,
    yScale,
    y0,
    colors,
    bandwidth,
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

const Lines = () => {
  const { chartData, xScale, getX, yOrientationScales, y, colors, bounds } =
    useChartState() as ComboLineColumnState;
  const yLine = y.left.chartType === "line" ? y.left : y.right;
  const yScale =
    y.left.chartType === "line"
      ? yOrientationScales.left
      : yOrientationScales.right;
  const pathGenerator = line<Observation>()
    // FIXME: add missing observations basing on the time interval, so we can
    // properly indicate the missing data.
    .defined((d) => {
      const y = yLine.getY(d);
      return y !== null && !isNaN(y);
    })
    .x((d) => (xScale(getX(d)) as number) + xScale.bandwidth() * 0.5)
    .y((d) => yScale(yLine.getY(d) as number));

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      <Line
        path={pathGenerator(chartData) as string}
        color={colors(yLine.label)}
      />
    </g>
  );
};

type LineProps = {
  path: string;
  color: string;
};

const Line = memo(function Line(props: LineProps) {
  const { path, color } = props;

  return <path d={path} stroke={color} strokeWidth={4} fill="none" />;
});

export const ComboLineColumn = () => {
  return (
    <>
      <Columns />
      <Lines />
    </>
  );
};
