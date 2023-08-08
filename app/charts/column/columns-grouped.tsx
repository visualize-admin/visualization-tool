import { Selection, select } from "d3";
import React from "react";

import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import {
  RenderColumnDatum,
  RenderWhiskerDatum,
  renderColumn,
  renderWhisker,
} from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { useTransitionStore } from "@/stores/transition";

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
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);
  const transitionDuration = useTransitionStore((state) => state.duration);

  const renderData: RenderWhiskerDatum[] | undefined = React.useMemo(() => {
    if (!getYErrorRange || !showYStandardError) {
      return;
    }

    return grouped.flatMap(([segment, observations]) =>
      observations.map((d) => {
        const x0 = xScaleIn(getSegment(d)) as number;
        const bandwidth = xScaleIn.bandwidth();
        const barwidth = Math.min(bandwidth, 15);
        const [y1, y2] = getYErrorRange(d);

        return {
          key: `${segment}-${getSegment(d)}`,
          x: (xScale(segment) as number) + x0 + bandwidth / 2 - barwidth / 2,
          y1: yScale(y1),
          y2: yScale(y2),
          width: barwidth,
        };
      })
    );
  }, [
    getSegment,
    getYErrorRange,
    grouped,
    showYStandardError,
    xScale,
    xScaleIn,
    yScale,
  ]);

  React.useEffect(() => {
    if (ref.current && renderData) {
      const renderWhiskers = (
        g: Selection<SVGGElement, null, SVGGElement, unknown>
      ) => {
        g.selectAll<SVGGElement, RenderWhiskerDatum>("g")
          .data(renderData, (d) => d.key)
          .call(renderWhisker, transitionDuration);
      };

      select(ref.current)
        .selectAll<SVGGElement, null>(".content")
        .data([null])
        .join(
          (enter) =>
            enter
              .append("g")
              .attr("class", "content")
              .attr("transform", `translate(${margins.left} ${margins.top})`)
              .call(renderWhiskers),
          (update) =>
            update
              .call((g) =>
                g
                  .transition()
                  .duration(transitionDuration)
                  .attr(
                    "transform",
                    `translate(${margins.left} ${margins.top})`
                  )
              )
              .call(renderWhiskers),
          (exit) => exit.remove()
        )
        .call(renderWhiskers);
    }
  }, [renderData, margins.left, margins.top, transitionDuration]);

  return renderData ? <g ref={ref} /> : null;
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
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { margins } = bounds;
  const bandwidth = xScaleIn.bandwidth();
  const y0 = yScale(0);
  const renderData: RenderColumnDatum[] = React.useMemo(() => {
    return grouped.flatMap(([segment, observations]) => {
      return observations.map((d) => {
        const key = getRenderingKey(d, getSegment(d));
        const x = getSegment(d);
        const y = getY(d) ?? NaN;

        return {
          key,
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
      const renderColumns = (
        g: Selection<SVGGElement, null, SVGGElement, unknown>
      ) => {
        g.selectAll<SVGRectElement, RenderColumnDatum>("rect")
          .data(renderData, (d) => d.key)
          .call(renderColumn, y0, transitionDuration);
      };

      select(ref.current)
        .selectAll<SVGGElement, null>(".content")
        .data([null])
        .join(
          (enter) =>
            enter
              .append("g")
              .attr("class", "content")
              .attr("transform", `translate(${margins.left} ${margins.top})`)
              .call(renderColumns),
          (update) =>
            update
              .call((g) =>
                g
                  .transition()
                  .duration(transitionDuration)
                  .attr(
                    "transform",
                    `translate(${margins.left} ${margins.top})`
                  )
              )
              .call(renderColumns),
          (exit) => exit.remove()
        );
    }
  }, [renderData, y0, margins.left, margins.top, transitionDuration]);

  return <g ref={ref} />;
};
