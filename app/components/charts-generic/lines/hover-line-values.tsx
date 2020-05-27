import * as React from "react";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { LinesState } from "./lines-state";

export const HoverLineValues = () => {
  const {
    getX,
    xScale,
    getY,
    yScale,
    grouped,
    colors,
    bounds,
  } = useChartState() as LinesState;
  const [state] = useInteraction();

  // const { x, visible, segment } = state.tooltip;

  // const segmentData = segment && grouped.get(segment);

  return (
    <>
      {/* {visible && segment && segmentData && (
        <>
          <g
            transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}
          >
            {segmentData.map((d, i) => (
              <text
                key={i}
                x={xScale(getX(d))}
                y={yScale(getY(d))}
                fill={colors(segment)}
                textAnchor="middle"
                dy={-10}
                fontSize="0.8rem"
                opacity={xScale(getX(d)) !== x ? 1 : 0}
                style={{ transition: "opacity 200ms" }}
              >
                {formatNumber(getY(d))}
              </text>
            ))}
          </g>
        </>
      )} */}
    </>
  );
};
