import { BarsState } from "@/charts/bar/bars-state";
import { useOverlayRectInteractions } from "@/charts/shared/annotation-utils";
import { useChartState } from "@/charts/shared/chart-state";

export const InteractionBars = () => {
  const {
    chartData,
    bounds: { chartWidth, margins },
    getY,
    yScaleInteraction,
  } = useChartState() as BarsState;
  const { onClick, onHover, onHoverOut } = useOverlayRectInteractions();

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
