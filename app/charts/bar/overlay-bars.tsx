import { BarsState } from "@/charts/bar/bars-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const InteractionBars = () => {
  const [, dispatch] = useInteraction();

  const { chartData, bounds, getY, yScaleInteraction } =
    useChartState() as BarsState;
  const { margins, chartWidth } = bounds;

  const showTooltip = (d: Observation) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: {
        observation: d,
        visible: true,
      },
    });
  };
  const hideTooltip = () => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  };
  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {chartData.map((d, i) => (
        <rect
          key={i}
          x={0}
          y={yScaleInteraction(getY(d)) as number}
          height={yScaleInteraction.bandwidth()}
          width={Math.max(0, chartWidth)}
          fill="hotpink"
          fillOpacity={0}
          stroke="none"
          onMouseOut={hideTooltip}
          onMouseOver={() => showTooltip(d)}
        />
      ))}
    </g>
  );
};
