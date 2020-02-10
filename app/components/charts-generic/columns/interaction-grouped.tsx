import * as React from "react";
import { Observation } from "../../../domain";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { ColumnsTooltip } from "./tooltip";
import { ColumnsState } from "./columns-state";

export const InteractionGrouped = () => {
  const [, dispatch] = useInteraction();
  const {
    sortedData,
    bounds,
    xScale,
    xScaleIn,
    getX,
    getY,
    yScale,
    getSegment
  } = useChartState() as ColumnsState;

  const { margins, chartWidth, chartHeight } = bounds;

  const showTooltip = (d: Observation) => {
    const placement =
      (xScale(getX(d)) as number) > chartWidth / 2 ? "left" : "right";

    dispatch({
      type: "TOOLTIP_UPDATE",
      value: {
        tooltip: {
          visible: true,
          x: (xScale(getX(d)) as number) + (xScaleIn(getSegment(d)) as number),
          y: yScale(getY(d)),
          placement,
          content: <ColumnsTooltip content={{ x: getX(d), y: getY(d) }} />
        }
      }
    });
  };
  const hideTooltip = () => {
    dispatch({
      type: "TOOLTIP_HIDE"
    });
  };
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {sortedData.map((d, i) => (
        <rect
          key={i}
          x={(xScale(getX(d)) as number) + (xScaleIn(getSegment(d)) as number)}
          y={0}
          width={xScaleIn.bandwidth()}
          height={chartHeight}
          fill="black"
          fillOpacity={0}
          stroke="none"
          onMouseOut={hideTooltip}
          onMouseOver={() => showTooltip(d)}
        />
      ))}
    </g>
  );
};
