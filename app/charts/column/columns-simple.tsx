import { useTheme } from "../../themes";
import { useChartState } from "../shared/use-chart-state";
import { VerticalWhisker } from "../whiskers";
import { ColumnsState } from "./columns-state";
import { Column } from "./rendering-utils";

export const ErrorWhiskers = () => {
  const state = useChartState() as ColumnsState;

  const { getX, getYError, preparedData, yScale, xScale } = state;
  const { margins } = state.bounds;

  if (!getYError) {
    return null;
  }

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {preparedData.map((d, i) => {
        const x0 = xScale(getX(d)) as number;
        const bandwidth = xScale.bandwidth();
        const barwidth = Math.min(bandwidth, 15);
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
