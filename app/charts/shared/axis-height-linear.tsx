import { axisLeft, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import type { AreasState } from "@/charts/area/areas-state";
import type { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import type { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import type { ColumnsState } from "@/charts/column/columns-state";
import type { LinesState } from "@/charts/line/lines-state";
import type { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

import { getTickNumber } from "./ticks";

export const AxisHeightLinear = () => {
  const ref = useRef<SVGGElement>(null);
  const formatNumber = useFormatNumber({ decimals: "auto" });

  // FIXME: add "NumericalY" chart type here.
  const { yScale, yAxisLabel, yMeasure, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | GroupedColumnsState
    | StackedColumnsState
    | LinesState
    | ScatterplotState;

  const ticks = getTickNumber(bounds.chartHeight);

  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisLeft(yScale)
        .ticks(ticks)
        .tickSizeInner(-bounds.chartWidth)
        .tickFormat(formatNumber)
    );

    g.select(".domain").remove();

    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", -6)
      .attr("dy", 3)
      .attr("text-anchor", "end");
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      {/* TODO: at some point it would make sense to allow wrapping */}
      <foreignObject width="100%" height={labelFontSize * 2}>
        <OpenMetadataPanelWrapper dim={yMeasure as DimensionMetadataFragment}>
          <span style={{ fontSize: labelFontSize }}>{yAxisLabel}</span>
        </OpenMetadataPanelWrapper>
      </foreignObject>
      <g
        ref={ref}
        transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
      />
    </>
  );
};

export const AxisHeightLinearDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const { xScale, yScale, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;
  const { domainColor } = useChartTheme();

  const mkAxisDomain = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
    g.call(axisLeft(yScale).tickSizeOuter(0));

    g.select(".domain")
      .attr("data-name", "height-axis-domain")
      .attr("transform", `translate(${xScale(0 as $FixMe)}, 0)`)
      .attr("stroke", domainColor);

    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
    />
  );
};
