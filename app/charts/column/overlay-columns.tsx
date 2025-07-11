import { useCallback } from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";
import { useEvent } from "@/utils/use-event";

export const InteractionColumns = ({ temporal }: { temporal?: boolean }) => {
  const [, dispatch] = useInteraction();
  const {
    chartData,
    bounds: { margins, chartHeight },
    getX,
    getXAsDate,
    formatXDate,
    xScaleInteraction,
  } = useChartState() as ColumnsState | ComboLineColumnState;
  const showTooltip = useEvent((d: Observation) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: {
        type: "tooltip",
        visible: true,
        observation: d,
      },
    });
  });
  const hideTooltip = useEvent(() => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  });
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
            onMouseOut={hideTooltip}
            onMouseOver={() => showTooltip(d)}
          />
        );
      })}
    </g>
  );
};
