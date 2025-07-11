import { line } from "d3-shape";
import { Fragment, memo, useEffect, useMemo, useRef } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { renderTotalValueLabels } from "@/charts/shared/render-value-labels";
import {
  renderContainer,
  RenderVerticalWhiskerDatum,
  renderVerticalWhiskers,
} from "@/charts/shared/rendering-utils";
import { useRenderTemporalValueLabelsData } from "@/charts/shared/show-values-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { ShowDotsSize } from "@/config-types";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
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
  const renderData = useMemo(() => {
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
      } satisfies RenderVerticalWhiskerDatum;
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

export const Lines = ({ dotSize }: { dotSize?: ShowDotsSize }) => {
  const { getX, xScale, getY, yScale, grouped, colors, bounds } =
    useChartState() as LinesState;
  const { margins } = bounds;
  const { labelFontSize, fontFamily } = useChartTheme();
  const valueLabelsContainerRef = useRef<SVGGElement>(null);

  const lineGenerator = line<Observation>()
    .defined((d) => {
      const y = getY(d);
      return y !== null && !isNaN(y);
    })
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d) as number));

  const valueLabelsData = useRenderTemporalValueLabelsData();

  useEffect(() => {
    if (valueLabelsContainerRef.current) {
      renderContainer(valueLabelsContainerRef.current, {
        id: "lines-value-labels",
        transform: "translate(0, 0)",
        transition: {
          enable: false,
          duration: 0,
        },
        render: (g, opts) =>
          renderTotalValueLabels(g, valueLabelsData, {
            ...opts,
            rotate: false,
            fontFamily,
            fontSize: labelFontSize,
          }),
      });
    }
  }, [margins.left, margins.top, valueLabelsData, labelFontSize, fontFamily]);

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {Array.from(grouped).map((observation, i) => {
        return (
          <Fragment key={observation[0]}>
            <Line
              key={i}
              path={lineGenerator(observation[1]) as string}
              color={colors(observation[0])}
            />
          </Fragment>
        );
      })}
      <Points dotSize={dotSize} />
      <g ref={valueLabelsContainerRef} />
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
  return <path data-testid="chart-line" d={path} stroke={color} fill="none" />;
});

const getPointRadius = (dotSize: ShowDotsSize) => {
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
      const _exhaustiveCheck: never = dotSize;
      return _exhaustiveCheck;
  }
};

const Points = ({ dotSize }: { dotSize?: ShowDotsSize }) => {
  const { getX, xScale, getY, yScale, bounds, chartData, getSegment, colors } =
    useChartState() as LinesState;
  const { chartHeight, width } = bounds;
  const dots = useMemo(() => {
    return chartData
      .map((d) => {
        const xScaled = xScale(getX(d));
        const y = getY(d);

        if (Number.isNaN(y) || y === null) {
          return;
        }

        const yScaled = yScale(y);
        const fill = colors(getSegment(d));

        return {
          x: xScaled,
          y: yScaled,
          fill,
        };
      })
      .filter(truthy);
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

  const r = getPointRadius(dotSize);

  return (
    <g>
      {dots.map(({ x, y, fill }, i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={fill} />
      ))}
    </g>
  );
};
