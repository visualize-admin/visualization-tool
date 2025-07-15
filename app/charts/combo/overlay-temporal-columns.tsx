import { useCallback } from "react";

import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useAnnotationInteractions } from "@/charts/shared/use-annotation-interactions";
import { Observation } from "@/domain/data";

export const InteractionTemporalColumns = () => {
  const {
    chartData,
    bounds: { chartHeight, margins },
    getXAsDate,
    formatXDate,
    xScaleInteraction,
  } = useChartState() as ComboLineColumnState;
  const { onClick, onHover, onHoverOut } = useAnnotationInteractions();
  const getXValue = useCallback(
    (d: Observation) => {
      return formatXDate(getXAsDate(d));
    },
    [formatXDate, getXAsDate]
  );
  const bandwidth = xScaleInteraction.bandwidth();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {chartData.map((d, i) => {
        const x = getXValue(d);
        const xScaled = xScaleInteraction(x) as number;

        return (
          <rect
            key={i}
            x={xScaled}
            y={0}
            width={bandwidth}
            height={Math.max(0, chartHeight)}
            fill="hotpink"
            fillOpacity={0}
            stroke="none"
            onMouseOver={() => onHover(d, { segment: undefined })}
            onMouseOut={onHoverOut}
            onClick={() => onClick(d, { segment: undefined })}
          />
        );
      })}
    </g>
  );
};
