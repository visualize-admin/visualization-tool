import { arc, pie, PieArcDatum } from "d3-shape";
import * as React from "react";
import { useState } from "react";
import { Observation } from "../../../domain";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { PieState } from "./pie-state";

export const Pie = () => {
  const {
    data,
    getValue,
    getSegment,
    colors,
    bounds
  } = useChartState() as PieState;
  const { chartWidth, chartHeight } = bounds;

  const getPieData = pie<Observation>().value(d => getValue(d));

  const arcs = getPieData(data);

  const innerRadius = 0;
  const outerRadius = Math.min(chartWidth, chartWidth * 0.4) / 2 - 1;

  return (
    <g transform={`translate(${chartWidth / 2} ${outerRadius})`}>
      {arcs.map((arcDatum, i) => (
        <Arc
          key={i}
          arcDatum={arcDatum}
          tooltipContent={getSegment(arcDatum.data)}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          color={colors(getSegment(arcDatum.data))}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
        />
      ))}
    </g>
  );
};

const Arc = ({
  arcDatum,
  tooltipContent,
  innerRadius,
  outerRadius,
  color,
  chartWidth,
  chartHeight
}: {
  arcDatum: PieArcDatum<Observation>;
  tooltipContent: string;
  innerRadius: number;
  outerRadius: number;
  color: string;
  chartWidth: number;
  chartHeight: number;
}) => {
  const [, dispatch] = useInteraction();

  const [visible, toggleTooltipVisibility] = useState(false);
  const { startAngle, endAngle } = arcDatum;

  const arcGenerator = arc<$FixMe, $FixMe>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const [x, y] = arcGenerator.centroid(arcDatum);

  const handleMouseEnter = () => {
    toggleTooltipVisibility(true);
  };
  const handleMouseLeave = () => {
    toggleTooltipVisibility(false);
    dispatch({
      type: "TOOLTIP_UPDATE",
      value: {
        tooltip: {
          visible: false,
          x: chartWidth / 2 + x,
          y: chartHeight / 2 + y,
          placement: "left",
          content: tooltipContent
        }
      }
    });
  };
  return (
    <path
      d={arcGenerator({ startAngle, endAngle }) as string}
      fill={color}
      onMouseEnter={handleMouseEnter}
      onMouseOver={() =>
        dispatch({
          type: "TOOLTIP_UPDATE",
          value: {
            tooltip: {
              visible,
              x: chartWidth / 2 + x,
              y: chartHeight / 2 + y,
              placement: "left",
              content: tooltipContent
            }
          }
        })
      }
      onMouseLeave={handleMouseLeave}
    />
  );
};
