import { bisector } from "d3-array";
import { line } from "d3-shape";
import { Fragment, memo, useEffect, useMemo, useRef } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  RenderVerticalWhiskerDatum,
  renderContainer,
  renderVerticalWhiskers,
} from "@/charts/shared/rendering-utils";
import { LineConfig } from "@/config-types";
import { Observation } from "@/domain/data";
import { useTransitionStore } from "@/stores/transition";

export const ErrorWhiskers = () => {
  const {
    getX,
    getY,
    getYErrorPresent,
    getYErrorRange,
    chartData,
    yScale,
    xScale,
    showYUncertainty,
    colors,
    getSegment,
    bounds,
  } = useChartState() as LinesState;
  const { margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderVerticalWhiskerDatum[] = useMemo(() => {
    if (!getYErrorRange || !showYUncertainty) {
      return [];
    }

    return chartData.filter(getYErrorPresent).map((d, i) => {
      const x0 = xScale(getX(d)) as number;
      const segment = getSegment(d);
      const barWidth = 15;
      const y = getY(d) as number;
      const [y1, y2] = getYErrorRange(d);
      return {
        key: `${i}`,
        x: x0 - barWidth / 2,
        y: yScale(y),
        y1: yScale(y1),
        y2: yScale(y2),
        width: barWidth,
        fill: colors(segment),
        renderMiddleCircle: true,
      } as RenderVerticalWhiskerDatum;
    });
  }, [
    chartData,
    colors,
    getSegment,
    getX,
    getY,
    getYErrorPresent,
    getYErrorRange,
    showYUncertainty,
    xScale,
    yScale,
  ]);

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "lines-error-whiskers",
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

const getPointRadius = (dotSize: LineConfig["fields"]["y"]["showDotsSize"]) => {
  switch (dotSize) {
    case "Small":
      return 2;
    case "Medium":
      return 3;
    case "Large":
      return 4;
    case undefined:
      return 2;
    default:
      const _check: never = dotSize;
      return _check;
  }
};

export const Points = ({
  dotSize,
}: {
  dotSize: LineConfig["fields"]["y"]["showDotsSize"];
}) => {
  const { getX, xScale, getY, yScale, bounds, chartData, getSegment, colors } =
    useChartState() as LinesState;

  const { margins, chartHeight, width } = bounds;

  const ticksPos = useMemo(() => {
    return xScale.ticks(bounds.chartWidth / 90).map((tick) => {
      const x = xScale(tick);
      const date = xScale.invert(x);

      const bisectDate = bisector(
        (d: Observation, date: Date) => getX(d).getTime() - date.getTime()
      ).center;

      const i = bisectDate(chartData, date, 0);
      const y = yScale(getY(chartData[i]) as number);

      const segment = getSegment(chartData[i]);
      const color = colors(segment);

      return { x, y, color };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    width,
    chartHeight,
    xScale,
    yScale,
    getY,
    bounds.chartWidth,
    chartData,
    getX,
  ]);

  if (!dotSize) {
    return null;
  }

  const radius = getPointRadius(dotSize);

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {ticksPos.map(({ x, y, color }, i) => (
        <circle key={i} cx={x} cy={y} r={radius} fill={color} />
      ))}
    </g>
  );
};
