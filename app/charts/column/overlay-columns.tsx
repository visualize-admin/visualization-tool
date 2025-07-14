import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useOverlayInteractions } from "@/charts/shared/overlay-utils";

export const InteractionColumns = () => {
  const chartState = useChartState() as
    | ColumnsState
    | StackedColumnsState
    | GroupedColumnsState;
  const {
    chartData,
    bounds: { chartHeight, margins },
    getX,
    xScaleInteraction,
    getSegment,
  } = chartState;
  const { onClick, onHover, onHoverOut } = useOverlayInteractions({
    getSegment,
  });
  const bandwidth = xScaleInteraction.bandwidth();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {chartData.map((d, i) => {
        const x = getX(d);
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
