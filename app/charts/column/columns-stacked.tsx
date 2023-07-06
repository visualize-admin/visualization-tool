import { select } from "d3";
import React from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { RenderDatum, renderColumn } from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/use-chart-state";

export const ColumnsStacked = () => {
  const ref = React.useRef<SVGGElement>(null);
  const { bounds, getX, xScale, yScale, colors, series } =
    useChartState() as StackedColumnsState;
  const { margins } = bounds;

  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderDatum[] = React.useMemo(() => {
    return series.flatMap((d) => {
      const key = d.key;
      const color = colors(key);

      return d.map((segment: $FixMe) => {
        const x = getX(segment.data);

        return {
          key: `${key}-${x}`,
          x: xScale(x) as number,
          y: yScale(segment[1]),
          width: bandwidth,
          height: yScale(segment[0]) - yScale(segment[1]),
          color,
        };
      });
    });
  }, [bandwidth, colors, getX, series, xScale, yScale]);

  React.useEffect(() => {
    console.log("rendering columns", renderData);
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
