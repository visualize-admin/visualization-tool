import { bisector, brushX, select, Selection, Transition } from "d3";
import "d3-transition";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormatFullDateAuto } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { AreasState } from "../area/areas-state";
import { ColumnsState } from "../column/columns-state";
import { LinesState } from "../line/lines-state";
import { useChartState } from "./use-chart-state";
import { useChartTheme } from "./use-chart-theme";
import { useInteractiveFilters } from "./use-interactive-filters";

// Space used in chart states as bottom margin
export const BRUSH_BOTTOM_SPACE = 100;

// Brush constants
export const HANDLE_HEIGHT = 14;
export const BRUSH_HEIGHT = 3;

export const BrushTime = () => {
  const ref = useRef<SVGGElement>(null);
  const [brushedIsEnded, updateBrushEndedStatus] = useState(true);
  const formatDateAuto = useFormatFullDateAuto();

  const [state, dispatch] = useInteractiveFilters();

  const { from, to } = state.time;

  const {
    brushOverlayColor,
    brushSelectionColor,
    brushHandleStrokeColor,
    brushHandleFillColor,
    labelFontSize,
  } = useChartTheme();

  const { chartType, xEntireScale, bounds } = useChartState() as
    | LinesState
    | AreasState
    | ColumnsState;
  const { getX, allDataWide } = useChartState() as LinesState | AreasState;
  const { getXAsDate, allData } = useChartState() as ColumnsState;

  const getDate = chartType === "column" ? getXAsDate : getX;
  const fullData = chartType === "column" ? allData : allDataWide;

  // Brush dimensions
  const { width, margins, chartHeight } = bounds;
  const brushLabelsWidth =
    estimateTextWidth(formatDateAuto(xEntireScale.domain()[0]), labelFontSize) *
      2 +
    20;
  const brushWidth = width - brushLabelsWidth - margins.right;
  const brushWidthScale = xEntireScale.copy();

  brushWidthScale.range([0, brushWidth]);

  const updateBrushStatus = (event: $FixMe) => {
    const selection = event.selection;
    if (!event.sourceEvent || !selection) {
      updateBrushEndedStatus(false);
    } else {
      updateBrushEndedStatus(true);
    }
  };

  const getClosestObservationFromRangeDates = useCallback(
    (rangeDates: [Date, Date]): [Date, Date] => {
      const [xStart, xEnd] = rangeDates;

      const bisectDateLeft = bisector(
        (ds: Observation, date: Date) => getDate(ds).getTime() - date.getTime()
      ).left;

      const startIndex = bisectDateLeft(fullData, xStart, 1);
      const dStartLeft = fullData[startIndex - 1];
      const dStartRight = fullData[startIndex] || dStartLeft;
      const startClosestDatum =
        xStart.getTime() - getDate(dStartLeft).getTime() >
        getDate(dStartRight).getTime() - xStart.getTime()
          ? dStartRight
          : dStartLeft;

      // End date
      const bisectDateRight = bisector(
        (ds: Observation, date: Date) => getDate(ds).getTime() - date.getTime()
      ).right;
      const endIndex = bisectDateRight(fullData, xEnd, 1);
      const dEndLeft = fullData[endIndex - 1];
      const dEndRight = fullData[endIndex] || dEndLeft;
      const endClosestDatum =
        xEnd.getTime() - getDate(dEndLeft).getTime() >
        getDate(dEndRight).getTime() - xEnd.getTime()
          ? dEndRight
          : dEndLeft;

      return [getDate(startClosestDatum), getDate(endClosestDatum)];
    },
    [fullData, getDate]
  );

  const [closestFrom, closestTo] = useMemo(() => {
    if (from && to) {
      return getClosestObservationFromRangeDates([from, to]);
    } else {
      return [brushWidthScale.domain()[0], brushWidthScale.domain()[1]];
    }
  }, [from, getClosestObservationFromRangeDates, to, brushWidthScale]);

  const brushed = ({ selection }: { selection: [number, number] }) => {
    updateBrushEndedStatus(false);

    if (selection) {
      const [xStart, xEnd] = selection.map((s) => brushWidthScale.invert(s));
      const newDates = getClosestObservationFromRangeDates([xStart, xEnd]);

      // Update interactive filters state
      dispatch({
        type: "ADD_TIME_FILTER",
        value: newDates,
      });
    }
  };

  // Creates a 1-dimensional brush
  const brush = brushX()
    .extent([
      [0, 0],
      [brushWidth, BRUSH_HEIGHT],
    ])
    .on("start brush", brushed)
    .on("end", updateBrushStatus);

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
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [getDate(indexLeft), to],
            });
          } else {
            // new too high, don't do anything
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [from, to],
            });
          }
        } else if (event.keyCode === 39 && handleDirection === "w") {
          // west handle, moving right
          const index = bisectDateRight(fullData, from, 1);
          const indexRight = fullData[index];
          if (getDate(indexRight).getTime() < to.getTime()) {
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [getDate(indexRight), to],
            });
          } else {
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [from, to],
            });
          }
        } else if (event.keyCode === 37 && handleDirection === "e") {
          // east handle, moving left
          const index = bisectDateLeft(fullData, to, 1);
          const indexLeft = fullData[index - 1];

          if (getDate(indexLeft).getTime() > from.getTime()) {
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [from, getDate(indexLeft)],
            });
          } else {
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [from, to],
            });
          }
        } else if (event.keyCode === 39 && handleDirection === "e") {
          // east handle, moving right
          const index = bisectDateRight(fullData, to, 1);
          const indexLeft = fullData[index];

          if (indexLeft && getDate(indexLeft).getTime() > from.getTime()) {
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [from, getDate(indexLeft)],
            });
          } else {
            dispatch({
              type: "ADD_TIME_FILTER",
              value: [from, to],
            });
          }
        }
        updateBrushEndedStatus(true);
      }
    },
    [fullData, dispatch, from, getDate, to]
  );

  useEffect(() => {
    const g = select(ref.current);
    const mkBrush = (g: Selection<SVGGElement, unknown, null, undefined>) => {
      g.select(".overlay")
        .attr("fill-opacity", 0)
        .style("y", `-${HANDLE_HEIGHT / 2 - 1}px`)
        .style("height", HANDLE_HEIGHT);
      g.select(".selection")
        .attr("fill", brushSelectionColor)
        .attr("fill-opacity", 1)
        .attr("stroke", "none");
      g.selectAll(".handle")
        .attr("fill", brushHandleFillColor)
        .attr("stroke", brushHandleStrokeColor)
        .attr("stroke-width", 2)
        .style("y", `-${HANDLE_HEIGHT / 2 - 1}px`)
        // .style("transform", `translateX(-${0}px)`)
        .style("width", `${HANDLE_HEIGHT}px`)
        .style("height", `${HANDLE_HEIGHT}px`)
        .attr("rx", `${HANDLE_HEIGHT}px`);

      g.select(".handle--w")
        .attr("tabindex", 0)
        .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "w"));
      g.select(".handle--e")
        .attr("tabindex", 0)
        .on("keydown", (e: $FixMe) => moveBrushOnKeyPress(e, "e"));

      // Apply brush to selected group
      g.call(brush);
    };
    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  }, [
    brush,
    brushHandleFillColor,
    brushHandleStrokeColor,
    brushOverlayColor,
    brushSelectionColor,
    moveBrushOnKeyPress,
  ]);

  // This effect allows "snapping" to actual data points
  // after brush is ended and interactive-filters state is updated
  useEffect(() => {
    const g = select(ref.current);
    if (closestFrom && closestTo && brushedIsEnded) {
      const coord = [brushWidthScale(closestFrom), brushWidthScale(closestTo)];
      (g.transition() as Transition<
        SVGGElement,
        unknown,
        null,
        undefined
      >).call(brush.move, coord);

      updateBrushEndedStatus(false);
    }
  }, [
    brushWidthScale,
    brushedIsEnded,
    dispatch,
    closestFrom?.toString(),
    closestTo?.toString(),
  ]);

  // This effect resets brush defaults to editor values
  // without transition
  useEffect(() => {
    const g = select(ref.current);

    const defaultSelection = [
      brushWidthScale(closestFrom),
      brushWidthScale(closestTo),
    ];
    (g as Selection<SVGGElement, unknown, null, undefined>).call(
      brush.move,
      defaultSelection
    );
  }, [closestFrom.toString(), closestTo.toString()]);

  // This effect makes the brush responsive
  useEffect(() => {
    const g = select(ref.current);

    const coord = [brushWidthScale(closestFrom), brushWidthScale(closestTo)];
    (g as Selection<SVGGElement, unknown, null, undefined>).call(
      brush.move,
      coord
    );
  }, [brushWidth, BRUSH_HEIGHT]);

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
//         type: "ADD_TIME_FILTER",
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
//             type: "ADD_TIME_FILTER",
//             value: [indexLeft, to],
//           });
//         } else {
//           // new too high, don't do anything
//           dispatch({
//             type: "ADD_TIME_FILTER",
//             value: [from, to],
//           });
//         }
//       } else if (event.keyCode === 39 && handleDirection === "w") {
//         // west handle, moving right

//         const indexRight = from + 1;
//         if (indexRight < to) {
//           dispatch({
//             type: "ADD_TIME_FILTER",
//             value: [indexRight, to],
//           });
//         } else {
//           dispatch({
//             type: "ADD_TIME_FILTER",
//             value: [from, to],
//           });
//         }
//       } else if (event.keyCode === 37 && handleDirection === "e") {
//         // east handle, moving left

//         const indexLeft = to - 1;

//         if (indexLeft > from) {
//           dispatch({
//             type: "ADD_TIME_FILTER",
//             value: [from, indexLeft],
//           });
//         } else {
//           dispatch({
//             type: "ADD_TIME_FILTER",
//             value: [from, to],
//           });
//         }
//       } else if (event.keyCode === 39 && handleDirection === "e") {
//         // east handle, moving right
//         const indexRight = to < sortedData.length - 1 ? to + 1 : to;

//         if (indexRight && indexRight > from) {
//           dispatch({
//             type: "ADD_TIME_FILTER",
//             value: [from, indexRight],
//           });
//         } else {
//           dispatch({
//             type: "ADD_TIME_FILTER",
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
