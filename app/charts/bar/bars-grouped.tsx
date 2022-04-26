import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { Bar } from "@/charts/bar/bars-simple";
import { BAR_AXIS_OFFSET, BAR_SPACE_ON_TOP } from "@/charts/bar/constants";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";

export const BarsGrouped = () => {
  const {
    bounds,
    xScale,
    yScaleIn,
    getX,
    yScale,
    getSegment,
    colors,
    grouped,
  } = useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const {
    markBorderColor,
    axisLabelFontSize,
    axisLabelFontWeight,
    axisLabelColor,
  } = useChartTheme();
  const [interactiveFilters] = useInteractiveFilters();
  const { categories } = interactiveFilters;
  const activeInteractiveFilters = Object.keys(categories);

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {grouped.map((segment, i) => {
        return (
          <g
            key={`${segment[0]}-${i}`}
            transform={`translate(0, ${yScale(segment[0])})`}
          >
            <text
              x={xScale(0)}
              y={BAR_SPACE_ON_TOP * (1 / 2)}
              fontSize={axisLabelFontSize}
              fontWeight={axisLabelFontWeight}
              fill={axisLabelColor}
              dx={6}
            >
              {segment[0]}
            </text>
            <g
              transform={`translate(0, ${BAR_SPACE_ON_TOP - BAR_AXIS_OFFSET})`}
            >
              {segment[1].map((d, i) => (
                <Bar
                  key={i}
                  y={yScaleIn(getSegment(d)) as number}
                  x={xScale(Math.min(0, getX(d)))}
                  width={
                    activeInteractiveFilters.includes(getSegment(d))
                      ? 0
                      : Math.abs(xScale(getX(d)) - xScale(0))
                  }
                  height={yScaleIn.bandwidth()}
                  color={colors(getSegment(d))}
                  stroke={markBorderColor}
                />
              ))}
            </g>
          </g>
        );
      })}
    </g>
  );
};

export const BarsGroupedLabels = () => {
  const { bounds, yScaleIn, getX, yScale, getSegment, grouped } =
    useChartState() as GroupedBarsState;
  const { margins } = bounds;
  const { axisLabelColor, labelFontSize, fontFamily } = useChartTheme();

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
                  <tspan fontWeight="bold">{getX(d)}</tspan> {getSegment(d)}
                </text>
              ))}
            </g>
          </g>
        );
      })}
    </g>
  );
};
