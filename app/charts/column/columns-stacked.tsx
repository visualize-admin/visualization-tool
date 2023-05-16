import { select } from "d3";
import React from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { RenderDatum, renderColumn } from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/use-chart-state";

type StackedRenderDatum = {
  key: string;
  data: RenderDatum[];
};

export const ColumnsStacked = () => {
  const ref = React.useRef<SVGGElement>(null);
  const { bounds, getX, xScale, yScale, colors, series } =
    useChartState() as StackedColumnsState;
  const { margins } = bounds;

  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: StackedRenderDatum[] = React.useMemo(() => {
    return series.map((d) => {
      const key = d.key;
      const color = colors(key);

      return {
        key,
        data: d.map((segment: $FixMe) => {
          const x = getX(segment.data);

          return {
            key: `${key}-${x}`,
            x: xScale(x) as number,
            y: yScale(segment[1]),
            width: bandwidth,
            height: y0 - yScale(segment[1] - segment[0]),
            color,
          };
        }),
      };
    });
  }, [bandwidth, colors, getX, series, xScale, y0, yScale]);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current)
        .selectAll<SVGGElement, StackedRenderDatum>("g")
        .data(renderData, (d) => d.key)
        .join("g")
        .attr("data-n", (d) => d.key)
        .selectAll<SVGRectElement, RenderDatum>("rect")
        .data(
          (d) => d.data,
          (d) => d.key
        )
        .call(renderColumn, y0);
    }
  }, [renderData, y0]);

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`} />
  );
};
