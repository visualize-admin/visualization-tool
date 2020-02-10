import * as React from "react";
import { Observation } from "../../../domain";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { ColumnsStackedTooltip } from "./tooltip";
import { ColumnsState } from "./columns-state";

export const InteractionStacked = () => {
  const [, dispatch] = useInteraction();
  const {
    bounds,
    getX,
    xScale,
    yStackScale,
    segments,
    colors,
    wide
  } = useChartState() as ColumnsState;
  const { margins, chartWidth, chartHeight } = bounds;

  const showTooltip = (d: Observation & { total: number }) => {
    const placement =
      (xScale(getX(d)) as number) > chartWidth / 2 ? "left" : "right";

    dispatch({
      type: "TOOLTIP_UPDATE",
      value: {
        tooltip: {
          visible: true,
          x: xScale(getX(d)),
          y: yStackScale(d.total),
          placement,
          content: (
            <ColumnsStackedTooltip
              content={d}
              colors={colors}
              segments={segments}
            />
          )
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
      {wide.map((d, i) => (
        <rect
          key={i}
          x={xScale(getX(d)) as number}
          y={0}
          width={xScale.bandwidth()}
          height={chartHeight}
          fill="black"
          fillOpacity={0}
          stroke="none"
          onMouseOut={hideTooltip}
          onMouseOver={() => showTooltip(d as Observation & { total: number })}
        />
      ))}
    </g>
  );
};
