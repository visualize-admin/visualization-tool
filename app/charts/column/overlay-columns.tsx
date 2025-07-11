import { useCallback } from "react";

import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useOverlayInteractions } from "@/charts/shared/overlay-utils";
import { Observation } from "@/domain/data";

export const InteractionColumns = ({ temporal }: { temporal?: boolean }) => {
  const {
    chartData,
    bounds: { chartHeight, margins },
    getX,
    getXAsDate,
    formatXDate,
    xScaleInteraction,
  } = useChartState() as
    | ColumnsState
    | StackedColumnsState
    | GroupedColumnsState
    | ComboLineColumnState;
  const { onClick, onHover, onHoverOut } = useOverlayInteractions();
  const getXValue = useCallback(
    (d: Observation) => {
      return temporal ? formatXDate(getXAsDate(d)) : getX(d);
    },
    [formatXDate, getX, getXAsDate, temporal]
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
            onMouseOver={() => onHover(d)}
            onMouseOut={onHoverOut}
            onClick={() => onClick(d)}
          />
        );
      })}
    </g>
  );
};
