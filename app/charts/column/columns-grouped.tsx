import { select } from "d3";
import React from "react";

import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { RenderDatum, renderColumn } from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/use-chart-state";
import { VerticalWhisker } from "@/charts/whiskers";

export const ErrorWhiskers = () => {
  const {
    bounds,
    xScale,
    xScaleIn,
    getYErrorRange,
    yScale,
    getSegment,
    grouped,
    showStandardError,
  } = useChartState() as GroupedColumnsState;
  const { margins } = bounds;
  if (!getYErrorRange || !showStandardError) {
    return null;
  }

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment) => (
        <g key={segment[0]} transform={`translate(${xScale(segment[0])}, 0)`}>
          {segment[1].map((d, i) => {
            const x0 = xScaleIn(getSegment(d)) as number;
            const bandwidth = xScaleIn.bandwidth();
            const barwidth = Math.min(bandwidth, 15);
            const [y1, y2] = getYErrorRange(d);
            return (
              <VerticalWhisker
                key={i}
                x={x0 + bandwidth / 2 - barwidth / 2}
                width={barwidth}
                y1={yScale(y1)}
                y2={yScale(y2)}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};

type GroupedRenderDatum = {
  key: string;
  x: number;
  data: RenderDatum[];
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
  } = useChartState() as GroupedColumnsState;
  const ref = React.useRef<SVGGElement>(null);
  const { margins } = bounds;

  const bandwidth = xScaleIn.bandwidth();
  const y0 = yScale(0);
  const renderData: GroupedRenderDatum[] = React.useMemo(() => {
    return grouped.map((segment) => {
      return {
        key: segment[0],
        x: xScale(segment[0]) as number,
        data: segment[1].map((d) => {
          const y = getY(d) ?? NaN;

          return {
            x: xScaleIn(getSegment(d)) as number,
            y: yScale(Math.max(y, 0)),
            width: bandwidth,
            height: Math.abs(yScale(y) - y0),
            color: colors(getSegment(d)),
          };
        }),
      };
    });
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
  ]);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current)
        .selectAll<SVGGElement, GroupedRenderDatum>("g")
        .data(renderData, (d) => d.key)
        .join("g")
        .attr("transform", (d) => `translate(${d.x}, 0)`)
        .selectAll<SVGRectElement, RenderDatum>("rect")
        .data(
          (d) => d.data,
          (d) => d.x
        )
        .call(renderColumn, y0);
    }
  }, [renderData, y0]);

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`} />
  );
};
