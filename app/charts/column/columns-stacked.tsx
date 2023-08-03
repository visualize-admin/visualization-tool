import { select } from "d3";
import React from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import {
  RenderColumnDatum,
  renderColumn,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";

export const ColumnsStacked = () => {
  const ref = React.useRef<SVGGElement>(null);
  const { bounds, getX, xScale, yScale, colors, series, getRenderingKey } =
    useChartState() as StackedColumnsState;
  const { margins } = bounds;
  const bandwidth = xScale.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = React.useMemo(() => {
    return series.flatMap((d) => {
      const color = colors(d.key);

      return d.map((segment: $FixMe) => {
        const observation = segment.data;

        return {
          key: getRenderingKey(observation, d.key),
          x: xScale(getX(observation)) as number,
          y: yScale(segment[1]),
          width: bandwidth,
          height: yScale(segment[0]) - yScale(segment[1]),
          color,
        };
      });
    });
  }, [bandwidth, colors, getX, series, xScale, yScale, getRenderingKey]);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current)
        .selectAll<SVGGElement, null>(".content")
        .data([null])
        .join(
          (enter) =>
            enter
              .append("g")
              .attr("class", "content")
              .attr("transform", `translate(${margins.left} ${margins.top})`),
          (update) =>
            update.call((g) =>
              g
                .transition()
                .duration(TRANSITION_DURATION)
                .attr("transform", `translate(${margins.left} ${margins.top})`)
            ),
          (exit) =>
            exit.call((g) =>
              g.transition().duration(TRANSITION_DURATION).remove()
            )
        )
        .call((g) =>
          g
            .selectAll<SVGRectElement, RenderColumnDatum>("rect")
            .data(renderData, (d) => d.key)
            .call(renderColumn, y0)
        );
    }
  }, [renderData, y0, margins.left, margins.top]);

  return <g ref={ref} />;
};
