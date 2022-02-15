import { memo } from "react";
import { useTheme } from "../../themes";
import { useChartState } from "../shared/use-chart-state";
import { ColumnsState } from "./columns-state";
import { Column } from "./rendering-utils";

export const VerticalWhisker = memo(
  ({
    x,
    y1,
    y2,
    width,
  }: {
    x: number;
    y1: number;
    y2: number;
    width: number;
    color?: string;
  }) => {
    return (
      <>
        <rect
          x={x}
          y={y1}
          width={width}
          height={2}
          fill={"black"}
          stroke="none"
        />
        <rect
          x={x + width / 2}
          y={y2}
          width={2}
          height={y1 - y2}
          fill={"black"}
          stroke="none"
        />
        <rect
          x={x}
          y={y2}
          width={width}
          height={2}
          fill={"black"}
          stroke="none"
        />
      </>
    );
  }
);

export const ErrorWhiskers = () => {
  const { preparedData, bounds, getX, xScale, getY, getYError, yScale } =
    useChartState() as ColumnsState;
  const { margins } = bounds;

  if (!getYError) {
    return null;
  }

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {preparedData.map((d, i) => {
        const x0 = xScale(getX(d)) as number;
        const bandwidth = xScale.bandwidth();
        const barwidth = bandwidth / 4;
        const [y1, y2] = getYError(d);
        return (
          <VerticalWhisker
            key={i}
            x={x0 + bandwidth / 2 - barwidth / 2}
            width={barwidth}
            y1={yScale(y1)}
            y2={yScale(y2)}
          />
        );
      })}
    </g>
  );
};

export const Columns = () => {
  const { preparedData, bounds, getX, xScale, getY, yScale } =
    useChartState() as ColumnsState;
  const theme = useTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {preparedData.map((d, i) => {
        const y = getY(d) ?? NaN;

        return (
          <Column
            key={i}
            x={xScale(getX(d)) as number}
            width={xScale.bandwidth()}
            y={yScale(Math.max(y, 0))}
            height={Math.abs(yScale(y) - yScale(0))}
            color={
              (getY(d) ?? NaN) <= 0
                ? theme.colors.secondary
                : theme.colors.primary
            }
          />
        );
      })}
    </g>
  );
};
