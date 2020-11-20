import "d3-transition";
import { Box } from "@theme-ui/components";
import { bisector } from "d3-array";
import { brushX } from "d3-brush";
import { select, Selection } from "d3-selection";
import React, { useEffect, useRef, useState } from "react";
import { useFormatShortDateAuto } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { AreasState } from "../area/areas-state";
import { LinesState } from "../line/lines-state";
import { useChartState } from "./use-chart-state";
import { useChartTheme } from "./use-chart-theme";
import { useInteractiveFilters } from "./use-interactive-filters";

export const BRUSH_HEIGHT = 20;

export const Brush = () => {
  const ref = useRef<SVGGElement>(null);
  const [brushedIsEnded, updateBrushEndedStatus] = useState(true);
  console.log({ brushedIsEnded });
  // const axisRef = useRef<SVGGElement>(null);
  const [state, dispatch] = useInteractiveFilters();
  const formatDateAuto = useFormatShortDateAuto();
  const {
    brushOverlayColor,
    brushSelectionColor,
    brushHandleColor,
  } = useChartTheme();
  const { from, to } = state.time;
  const {
    xEntireScale,
    getX,
    bounds,
    allDataWide,
    xUniqueValues,
  } = useChartState() as LinesState | AreasState;
  console.log(xUniqueValues);
  const brushed = ({ selection }: { selection: [number, number] }) => {
    updateBrushEndedStatus(false);
    if (selection) {
      const [xStart, xEnd] = selection.map((s) => xEntireScale.invert(s));

      // Start date
      const bisectDateLeft = bisector(
        (ds: Observation, date: Date) => getX(ds).getTime() - date.getTime()
      ).left;
      const startIndex = bisectDateLeft(allDataWide, xStart, 1);
      const dStartLeft = allDataWide[startIndex - 1];
      const dStartRight = allDataWide[startIndex] || dStartLeft;
      const startClosestDatum =
        xStart.getTime() - getX(dStartLeft).getTime() >
        getX(dStartRight).getTime() - xStart.getTime()
          ? dStartRight
          : dStartLeft;

      // End date
      const bisectDateRight = bisector(
        (ds: Observation, date: Date) => getX(ds).getTime() - date.getTime()
      ).right;
      const endIndex = bisectDateRight(allDataWide, xEnd, 1);
      const dEndLeft = allDataWide[endIndex - 1];
      const dEndRight = allDataWide[endIndex] || dEndLeft;
      const endClosestDatum =
        xEnd.getTime() - getX(dEndLeft).getTime() >
        getX(dEndRight).getTime() - xEnd.getTime()
          ? dEndRight
          : dEndLeft;

      // Update interactive filters state
      dispatch({
        type: "ADD_TIME_FILTER",
        value: [getX(startClosestDatum), getX(endClosestDatum)],
      });
    }
  };

  // Creates a 1-dimensional brush
  const brush = brushX()
    .extent([
      [0, 0],
      [bounds.chartWidth, BRUSH_HEIGHT],
    ])
    .on("start brush", brushed)
    .on("end", () => updateBrushEndedStatus(true));

  const mkBrush = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.select(".overlay")
      .attr("fill", brushOverlayColor)
      .attr("fill-opacity", 0.9);
    g.select(".selection").attr("fill", brushSelectionColor);
    g.selectAll(".handle").attr("fill", brushHandleColor);
    // Apply brush to selected group
    g.call(brush);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  // This effect allow "snapping" to actual data points
  // after brush is ended and interactive-filters state is updated
  useEffect(() => {
    const g = select(ref.current);
    if (from && to && brushedIsEnded) {
      const coord = [xEntireScale(from), xEntireScale(to)];
      // @ts-ignore
      g.transition().call(brush.move, coord);
    }
  }, [brush.move, from, to, xEntireScale, brushedIsEnded]);

  return (
    <>
      {/* Handle Dates */}
      <g
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight +
          bounds.margins.top +
          bounds.margins.bottom / 2 +
          BRUSH_HEIGHT +
          4
        })`}
      >
        {from && (
          <text fontSize={10} textAnchor="middle" x={xEntireScale(from)} y={10}>
            {formatDateAuto(from)}
          </text>
        )}
        {to && (
          <text fontSize={10} textAnchor="middle" x={xEntireScale(to)} y={10}>
            {formatDateAuto(to)}
          </text>
        )}
      </g>
      {/* Date Start and End */}

      <g
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight +
          bounds.margins.top +
          bounds.margins.bottom / 2 +
          BRUSH_HEIGHT +
          4
        })`}
      >
        {xEntireScale.domain().map((date) => (
          <text fontSize={10} textAnchor="middle" x={xEntireScale(date)} y={10}>
            {formatDateAuto(date)}
          </text>
        ))}
      </g>
      {/* Date ticks */}
      <g
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top + bounds.margins.bottom / 2
        })`}
      >
        {xUniqueValues.map((date) => (
          <rect x={xEntireScale(date)} y={0} width={1} height={BRUSH_HEIGHT} />
        ))}
      </g>

      {/* Brush */}
      <g
        ref={ref}
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top + bounds.margins.bottom / 2
        })`}
      />
    </>
  );
};
