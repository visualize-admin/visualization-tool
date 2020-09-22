import * as React from "react";
import { useFormatCurrency } from "../../../domain/helpers";
import { getLocalizedLabel } from "../../../domain/translation";
import { useI18n } from "../../i18n-context";
import { BAR_AXIS_OFFSET, BAR_SPACE_ON_TOP } from "../constants";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { GroupedBarsState } from "./bars-grouped-state";
import { Bar } from "./bars-simple";

export const BarsGrouped = () => {
  const {
    bounds,
    xScale,
    yScaleIn,
    getX,
    getY,
    yScale,
    getSegment,
    getColor,
    getOpacity,
    colors,
    opacityScale,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const {
    domainColor,
    markBorderColor,
    axisLabelFontSize,
    axisLabelFontWeight,
    axisLabelColor,
  } = useChartTheme();

  const i18n = useI18n();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment, i) => {
        return (
          <g
            key={`${segment[0]}-${i}`}
            transform={`translate(0, ${yScale(segment[0])})`}
          >
            <g
              transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
            >
              {segment[1].map((d, i) => (
                <Bar
                  key={i}
                  y={yScaleIn(getSegment(d)) as number}
                  x={0}
                  width={xScale(Math.max(0, getX(d)))}
                  height={yScaleIn.bandwidth()}
                  color={colors(getColor(d))}
                  fillOpacity={opacityScale(getOpacity(d))}
                  stroke={markBorderColor}
                />
              ))}
            </g>
            <line
              x1={0}
              y1={BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET * 2}
              x2={0}
              y2={yScale.bandwidth()}
              stroke={domainColor}
            />
            <text
              x={0}
              y={BAR_SPACE_ON_TOP * (1 / 2)}
              fontSize={axisLabelFontSize}
              fontWeight={axisLabelFontWeight}
              fill={axisLabelColor}
            >
              {/* FIXME: the label shouldn't be localized here */}
              {getLocalizedLabel({ i18n, id: segment[0] })}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const BarsGroupedLabels = () => {
  const {
    bounds,
    yScaleIn,
    getX,
    yScale,
    getSegment,
    getLabel,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const { axisLabelColor, labelFontSize, fontFamily } = useChartTheme();
  const formatCurrency = useFormatCurrency();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment, i) => {
        return (
          <g
            key={`${segment[0]}-${i}`}
            transform={`translate(0, ${yScale(segment[0])})`}
          >
            <g
              transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
            >
              {segment[1].map((d, i) => (
                <text
                  key={i}
                  style={{
                    fontFamily,
                    fill: axisLabelColor,
                    fontSize: labelFontSize,
                  }}
                  x={0}
                  y={yScaleIn(getSegment(d)) as number}
                  dx={6}
                  dy={labelFontSize * 1.5}
                >
                  <tspan fontWeight="bold">{formatCurrency(getX(d))}</tspan>{" "}
                  {getLabel(d)}
                </text>
              ))}
            </g>
          </g>
        );
      })}
    </g>
  );
};
