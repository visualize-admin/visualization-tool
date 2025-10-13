import { getContrastingColor } from "@uiw/react-color";
import { select, Selection } from "d3-selection";
import { Series } from "d3-shape";
import { useCallback } from "react";

import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
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
import { getTextWidth } from "@/utils/get-text-width";

export type RenderBarDatum = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  focused?: boolean;
  valueLabel?: string;
  valueLabelColor?: string;
  observation: Observation;
  segment?: string;
  valueLabelOffset?: number;
};

export const useGetRenderStackedBarDatum = () => {
  const {
    colors,
    showValuesBySegmentMapping,
    valueLabelFormatter,
    xScale,
    yScale,
    getY,
    getRenderingKey,
  } = useChartState() as StackedBarsState;
  const [state] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const definitiveFilters = useDefinitiveFilters();
  const bandwidth = yScale.bandwidth();

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
        const x = xScale(d[0]);
        const yRaw = getY(observation);
        const y = yScale(yRaw) as number;

        const hasAnnotation = hasSegmentAnnotation(
          observation,
          segment,
          chartConfig,
          definitiveFilters
        );

        const valueLabelOffset =
          hasAnnotation && valueLabel
            ? -(getTextWidth(valueLabel, { fontSize: 12 }) + 2)
            : 0;

        return {
          key: getRenderingKey(observation, segment),
          y,
          x,
          height: bandwidth,
          width: Math.min(0, x - xScale(d[1])) * -1,
          color,
          valueLabel,
          valueLabelColor,
          observation,
          segment,
          valueLabelOffset,
        } satisfies RenderBarDatum;
      });
    },
    [
      bandwidth,
      colors,
      getRenderingKey,
      getY,
      showValuesBySegmentMapping,
      valueLabelFormatter,
      xScale,
      yScale,
      chartConfig,
      definitiveFilters,
    ]
  );
};

type RenderBarOptions = RenderOptions & {
  x0: number;
};

export const renderBars = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderBarDatum[],
  options: RenderBarOptions
) => {
  const { transition, x0 } = options;

  g.selectAll<SVGGElement, RenderBarDatum>("g.bar")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("class", "bar")
          .call((g) =>
            g
              .append("rect")
              .attr("data-index", (_, i) => i)
              .attr("y", (d) => d.y)
              .attr("x", x0)
              .attr("width", 0)
              .attr("height", (d) => d.height)
              .attr("fill", (d) => d.color)
              .call((enter) =>
                maybeTransition(enter, {
                  transition,
                  s: (g) =>
                    g.attr("x", (d) => d.x).attr("width", (d) => d.width),
                })
              )
          )
          .call((g) =>
            g
              .append("foreignObject")
              .attr("x", x0)
              .attr("y", (d) => d.y)
              .attr("width", (d) => d.width)
              .attr("height", (d) => d.height)
              .call((g) =>
                maybeTransition(g, {
                  transition,
                  s: (g) => g.attr("x", (d) => d.x + (d.valueLabelOffset ?? 0)),
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
                  .attr("x", (d) => d.x + (d.valueLabelOffset ?? 0))
                  .attr("y", (d) => d.y)
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
              .call((g) => g.select("rect").attr("x", x0).attr("width", 0))
              .remove(),
        })
    );
};
