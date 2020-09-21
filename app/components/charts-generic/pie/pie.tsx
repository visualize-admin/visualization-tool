import { arc, PieArcDatum } from "d3-shape";
import * as React from "react";
import { Observation } from "../../../domain";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { PieState } from "./pie-state";

export const Pie = () => {
  const {
    sortedData,
    getPieData,
    getX,
    colors,
    bounds,
  } = useChartState() as PieState;
  const { width, height, chartWidth, chartHeight } = bounds;

  const arcs = getPieData(sortedData);

  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = maxSide; // Math.min(maxSide, 100);

  const xTranslate = width / 2;
  const yTranslate = height / 2;

  return (
    <g transform={`translate(${xTranslate},${yTranslate})`}>
      {arcs.map((arcDatum, i) => (
        <Arc
          key={i}
          arcDatum={arcDatum}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          color={colors(getX(arcDatum.data))}
        />
      ))}
    </g>
  );
};

const Arc = ({
  arcDatum,
  innerRadius,
  outerRadius,
  color,
}: {
  arcDatum: PieArcDatum<Observation>;
  innerRadius: number;
  outerRadius: number;
  color: string;
}) => {
  const [, dispatch] = useInteraction();
  const { startAngle, endAngle } = arcDatum;

  const arcGenerator = arc<$FixMe>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const handleMouseEnter = (d: PieArcDatum<Observation>) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: {
        interaction: {
          visible: true,
          d: (d as unknown) as Observation, // FIXME
        },
      },
    });
  };
  const handleMouseLeave = () => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  };
  return (
    <path
      d={arcGenerator({ startAngle, endAngle }) as string}
      fill={color}
      onMouseEnter={() => handleMouseEnter(arcDatum)}
      onMouseLeave={handleMouseLeave}
    />
  );
};
