import { HTMLAttributes, memo } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import {
  BAR_AXIS_OFFSET,
  BAR_HEIGHT,
  BAR_SPACE_ON_TOP,
} from "@/charts/bar/constants";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useTheme } from "@/themes";

export const Bars = () => {
  const { sortedData, bounds, getX, xScale, getY, yScale } =
    useChartState() as BarsState;
  const theme = useTheme();
  const { axisLabelFontSize, axisLabelFontWeight, axisLabelColor } =
    useChartTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {sortedData.map((d, i) => {
        return (
          <g transform={`translate(0, ${yScale(getY(d))})`} key={i}>
            <text
              x={xScale(0)}
              y={BAR_SPACE_ON_TOP * (1 / 2)}
              fontSize={axisLabelFontSize}
              fontWeight={axisLabelFontWeight}
              fill={axisLabelColor}
              dx={6}
            >
              {getY(d)}
            </text>
            <Bar
              key={i}
              x={xScale(Math.min(0, getX(d)))}
              width={Math.abs(xScale(getX(d)) - xScale(0))}
              y={BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET}
              height={BAR_HEIGHT}
              color={
                getX(d) <= 0
                  ? theme.palette.secondary.main
                  : theme.palette.primary.main
              }
            />
          </g>
        );
      })}
    </g>
  );
};

export const BarLabels = () => {
  const { sortedData, bounds, getX, getY, yScale } =
    useChartState() as BarsState;
  const { labelColor, labelFontSize, fontFamily } = useChartTheme();
  const { margins } = bounds;

  return (
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      {sortedData.map((d, i) => {
        return (
          <g transform={`translate(0, ${yScale(getY(d))} )`} key={i}>
            <text
              key={i}
              style={{
                fontFamily,
                fill: labelColor,
                fontSize: labelFontSize,
              }}
              x={0}
              y={BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET}
              dx={6}
              dy={labelFontSize * 1.5}
            >
              <tspan fontWeight="bold">{getX(d)}</tspan>
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const Bar = memo(
  ({
    x,
    y,
    width,
    height,
    color,
    fillOpacity = 1,
    stroke,
    ...props
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    fillOpacity?: number;
    stroke?: string;
  } & HTMLAttributes<SVGRectElement>) => {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={stroke}
        {...props}
      />
    );
  }
);
