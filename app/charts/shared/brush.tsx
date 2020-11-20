import { Box } from "@theme-ui/components";
import { bisector } from "d3-array";
import { brushX } from "d3-brush";
import { select, Selection } from "d3-selection";
import React, { useEffect, useRef } from "react";
import { useFormatShortDateAuto } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { AreasState } from "../area/areas-state";
import { LinesState } from "../line/lines-state";
import { useChartState } from "./use-chart-state";
import { useInteractiveFilters } from "./use-interactive-filters";

const BRUSH_HEIGHT = 60;

export const Brush = () => {
  const ref = useRef<SVGGElement>(null);
  const [state, dispatch] = useInteractiveFilters();
  const formatDateAuto = useFormatShortDateAuto();
  const { from, to } = state.time;
  const { xEntireScale, getX, bounds, allDataWide } = useChartState() as
    | LinesState
    | AreasState;

  const brushed = ({
    selection,
    mode,
  }: {
    selection: [number, number];
    mode: string;
  }) => {
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
      dispatch({
        type: "ADD_TIME_FILTER",
        value: [getX(startClosestDatum), getX(endClosestDatum)],
      });
    }
  };
  const mkBrush = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    // Creates 1-Dimensional brush
    const brush = brushX()
      .extent([
        [0, 30],
        [bounds.chartWidth, BRUSH_HEIGHT],
      ])
      .on("start brush end", brushed);

    // Apply brush to selected group
    g.call(brush);

    // Styling
    g.select(".overlay").attr("fill", "moccasin").attr("fill-opacity", 0.3);
    g.select(".selection").attr("fill", "darkorange");
  };

  useEffect(() => {
    const g = select(ref.current);
    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
    // mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <g
        ref={ref}
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top + BRUSH_HEIGHT
        })`}
      >
        {xEntireScale.domain().map((date, i) => (
          <text key={i} x={xEntireScale(date)} y={10}>
            {formatDateAuto(date)}
          </text>
        ))}
      </g>
      <g
        ref={ref}
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top + BRUSH_HEIGHT
        })`}
      >
        {from && (
          <Box
            as="text"
            sx={{ fontSize: 1, textAnchor: "middle" }}
            x={xEntireScale(from)}
            y={10}
          >
            {formatDateAuto(from)}
          </Box>
        )}
        {to && (
          <Box
            as="text"
            sx={{ fontSize: 1, textAnchor: "middle" }}
            x={xEntireScale(to)}
            y={10}
          >
            {formatDateAuto(to)}
          </Box>
        )}
      </g>
      <g
        ref={ref}
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top
        })`}
      />
    </>
  );
};
