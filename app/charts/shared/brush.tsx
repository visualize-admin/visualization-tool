import { bisector, Transition } from "d3";
import { brushX } from "d3";
import { select, Selection } from "d3";
import "d3-transition";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatShortDateAuto } from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
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
  const formatDateAuto = useFormatShortDateAuto();

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
  const { getXAsDate, sortedData } = useChartState() as ColumnsState;

  const getDate = chartType === "column" ? getXAsDate : getX;
  const allData = chartType === "column" ? sortedData : allDataWide;

  const updateBrushStatus = (event: $FixMe) => {
    const selection = event.selection;
    if (!event.sourceEvent || !selection) {
      updateBrushEndedStatus(false);
    } else {
      updateBrushEndedStatus(true);
    }
  };

  const brushed = ({ selection }: { selection: [number, number] }) => {
    updateBrushEndedStatus(false);

    if (selection) {
      const [xStart, xEnd] = selection.map((s) => xEntireScale.invert(s));

      // Start date
      const bisectDateLeft = bisector(
        (ds: Observation, date: Date) => getDate(ds).getTime() - date.getTime()
      ).left;
      const startIndex = bisectDateLeft(allData, xStart, 1);
      const dStartLeft = allData[startIndex - 1];
      const dStartRight = allData[startIndex] || dStartLeft;
      const startClosestDatum =
        xStart.getTime() - getDate(dStartLeft).getTime() >
        getDate(dStartRight).getTime() - xStart.getTime()
          ? dStartRight
          : dStartLeft;

      // End date
      const bisectDateRight = bisector(
        (ds: Observation, date: Date) => getDate(ds).getTime() - date.getTime()
      ).right;
      const endIndex = bisectDateRight(allData, xEnd, 1);
      const dEndLeft = allData[endIndex - 1];
      const dEndRight = allData[endIndex] || dEndLeft;
      const endClosestDatum =
        xEnd.getTime() - getDate(dEndLeft).getTime() >
        getDate(dEndRight).getTime() - xEnd.getTime()
          ? dEndRight
          : dEndLeft;

      // Update interactive filters state
      dispatch({
        type: "ADD_TIME_FILTER",
        value: [getDate(startClosestDatum), getDate(endClosestDatum)],
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
    .on("end", updateBrushStatus);

  /** Keyboard support */
  const moveBrushOnKeyPress = useCallback(
    (event: $FixMe, handleDirection: "w" | "e") => {
      updateBrushEndedStatus(false);

      const bisectDateLeft = bisector(
        (ds: Observation, date: Date) => getDate(ds).getTime() - date.getTime()
      ).left;
      const bisectDateRight = bisector(
        (ds: Observation, date: Date) => getDate(ds).getTime() - date.getTime()
      ).right;

      if (event.keyCode === 37 && handleDirection === "w") {
        // west handle, moving left
        const index = bisectDateLeft(allData, from, 1);
        const indexLeft = allData[index - 1];

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
        const index = bisectDateRight(allData, from, 1);
        const indexRight = allData[index];
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
        const index = bisectDateLeft(allData, to, 1);
        const indexLeft = allData[index - 1];

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
        const index = bisectDateRight(allData, to, 1);
        const indexLeft = allData[index];

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
    },
    [allData, dispatch, from, getDate, to]
  );

  const mkBrush = useCallback(
    (g: Selection<SVGGElement, unknown, null, undefined>) => {
      g.select(".overlay")
        .attr("fill", brushOverlayColor)
        .attr("fill-opacity", 0.9);
      g.select(".selection")
        .attr("fill", brushSelectionColor)
        .attr("fill-opacity", 1)
        .attr("stroke", "none");
      g.selectAll(".handle")
        .attr("fill", brushHandleFillColor)
        .attr("stroke", brushHandleStrokeColor)
        .attr("stroke-width", 2)
        .style("y", `-${HANDLE_HEIGHT / 2}px`)
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
    },
    [
      brush,
      brushHandleFillColor,
      brushHandleStrokeColor,
      brushOverlayColor,
      brushSelectionColor,
      moveBrushOnKeyPress,
    ]
  );

  useEffect(() => {
    const g = select(ref.current);
    mkBrush(g as Selection<SVGGElement, unknown, null, undefined>);
  }, [mkBrush]);

  // This effect allow "snapping" to actual data points
  // after brush is ended and interactive-filters state is updated
  useEffect(() => {
    const g = select(ref.current);
    if (from && to && brushedIsEnded) {
      const coord = [xEntireScale(from), xEntireScale(to)];

      (g.transition() as Transition<
        SVGGElement,
        unknown,
        null,
        undefined
      >).call(brush.move, coord);
    }
  }, [brush.move, from, to, xEntireScale, brushedIsEnded]);

  return (
    <>
      {/* Handle Dates */}
      {/* <g
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight +
          bounds.margins.top +
          bounds.margins.bottom / 2 +
          HANDLE_HEIGHT / 2 +
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
      </g> */}
      {/* Selected Dates */}
      <g
        transform={`translate(0, ${
          bounds.chartHeight + bounds.margins.top + bounds.margins.bottom / 2
        })`}
      >
        {from && to && (
          <text
            fontSize={labelFontSize}
            textAnchor="start"
            x={0}
            y={0}
            dy={labelFontSize / 2}
          >
            {`${formatDateAuto(from)} - ${formatDateAuto(to)}`}
          </text>
        )}
      </g>
      {/* Date Start and End */}

      {/* <g
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight +
          bounds.margins.top +
          bounds.margins.bottom / 2 +
          HANDLE_HEIGHT / 2 +
          4
        })`}
      >
        {xEntireScale.domain().map((date, i) => (
          <text
            key={i}
            fontSize={10}
            textAnchor="middle"
            x={xEntireScale(date)}
            y={10}
          >
            {formatDateAuto(date)}
          </text>
        ))}
      </g> */}
      {/* Date ticks */}
      {/* <g
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top + bounds.margins.bottom / 2
        })`}
      >
        {xUniqueValues.map((date, i) => (
          <rect
            key={i}
            x={xEntireScale(date)}
            y={0}
            width={1}
            height={BRUSH_HEIGHT}
          />
        ))}
      </g> */}

      {/* Brush */}
      <g
        ref={ref}
        // tabIndex={0}
        // focusable="true"
        transform={`translate(${bounds.margins.left}, ${
          bounds.chartHeight + bounds.margins.top + bounds.margins.bottom / 2
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
