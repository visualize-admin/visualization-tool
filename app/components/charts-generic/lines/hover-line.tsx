import * as React from "react";
import { useChartState } from "../use-chart-state";
import { line } from "d3-shape";
import { Observation } from "../../../domain";
import { LinesState } from "./lines-state";

import { useInteraction } from "../use-interaction";

export const HoverLine = () => {
  const {
    getX,
    xScale,
    getY,
    yScale,
    grouped,
    colors,
    bounds
  } = useChartState() as LinesState;
  const [state] = useInteraction();
  const { visible } = state.annotation;

  const lineGenerator = line<Observation>()
    .x(d => xScale(getX(d)))
    .y(d => yScale(getY(d)));

  // const segmentData = segment && grouped.get(segment);

  return (
    <>
      {/* {visible && segment && segmentData && (
        <>
          <g
            transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}
          >
            <Line
              path={lineGenerator(segmentData) as string}
              color={colors(segment)}
            />
          </g>
          <g
            transform={`translate(${bounds.margins.left} ${bounds.margins.top})`}
          >
            {segmentData.map((d, i) => (
              <circle
                key={i}
                cx={xScale(getX(d))}
                cy={yScale(getY(d))}
                r={4}
                stroke="monochrome100"
                fill={colors(segment)}
              />
            ))}
          </g>
        </>
      )} */}
    </>
  );
};
const Line = React.memo(({ path, color }: { path: string; color?: string }) => {
  return <path d={path} strokeWidth={2} stroke={color} fill="none" />;
});
