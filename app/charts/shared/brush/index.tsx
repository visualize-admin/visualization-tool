import {
  bisector,
  brushX,
  pointer,
  pointers,
  select,
  Selection,
  Transition,
} from "d3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AreasState } from "@/charts/area/areas-state";
import type { ColumnsState } from "@/charts/column/columns-state";
import type { LinesState } from "@/charts/line/lines-state";
import { makeGetClosestDatesFromDateRange } from "@/charts/shared/brush/utils";
import type { ChartWithInteractiveXTimeRangeState } from "@/charts/shared/chart-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { Observation } from "@/domain/data";
import { useFormatFullDateAuto } from "@/formatters";
import { useInteractiveFiltersStore } from "@/stores/interactive-filters";
import { estimateTextWidth } from "@/utils/estimate-text-width";

// Brush constants
export const HANDLE_HEIGHT = 14;
export const BRUSH_HEIGHT = 3;

export const BrushTime = () => {
  const ref = useRef<SVGGElement>(null);
  const { timeRange, setTimeRange } = useInteractiveFiltersStore((d) => ({
    timeRange: d.timeRange,
    setTimeRange: d.setTimeRange,
  }));
  const formatDateAuto = useFormatFullDateAuto();
  const [brushedIsEnded, updateBrushEndedStatus] = useState(true);
  const [selectionExtent, setSelectionExtent] = useState(0);
  const updateSelectionExtent = (selection: [number, number] | undefined) => {
    if (selection) {
      setSelectionExtent(selection[1] - selection[0]);
    } else {
      setSelectionExtent(0);
    }
  };

  const { from, to } = timeRange;
  const {
    brushOverlayColor,
    brushSelectionColor,
    brushHandleStrokeColor,
    brushHandleFillColor,
    labelFontSize,
  } = useChartTheme();
  const { chartType, bounds, interactiveXTimeRangeScale } =
    useChartState() as ChartWithInteractiveXTimeRangeState;
  const { getX } = useChartState() as LinesState | AreasState;
  const { getXAsDate, allData } = useChartState() as ColumnsState;
  const getDate = chartType === "column" ? getXAsDate : getX;
  const fullData = allData;

  // Brush dimensions
  const { width, margins, chartHeight } = bounds;
  const brushLabelsWidth =
    estimateTextWidth(
      formatDateAuto(interactiveXTimeRangeScale.domain()[0]),
      labelFontSize
    ) *
      2 +
    20;
  const brushWidth = width - brushLabelsWidth - margins.right;
  const brushWidthScale = interactiveXTimeRangeScale.copy();

  brushWidthScale.range([0, brushWidth]);

  const [minBrushDomainValue, maxBrushDomainValue] = useMemo(
    () => brushWidthScale.domain().map((d) => d.getTime()),
    [brushWidthScale]
  );

  const getClosestObservationFromRangeDates = useCallback(
    ([from, to]: [Date, Date]): [Date, Date] => {
      const getClosestDatesFromDateRange = makeGetClosestDatesFromDateRange(
        fullData,
        getDate
      );

      return getClosestDatesFromDateRange(from, to);
    },
    [fullData, getDate]
  );

  const [closestFrom, closestTo] = useMemo(() => {
    if (from && to) {
      return getClosestObservationFromRangeDates([from, to]);
    } else {
      return brushWidthScale.domain();
    }
  }, [from, getClosestObservationFromRangeDates, to, brushWidthScale]);

  const brushed = ({ selection }: { selection: [number, number] }) => {
    updateBrushEndedStatus(false);

    if (selection) {
      const [xStart, xEnd] = selection.map((s) => brushWidthScale.invert(s));
      const [newFrom, newTo] = getClosestObservationFromRangeDates([
        xStart,
        xEnd,
      ]);

      // Need to use current state as the function is not updated during brushing
      // and the local state accessed here is not up to date. This leads to
      // making a dispatch on each brush move, which makes the animations laggy
      // and generally shouldn't happen.
      const { from, to } = useInteractiveFiltersStore.getState().timeRange;

      if (
        from?.getTime() !== newFrom.getTime() ||
        to?.getTime() !== newTo.getTime()
      ) {
        setTimeRange(newFrom, newTo);
      }
    }
  };

  // Creates a 1-dimensional brush
  const brush = brushX()
    .extent([
      [0, 0],
      [brushWidth, BRUSH_HEIGHT],
    ])
    .on("start brush", brushed)
    .on("end", function (event) {
      updateSelectionExtent(event.selection);

      // Happens when snapping to actual values.
      if (!event.sourceEvent) {
        updateBrushEndedStatus(false);
      } else {
        if (!event.selection && ref.current) {
          // End event fires twice on touchend (MouseEvent and TouchEvent),
          // we want to compute mx basing on MouseEvent.
          if (event.sourceEvent instanceof MouseEvent) {
            const g = select(ref.current);
            const [mx] = pointer(event, this);
            const x = mx < 0 ? 0 : mx > brushWidth ? brushWidth : mx;
            g.call(brush.move, [x, x]);
          }
        }

        updateBrushEndedStatus(true);
      }
    });

  /** Keyboard support */
  const moveBrushOnKeyPress = useCallback(
    (event: $FixMe, handleDirection: "w" | "e") => {
      if (from && to) {
        updateBrushEndedStatus(false);

        const bisectDateLeft = bisector(
          (ds: Observation, date: Date) =>
            getDate(ds).getTime() - date.getTime()
        ).left;
        const bisectDateRight = bisector(
          (ds: Observation, date: Date) =>
            getDate(ds).getTime() - date.getTime()
        ).right;

        if (event.keyCode === 37 && handleDirection === "w") {
          // west handle, moving left
          const index = bisectDateLeft(fullData, from, 1);
          const indexLeft = fullData[index - 1];

          if (getDate(indexLeft).getTime() < to.getTime()) {
            // new lower than "to"
            setTimeRange(getDate(indexLeft), to);
          } else {
            // new too high, don't do anything
            setTimeRange(from, to);
          }
        } else if (event.keyCode === 39 && handleDirection === "w") {
          // west handle, moving right
          const index = bisectDateRight(fullData, from, 1);
          const indexRight = fullData[index];
          if (getDate(indexRight).getTime() < to.getTime()) {
            setTimeRange(getDate(indexRight), to);
          } else {
            setTimeRange(from, to);
          }
        } else if (event.keyCode === 37 && handleDirection === "e") {
          // east handle, moving left
          const index = bisectDateLeft(fullData, to, 1);
          const indexLeft = fullData[index - 1];

          if (getDate(indexLeft).getTime() > from.getTime()) {
            setTimeRange(from, getDate(indexLeft));
          } else {
            setTimeRange(from, to);
          }
        } else if (event.keyCode === 39 && handleDirection === "e") {
          // east handle, moving right
          const index = bisectDateRight(fullData, to, 1);
          const indexLeft = fullData[index];

          if (indexLeft && getDate(indexLeft).getTime() > from.getTime()) {
            setTimeRange(from, getDate(indexLeft));
          } else {
            setTimeRange(from, to);
          }
        }
        updateBrushEndedStatus(true);
      }
    },
    [fullData, setTimeRange, from, getDate, to]
  );

  useEffect(() => {
    if (ref.current) {
      const g = select<SVGGElement, unknown>(ref.current);
      const mkBrush = (g: Selection<SVGGElement, unknown, null, undefined>) => {
        g.call(brush);
        g.select(".overlay")
          .datum({ type: "selection" })
          .attr("fill-opacity", 0)
          .style("y", `-${HANDLE_HEIGHT / 2 - 1}px`)
          .style("height", HANDLE_HEIGHT)
          .on(
            "mousedown touchstart",
            (e) => {
              const [[cx]] = pointers(e);
              const x0 = cx - selectionExtent / 2;
              const x1 = cx + selectionExtent / 2;
              const overflowingLeft = x0 < 0;
              const overflowingRight = x1 > brushWidth;

              g.call(
                brush.move,
                overflowingLeft
                  ? [0, selectionExtent]
                  : overflowingRight
                  ? [brushWidth - selectionExtent, brushWidth]
                  : [x0, x1]
              );
            },
            { passive: true }
          );
        g.select(".selection")
          .attr("fill", brushSelectionColor)
          .attr("fill-opacity", 1)
          .attr("stroke", "none");
        g.selectAll(".handle")
          .attr("fill", brushHandleFillColor)
          .attr("stroke", brushHandleStrokeColor)
          .attr("stroke-width", 2)
          .style("y", `-${HANDLE_HEIGHT / 2 - 1}px`)
          .style("width", `${HANDLE_HEIGHT}px`)
          .style("height", `${HANDLE_HEIGHT}px`)
          .attr("rx", `${HANDLE_HEIGHT}px`);

        g.select(".handle--w")
          .attr("tabindex", 0)
          .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "w"));
        g.select(".handle--e")
          .attr("tabindex", 0)
          .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "e"));
      };

      g.call(mkBrush);
    }
  }, [
    brush,
    brushWidth,
    brushHandleFillColor,
    brushHandleStrokeColor,
    brushOverlayColor,
    brushSelectionColor,
    moveBrushOnKeyPress,
    selectionExtent,
  ]);

  // This effect allows "snapping" to actual data points
  // after brush is ended and interactive-filters state is updated
  const closestFromStr = closestFrom?.toString(); // Local variables to prevent eslint-plugin-react-hooks bug
  const closestToStr = closestTo?.toString(); // leading to eslint crashing on this file
  useEffect(() => {
    const g = select(ref.current);
    if (closestFrom && closestTo && brushedIsEnded) {
      const coord = [brushWidthScale(closestFrom), brushWidthScale(closestTo)];
      (
        g.transition() as Transition<SVGGElement, unknown, null, undefined>
      ).call(brush.move, coord);
      updateBrushEndedStatus(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    brushWidthScale,
    brushedIsEnded,
    setTimeRange,
    closestFromStr,
    closestToStr,
  ]);

  // This effect resets brush defaults to editor values
  // without transition
  useEffect(() => {
    const g = select(ref.current);
    const defaultSelection = [0, selectionExtent];
    (g as Selection<SVGGElement, unknown, null, undefined>).call(
      brush.move,
      defaultSelection
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minBrushDomainValue, maxBrushDomainValue]);

  // This effect makes the brush responsive
  useEffect(() => {
    if (ref.current) {
      const coord = [brushWidthScale(closestFrom), brushWidthScale(closestTo)];
      select<SVGGElement, unknown>(ref.current).call(brush.move, coord);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brushWidth]);

  return (
    <>
      {/* Selected Dates */}
      <g
        transform={`translate(0, ${
          chartHeight + margins.top + margins.bottom / 2
        })`}
      >
        {closestFrom && closestTo && (
          <text
            fontSize={labelFontSize}
            textAnchor="start"
            x={0}
            y={0}
            dy={labelFontSize / 2}
          >
            {`${formatDateAuto(closestFrom)} - ${formatDateAuto(closestTo)}`}
          </text>
        )}
      </g>

      {/* Brush */}
      <g
        transform={`translate(${brushLabelsWidth}, ${
          chartHeight + margins.top + margins.bottom / 2
        })`}
      >
        {/* Visual overlay (functional overlay is managed by d3) */}
        <rect
          x={0}
          y={0}
          width={brushWidth}
          height={BRUSH_HEIGHT}
          fill={brushOverlayColor}
        />
      </g>
      {/* actual Brush */}
      <g
        ref={ref}
        transform={`translate(${brushLabelsWidth}, ${
          chartHeight + margins.top + margins.bottom / 2
        })`}
      />
    </>
  );
};

// Unused BrushOrdinal

// export const BrushOrdinal = ({ debug = false }: { debug?: boolean }) => {
//   const ref = useRef<SVGGElement>(null);
//   const [brushedIsEnded, updateBrushEndedStatus] = useState(true);

//   const [state, dispatch] = useInteractiveFilters();
//   const { from, to } = state.time;

//   const {
//     brushOverlayColor,
//     brushSelectionColor,
//     brushHandleStrokeColor,
//     brushHandleFillColor,
//     labelFontSize,
//   } = useChartTheme();
//   const {
//     xEntireScale,
//     getX,
//     bounds,
//     sortedData,
//   } = useChartState() as ColumnsState;

//   const updateBrushStatus = (event: $FixMe) => {
//     const selection = event.selection;
//     if (!event.sourceEvent || !selection) {
//       updateBrushEndedStatus(false);
//     } else {
//       updateBrushEndedStatus(true);
//     }
//   };

//   const brushed = ({ selection }: { selection: [number, number] }) => {
//     updateBrushEndedStatus(false);
//     if (selection) {
//       const [xStart, xEnd] = selection;

//       const range = xEntireScale.domain().map(xEntireScale) as number[];
//       const startIndex = bisectLeft(range, xStart);
//       const endIndex = bisectRight(range, xEnd);

//       // Update interactive filters state
//       dispatch({
//         type: "SET_TIME_RANGE_FILTER",
//         value: [startIndex, endIndex - 1],
//       });
//     }
//   };

//   // Creates a 1-dimensional brush
//   const brush = brushX()
//     .extent([
//       [0, 0],
//       [bounds.chartWidth, BRUSH_HEIGHT],
//     ])
//     .on("start brush", brushed)
//     .on("end.snap", updateBrushStatus);

//   /** Keyboard support */
//   const moveBrushOnKeyPress = useCallback(
//     (event: $FixMe, handleDirection: "w" | "e") => {
//       updateBrushEndedStatus(false);

//       if (event.keyCode === 37 && handleDirection === "w") {
//         // west handle, moving left

//         const indexLeft = from > 0 ? from - 1 : 0;

//         if (indexLeft < to) {
//           // new lower than "to"
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [indexLeft, to],
//           });
//         } else {
//           // new too high, don't do anything
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [from, to],
//           });
//         }
//       } else if (event.keyCode === 39 && handleDirection === "w") {
//         // west handle, moving right

//         const indexRight = from + 1;
//         if (indexRight < to) {
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [indexRight, to],
//           });
//         } else {
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [from, to],
//           });
//         }
//       } else if (event.keyCode === 37 && handleDirection === "e") {
//         // east handle, moving left

//         const indexLeft = to - 1;

//         if (indexLeft > from) {
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [from, indexLeft],
//           });
//         } else {
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [from, to],
//           });
//         }
//       } else if (event.keyCode === 39 && handleDirection === "e") {
//         // east handle, moving right
//         const indexRight = to < sortedData.length - 1 ? to + 1 : to;

//         if (indexRight && indexRight > from) {
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [from, indexRight],
//           });
//         } else {
//           dispatch({
//             type: "SET_TIME_RANGE_FILTER",
//             value: [from, to],
//           });
//         }
//       }
//       updateBrushEndedStatus(true);
//     },
//     [xEntireScale, from, to, dispatch, sortedData.length]
//   );
//   const mkBrush = useCallback(
//     (g: Selection<SVGGElement, unknown, null, undefined>) => {
//       g.select(".overlay")
//         .attr("fill", brushOverlayColor)
//         .attr("fill-opacity", 0.9);
//       g.select(".selection")
//         .attr("fill", brushSelectionColor)
//         .attr("fill-opacity", 1)
//         .attr("stroke", "none");
//       // .style("transform", `translateX(${xEntireScale.step() / 2}px)`);

//       g.selectAll(".handle")
//         .attr("fill", brushHandleFillColor)
//         .attr("stroke", brushHandleStrokeColor)
//         .attr("stroke-width", 2)
//         .style("y", `-${HANDLE_HEIGHT / 2}px`)
//         // .style("transform", `translateX(${xEntireScale.step() / 2}px)`)
//         .style("width", `${HANDLE_HEIGHT}px`)
//         .style("height", `${HANDLE_HEIGHT}px`)
//         .attr("rx", `${HANDLE_HEIGHT}px`);

//       g.select(".handle--w")
//         .attr("tabindex", 0)
//         .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "w"));
//       g.select(".handle--e")
//         .attr("tabindex", 0)
//         .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "e"));

//       // Apply brush to selected group
//       g.call(brush);
//     },
//     [
//       brush,
//       brushHandleFillColor,
//       brushHandleStrokeColor,
//       brushOverlayColor,
//       brushSelectionColor,
//       moveBrushOnKeyPress,
//     ]
//   );

//   useEffect(() => {
//     const g = select(ref.current);
//     mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
//   }, [mkBrush]);

//   // This effect allow "snapping" to actual data points
//   // after brush is ended and interactive-filters state is updated
//   useEffect(() => {
//     const g = select(ref.current);
//     if ((from || from === 0) && to && brushedIsEnded) {
//       const coord = [
//         xEntireScale(getX(sortedData[from])),
//         // Add the width of one step to mimic the visual behavior of BrushTime
//         // - 1 to avoid trigerring a state change
//         (xEntireScale(getX(sortedData[to])) || 0) + xEntireScale.step() - 1,
//       ];

//       (g.transition() as Transition<
//         SVGGElement,
//         unknown,
//         null,
//         undefined
//       >).call(brush.move, coord);
//     }
//   }, [brush.move, from, to, xEntireScale, brushedIsEnded, getX, sortedData]);

//   return (
//     <>
//       {/* Selected Dates */}
//       <g
//         transform={`translate(0, ${
//           bounds.chartHeight + bounds.margins.top + bounds.margins.bottom
//         })`}
//       >
//         {(from || from === 0) && to && (
//           <text
//             fontSize={labelFontSize}
//             textAnchor="start"
//             x={0}
//             y={0}
//             dy={labelFontSize / 2}
//           >
//             {`${getX(sortedData[from])} - ${getX(sortedData[to])}`}
//           </text>
//         )}
//       </g>

//       {/* Data point location */}
//       {debug && (
//         <g
//           transform={`translate(${bounds.margins.left}, ${
//             bounds.chartHeight + bounds.margins.top + bounds.margins.bottom
//           })`}
//         >
//           {xEntireScale
//             .domain()
//             .map(xEntireScale)
//             .map((d, i) => (
//               <>
//                 <rect
//                   x={d}
//                   y={0}
//                   width={xEntireScale.step()}
//                   height={BRUSH_HEIGHT}
//                   fill={"crimson"}
//                   stroke={"white"}
//                 />
//                 <text
//                   fontSize={7}
//                   textAnchor="middle"
//                   x={(d ?? 0) + xEntireScale.step() / 2}
//                   y={10}
//                   dy={BRUSH_HEIGHT}
//                   fill="crimson"
//                 >
//                   {`${getX(sortedData[i])}`}
//                 </text>
//               </>
//             ))}
//         </g>
//       )}
//       {/* Brush */}
//       <g
//         ref={ref}
//         transform={`translate(${bounds.margins.left}, ${
//           bounds.chartHeight + bounds.margins.top + bounds.margins.bottom
//         })`}
//       />
//     </>
//   );
// };
