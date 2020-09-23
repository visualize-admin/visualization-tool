import { axisLeft } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { BarsState } from "../bars/bars-state";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";

// export const AxisHeightBand = () => {
//   const ref = useRef<SVGGElement>(null);
//   const { xScale, yScale, bounds } = useChartState() as BarsState;

//   const { chartHeight, margins } = bounds;

//   const {
//     labelColor,
//     gridColor,
//     labelFontSize,
//     fontFamily,
//     domainColor,
//   } = useChartTheme();

//   const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
//     const rotation = true; // xScale.domain().length > 6;
//     const hasNegativeValues = xScale.domain()[0] < 0;

//     const fontSize =
//       yScale.bandwidth() > labelFontSize ? labelFontSize : yScale.bandwidth();
//     g.call(
//       axisLeft(yScale)
//         .tickSizeOuter(0)
//         .tickSizeInner(hasNegativeValues ? -chartHeight : 6)
//     );

//     g.select(".domain").remove();
//     g.selectAll(".tick line").attr(
//       "stroke",
//       hasNegativeValues ? gridColor : domainColor
//     );
//     g.selectAll(".tick text")
//       .attr("font-size", fontSize)
//       .attr("font-family", fontFamily)
//       .attr("fill", labelColor)
//       .attr("y", rotation ? 0 : fontSize + 6)
//       .attr("x", rotation ? fontSize : 0)
//       .attr("dy", rotation ? ".35em" : 0);
//     // .attr("transform", rotation ? "rotate(90)" : "rotate(0)")
//     // .attr("text-anchor", rotation ? "start" : "unset");
//   };

//   useEffect(() => {
//     const g = select(ref.current);
//     mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
//   });

//   return (
//     <g
//       ref={ref}
//       transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
//     />
//   );
// };

export const AxisHeightBandDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const { xScale, bounds } = useChartState() as BarsState;
  const { chartHeight, margins } = bounds;
  const { domainColor } = useChartTheme();

  const mkAxisDomain = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
    g.call(axisLeft(xScale).tickSizeOuter(0));
    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
    g.select(".domain")
      .attr("transform", `translate(0, -${bounds.chartHeight - xScale(0)})`)
      .attr("stroke", domainColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
    />
  );
};
