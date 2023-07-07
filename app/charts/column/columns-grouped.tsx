import { select } from "d3";
import React from "react";

import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { RenderDatum, renderColumn } from "@/charts/column/rendering-utils";
import { VerticalWhisker } from "@/charts/column/whiskers";
import { useChartState } from "@/charts/shared/use-chart-state";

export const ErrorWhiskers = () => {
  const {
    bounds,
    xScale,
    xScaleIn,
    getYErrorRange,
    yScale,
    getSegment,
    grouped,
    showYStandardError,
  } = useChartState() as GroupedColumnsState;

  if (!getYErrorRange || !showYStandardError) {
    return null;
  }

  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map(([segment, observations]) =>
        observations.map((d, i) => {
          const x0 = xScaleIn(getSegment(d)) as number;
          const bandwidth = xScaleIn.bandwidth();
          const barwidth = Math.min(bandwidth, 15);
          const [y1, y2] = getYErrorRange(d);

          return (
            <VerticalWhisker
              key={i}
              x={
                (xScale(segment) as number) + x0 + bandwidth / 2 - barwidth / 2
              }
              width={barwidth}
              y1={yScale(y1)}
              y2={yScale(y2)}
            />
          );
        })
      )}
    </g>
  );
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
    getRenderingKey,
  } = useChartState() as GroupedColumnsState;
  const ref = React.useRef<SVGGElement>(null);
  const { margins } = bounds;
  const bandwidth = xScaleIn.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderDatum[] = React.useMemo(() => {
    return grouped.flatMap(([segment, observations]) => {
      return observations.map((d) => {
        const key = getRenderingKey(d);
        const x = getSegment(d);
        const y = getY(d) ?? NaN;

        return {
          key: `${key}-${x}`,
          x: (xScale(segment) as number) + (xScaleIn(x) as number),
          y: yScale(Math.max(y, 0)),
          width: bandwidth,
          height: Math.abs(yScale(y) - y0),
          color: colors(x),
        };
      });
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
    getRenderingKey,
  ]);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current)
        .selectAll<SVGRectElement, RenderDatum>("rect")
        .data(renderData, (d) => d.key)
        .call(renderColumn, y0);
    }
  }, [renderData, y0]);

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`} />
  );
};
