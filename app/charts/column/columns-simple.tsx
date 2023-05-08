import { ColumnsState } from "@/charts/column/columns-state";
import { Column } from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/use-chart-state";
import { VerticalWhisker } from "@/charts/whiskers";
import { useTheme } from "@/themes";

export const ErrorWhiskers = () => {
  const state = useChartState() as ColumnsState;
  const {
    getX,
    getYErrorRange,
    preparedData,
    yScale,
    xScale,
    showStandardError,
  } = state;
  const { margins } = state.bounds;

  if (!getYErrorRange || !showStandardError) {
    return null;
  }

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {preparedData.map((d, i) => {
        const x0 = xScale(getX(d)) as number;
        const bandwidth = xScale.bandwidth();
        const barwidth = Math.min(bandwidth, 15);
        const [y1, y2] = getYErrorRange(d);
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
        const x = xScale(getX(d)) as number;
        return (
          <Column
            key={i}
            data-index={i}
            width={xScale.bandwidth()}
            x={x}
            y={yScale(Math.max(y, 0))}
            height={Math.abs(yScale(y) - yScale(0))}
            color={
              y <= 0 ? theme.palette.secondary.main : theme.palette.primary.main
            }
          />
        );
      })}
    </g>
  );
};
