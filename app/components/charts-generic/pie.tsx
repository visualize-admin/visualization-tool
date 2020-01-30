import { arc, pie, PieArcDatum } from "d3-shape";
import * as React from "react";
import { useState } from "react";
import { Observation } from "../../domain";
import { ChartProps, useChartState } from "./chart-state";
import { useColorScale } from "./scales";
import { useBounds } from ".";

export function Pie({ data, fields, dimensions, measures }: ChartProps) {
  const bounds = useBounds();
  const { width } = bounds;

  // type assertion because ObservationValue is too generic
  const getPieValue = (d: Observation): number => +d.value as number;
  const getPiePartition = (d: Observation): string => d.segment as string;

  const colors = useColorScale({ data, field: "segment" });

  const getPieData = pie<Observation>().value(d => getPieValue(d));

  const arcs = getPieData(data);

  const innerRadius = 0;
  const outerRadius = Math.min(width, width * 0.4) / 2 - 1;

  return (
    <g transform={`translate(${width / 2} ${outerRadius})`}>
      {arcs.map((arcDatum, i) => (
        <Arc
          key={i}
          arcDatum={arcDatum}
          tooltipContent={getPiePartition(arcDatum.data)}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          color={colors(getPiePartition(arcDatum.data))}
        />
      ))}
    </g>
  );
}

const Arc = ({
  arcDatum,
  tooltipContent,
  innerRadius,
  outerRadius,
  color
}: {
  arcDatum: PieArcDatum<Observation>;
  tooltipContent: string;
  innerRadius: number;
  outerRadius: number;
  color: string;
}) => {
  const [, dispatch] = useChartState();
  const bounds = useBounds();
  const { width, height } = bounds;

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
          x: width / 2 + x,
          y: height / 2 + y,
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
              x: width / 2 + x,
              y: height / 2 + y,
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
