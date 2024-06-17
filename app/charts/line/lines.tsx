import { useTheme } from "@mui/material";
import { line } from "d3-shape";
import { Fragment, memo, useEffect, useMemo, useRef } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  RenderWhiskerDatum,
  filterWithoutErrors,
  renderContainer,
  renderWhiskers,
} from "@/charts/shared/rendering-utils";
import { Observation } from "@/domain/data";
import { useTransitionStore } from "@/stores/transition";

export const ErrorWhiskers = () => {
  const theme = useTheme();
  const {
    getX,
    getYError,
    getYErrorRange,
    chartData,
    yScale,
    xScale,
    showYStandardError,
    bounds,
  } = useChartState() as LinesState;
  const { margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderWhiskerDatum[] = useMemo(() => {
    if (!getYErrorRange || !showYStandardError) {
      return [];
    }

    return chartData.filter(filterWithoutErrors(getYError)).map((d, i) => {
      const x0 = xScale(getX(d)) as number;
      const barWidth = 15;
      const [y1, y2] = getYErrorRange(d);
      return {
        key: `${i}`,
        x: x0 - barWidth / 2,
        y1: yScale(y1),
        y2: yScale(y2),
        width: barWidth,
        fill: theme.palette.primary.main,
        renderMiddleCircle: true,
      } as RenderWhiskerDatum;
    });
  }, [
    chartData,
    getX,
    getYError,
    getYErrorRange,
    showYStandardError,
    theme.palette.primary.main,
    xScale,
    yScale,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "lines-error-whiskers",
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

export const Lines = () => {
  const { getX, xScale, getY, yScale, grouped, colors, bounds } =
    useChartState() as LinesState;

  const lineGenerator = line<Observation>()
    .defined((d) => {
      const y = getY(d);
      return y !== null && !isNaN(y);
    })
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d) as number));

  return (
    <g transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}>
      {Array.from(grouped).map((observation, index) => {
        return (
          <Fragment key={observation[0]}>
            <Line
              key={index}
              path={lineGenerator(observation[1]) as string}
              color={colors(observation[0])}
            />
          </Fragment>
        );
      })}
    </g>
  );
};

const Line = memo(function Line({
  path,
  color,
}: {
  path: string;
  color: string;
}) {
  return <path d={path} stroke={color} fill="none" />;
});
