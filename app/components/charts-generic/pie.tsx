import { arc, pie, PieArcDatum } from "d3-shape";
import * as React from "react";
import { useState } from "react";
import {
  DimensionWithMeta,
  MeasureWithMeta,
  Observation,
  PieFields
} from "../../domain";
import { useChartState } from "./chart-state";
import { useColorScale } from "./scales";

export interface PieProps {
  data: Observation[];
  fields: PieFields;
  dimensions: DimensionWithMeta[];
  measures: MeasureWithMeta[];
}

export function Pie({ data, fields, dimensions, measures }: PieProps) {
  // @ts-ignore
  const [state, dispatch] = useChartState();

  const { width, height } = state.bounds;

  // type assertion because ObservationValue is too generic
  const getPieValue = (d: Observation): number => +d.value as number;
  const getPiePartition = (d: Observation): string => d.segment as string;

  const colors = useColorScale({ data, field: "segment" });

  const getPieData = pie<Observation>().value(d => getPieValue(d));

  const arcs = getPieData(data);

  const innerRadius = 0;
  const outerRadius = Math.min(width, width * 0.4) / 2 - 1;

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
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
    </svg>
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
  // @ts-ignore
  const [, dispatch] = useChartState();

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
        tooltip: { visible: false, x, y, content: tooltipContent }
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
            tooltip: { visible, x, y, content: tooltipContent }
          }
        })
      }
      onMouseLeave={handleMouseLeave}
    />
  );
};
