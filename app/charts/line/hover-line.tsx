import { line } from "d3";
import { memo } from "react";

import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const HoverLine = () => {
  const { getX, xScale, getY, yScale, grouped, colors, bounds } =
    useChartState() as LinesState;
  const [state] = useInteraction();
  const { visible } = state.interaction;

  const lineGenerator = line<Observation>()
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d) ?? 0));

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
                stroke="grey.100"
                fill={colors(segment)}
              />
            ))}
          </g>
        </>
      )} */}
    </>
  );
};
const Line = memo(function Line({
  path,
  color,
}: {
  path: string;
  color?: string;
}) {
  return <path d={path} strokeWidth={2} stroke={color} fill="none" />;
});
