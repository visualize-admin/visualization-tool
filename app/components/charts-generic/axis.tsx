import { axisBottom, axisLeft } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { ChartProps } from "./chart-state";
import { useWidthTimeScale, useHeightLinearScale } from "./scales";
import { useChartTheme } from "./styles";
import { useBounds } from ".";
import { getDimensionLabel, LineFields } from "../../domain";

export const AxisTime = ({
  data,
  field
}: Pick<ChartProps, "data"> & { field: string }) => {
  const ref = useRef<SVGGElement>(null);
  const bounds = useBounds();
  const { chartHeight, margins } = bounds;

  const { labelColor, labelFontSize, fontFamily } = useChartTheme();

  const scale = useWidthTimeScale({ data, field });

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(axisBottom(scale));
    g.selectAll(".tick line").remove();
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
    ></g>
  );
};

export const AxisLinearHeight = ({
  data,
  measures,
  fields,
  field
}: Pick<ChartProps, "data" | "measures"> & {
  fields: LineFields;
  field: string;
}) => {
  const bounds = useBounds();
  const { chartWidth, margins } = bounds;

  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();

  const ref = useRef<SVGGElement>(null);

  const scale = useHeightLinearScale({ data, field });

  const yFieldLabel = getDimensionLabel(
    measures.find(d => d.component.iri.value === fields.y.componentIri)!
  );

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisLeft(scale)
        .ticks(4)
        .tickSize(-chartWidth)
    );
    g.select(".domain").remove();
    g.selectAll(".tick line")
      .attr("stroke", gridColor)
      .attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", 0)
      .attr("dy", -4)
      .attr("text-anchor", "start");
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <g>
        <text
          x={margins.left}
          y={0}
          dy={labelFontSize}
          fontSize={labelFontSize}
        >
          {yFieldLabel}
        </text>
      </g>
      <g ref={ref} transform={`translate(${margins.left}, ${margins.top})`}></g>
    </>
  );
};
