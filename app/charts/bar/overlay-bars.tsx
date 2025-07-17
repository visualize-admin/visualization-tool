import { useMemo } from "react";

import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { useGetRenderStackedBarDatum } from "@/charts/bar/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { useAnnotationInteractions } from "@/charts/shared/use-annotation-interactions";

export const InteractionBars = ({
  disableGaps = true,
}: {
  disableGaps?: boolean;
}) => {
  const {
    chartData,
    bounds: { chartWidth, margins },
    getY,
    yScale,
    yScaleInteraction,
  } = useChartState() as BarsState | StackedBarsState | GroupedBarsState;
  const { onClick, onHover, onHoverOut } = useAnnotationInteractions({
    focusingSegment: false,
  });
  const scale = disableGaps ? yScaleInteraction : yScale;
  const bandwidth = scale.bandwidth();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {chartData.map((d, i) => {
        return (
          <rect
            key={i}
            x={0}
            y={scale(getY(d)) as number}
            height={bandwidth}
            width={Math.max(0, chartWidth)}
            stroke="none"
            fill="hotpink"
            fillOpacity={0}
            onMouseOver={() => onHover(d, { segment: undefined })}
            onMouseOut={onHoverOut}
            onClick={() => onClick(d, { segment: undefined })}
          />
        );
      })}
    </g>
  );
};

export const InteractionBarsStacked = () => {
  const {
    bounds: { height, margins },
    series,
  } = useChartState() as StackedBarsState;
  const { onClick, onHover, onHoverOut } = useAnnotationInteractions({
    focusingSegment: true,
  });
  const getRenderDatum = useGetRenderStackedBarDatum();
  const renderData = useMemo(() => {
    return series.flatMap(getRenderDatum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getRenderDatum,
    series,
    // We need to reset the yRange on height change.
    height,
  ]);

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {renderData.map((d) => {
        return (
          <rect
            key={d.key}
            x={d.x}
            y={d.y}
            width={d.width}
            height={d.height}
            fill="hotpink"
            fillOpacity={0}
            stroke="none"
            onMouseOver={() => onHover(d.observation, { segment: d.segment })}
            onMouseOut={onHoverOut}
            onClick={() => onClick(d.observation, { segment: d.segment })}
          />
        );
      })}
    </g>
  );
};
