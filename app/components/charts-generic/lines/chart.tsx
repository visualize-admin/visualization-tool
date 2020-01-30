import { line } from "d3-shape";
import * as React from "react";
import { Observation } from "../../../domain";
import { ChartProps } from "../chart-state";
import { group, ascending } from "d3-array";
import { parseDate } from "../../../domain/helpers";
import { useLinesScale } from "./scales";
import { useBounds } from "..";
import { useMemo } from "react";

export const Lines = React.memo(
  ({ data, fields }: Pick<ChartProps, "data" | "fields">) => {
    const bounds = useBounds();
    const { margins } = bounds;

    // type assertion because ObservationValue is too generic
    const getX = (d: Observation): Date => parseDate(+d.x);
    const getY = (d: Observation): number => +d.y as number;
    const getPartition = (d: Observation): string => d.segment as string;

    const { colors, xScale, yScale } = useLinesScale({ data, fields });

    const sortedData = useMemo(
      () =>
        [...data].sort((a, b) => ascending(parseDate(+a.x), parseDate(+b.x))),
      [data]
    );

    const grouped = group(sortedData, getPartition);

    const lineGenerator = line<Observation>()
      // .defined(d => !isNaN(d))
      .x(d => xScale(getX(d)))
      .y(d => yScale(getY(d)));

    return (
      <g transform={`translate(${margins.left} ${margins.top})`}>
        {Array.from(grouped).map((observation, index) => {
          return (
            <Line
              key={index}
              path={lineGenerator(observation[1]) as string}
              color={colors(observation[0])}
            ></Line>
          );
        })}
      </g>
    );
  }
);

const Line = React.memo(({ path, color }: { path: string; color: string }) => {
  return <path d={path} stroke={color} fill="none" />;
});
