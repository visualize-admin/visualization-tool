import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useOverlayInteractions } from "@/charts/shared/overlay-utils";

export const InteractionBars = () => {
  const {
    chartData,
    bounds: { chartWidth, margins },
    getY,
    yScaleInteraction,
  } = useChartState() as BarsState | StackedBarsState | GroupedBarsState;
  const { onClick, onHover, onHoverOut } = useOverlayInteractions();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {chartData.map((d, i) => (
        <rect
          key={i}
          x={0}
          y={yScaleInteraction(getY(d)) as number}
          height={yScaleInteraction.bandwidth()}
          width={Math.max(0, chartWidth)}
          stroke="none"
          fill="hotpink"
          fillOpacity={0}
          onMouseOver={() => onHover(d)}
          onMouseOut={onHoverOut}
          onClick={() => onClick(d)}
        />
      ))}
    </g>
  );
};
