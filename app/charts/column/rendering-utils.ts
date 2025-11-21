import { select, Selection } from "d3-selection";
import { Series } from "d3-shape";
import { useCallback } from "react";

import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { hasSegmentAnnotation } from "@/charts/shared/annotation-utils";
import { useChartState } from "@/charts/shared/chart-state";
import {
  setSegmentValueLabelProps,
  setSegmentWrapperValueLabelProps,
} from "@/charts/shared/render-value-labels";
import {
  maybeTransition,
  RenderOptions,
  toggleFocusBorder,
} from "@/charts/shared/rendering-utils";
import { getChartConfig, useDefinitiveFilters } from "@/config-utils";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { Observation } from "@/domain/data";
import { getContrastingColor } from "@/utils/color-utils";

export type RenderColumnDatum = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  focused?: boolean;
  valueLabel?: string;
  valueLabelColor?: string;
  segment?: string;
  observation: Observation;
  valueLabelOffset?: number;
};

export const useGetRenderStackedColumnDatum = () => {
  const {
    colors,
    showValuesBySegmentMapping,
    valueLabelFormatter,
    xScale,
    yScale,
    getX,
    getRenderingKey,
  } = useChartState() as StackedColumnsState;
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const definitiveFilters = useDefinitiveFilters();
  const bandwidth = xScale.bandwidth();

  return useCallback(
    (s: Series<{ [key: string]: number }, string>) => {
      const segment = s.key;
      const color = colors(segment);

      return s.map((d) => {
        const observation = d.data;
        const value = observation[segment];
        const valueLabel =
          segment && showValuesBySegmentMapping[segment]
            ? valueLabelFormatter(value)
            : undefined;
        const valueLabelColor = valueLabel
          ? getContrastingColor(color)
          : undefined;
        const xRaw = getX(observation);
        const y = yScale(d[1]) as number;

        const hasAnnotation = hasSegmentAnnotation(
          observation,
          segment,
          chartConfig,
          definitiveFilters
        );

        const valueLabelOffset = hasAnnotation ? 20 : 0;

        return {
          key: getRenderingKey(observation, segment),
          x: xScale(xRaw) as number,
          y,
          width: bandwidth,
          height: Math.max(0, yScale(d[0]) - y),
          color,
          valueLabel,
          valueLabelColor,
          observation,
          segment,
          valueLabelOffset,
        } satisfies RenderColumnDatum;
      });
    },
    [
      bandwidth,
      colors,
      getRenderingKey,
      getX,
      showValuesBySegmentMapping,
      valueLabelFormatter,
      xScale,
      yScale,
      chartConfig,
      definitiveFilters,
    ]
  );
};

export const renderColumns = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderColumnDatum[],
  options: RenderOptions & { y0: number }
) => {
  const { transition, y0 } = options;

  g.selectAll<SVGGElement, RenderColumnDatum>("g.column")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("class", "column")
          .call((g) =>
            g
              .append("rect")
              .attr("data-index", (_, i) => i)
              .attr("x", (d) => d.x)
              .attr("y", y0)
              .attr("width", (d) => d.width)
              .attr("height", 0)
              .attr("fill", (d) => d.color)
              .call((enter) =>
                maybeTransition(enter, {
                  transition,
                  s: (g) =>
                    g.attr("y", (d) => d.y).attr("height", (d) => d.height),
                })
              )
          )
          .call((g) =>
            g
              .append("foreignObject")
              .attr("x", (d) => d.x)
              .attr("y", y0)
              .attr("width", (d) => d.width)
              .attr("height", (d) => d.height)
              .call((g) =>
                maybeTransition(g, {
                  transition,
                  s: (g) => g.attr("y", (d) => d.y + (d.valueLabelOffset ?? 0)),
                })
              )
              .append("xhtml:div")
              .call(setSegmentWrapperValueLabelProps)
              .append("xhtml:p")
              .call(setSegmentValueLabelProps)
              .style("color", function (d) {
                return d.valueLabelColor ?? select(this).style("color");
              })
              .text((d) => d.valueLabel ?? "")
          ),
      (update) => {
        toggleFocusBorder(update.select("rect"));

        return maybeTransition(update, {
          s: (g) =>
            g
              .call((g) =>
                g
                  .select("rect")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y)
                  .attr("width", (d) => d.width)
                  .attr("height", (d) => d.height)
                  .attr("fill", (d) => d.color)
              )
              .call((g) =>
                g
                  .select("foreignObject")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y + (d.valueLabelOffset ?? 0))
                  .attr("width", (d) => d.width)
                  .attr("height", (d) => d.height)
                  .select("p")
                  .style("color", function (d) {
                    return d.valueLabelColor ?? select(this).style("color");
                  })
                  .text((d) => d.valueLabel ?? "")
              ),
          transition,
        });
      },
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) =>
            g
              .call((g) => g.select("rect").attr("y", y0).attr("height", 0))
              .remove(),
        })
    );
};
