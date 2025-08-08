import { useCallback, useMemo } from "react";

import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { useGetRenderStackedColumnDatum } from "@/charts/column/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { StackedAnnotationHighlight } from "@/charts/shared/overlay-rects";
import { useAnnotationInteractions } from "@/charts/shared/use-annotation-interactions";
import { Observation } from "@/domain/data";

export const InteractionColumns = ({
  disableGaps = true,
}: {
  disableGaps?: boolean;
}) => {
  const chartState = useChartState() as
    | ColumnsState
    | StackedColumnsState
    | GroupedColumnsState;
  const {
    chartData,
    bounds: { chartHeight, margins },
    getX,
    xScale,
    xScaleInteraction,
  } = chartState;
  const { onClick, onHover, onHoverOut } = useAnnotationInteractions({
    focusingSegment: false,
  });
  const scale = disableGaps ? xScaleInteraction : xScale;
  const bandwidth = scale.bandwidth();

  return (
    <g transform={`translate(${margins.left} ${margins.top})`}>
      {chartData.map((d, i) => {
        const x = getX(d);
        const xScaled = scale(x) as number;

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

export const InteractionColumnsStacked = () => {
  const {
    bounds: { height, margins },
    series,
  } = useChartState() as StackedColumnsState;
  const { onClick, onHover, onHoverOut } = useAnnotationInteractions({
    focusingSegment: true,
  });
  const getRenderDatum = useGetRenderStackedColumnDatum();
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

export const StackedColumnAnnotationHighlight = () => {
  const {
    bounds,
    getY,
    getX,
    yScale,
    xScale,
    chartDataGroupedByX,
    xDimension,
  } = useChartState() as StackedColumnsState;
  const getValue = useCallback(
    (d: Observation) => {
      return getY(d) ?? 0;
    },
    [getY]
  );

  return (
    <StackedAnnotationHighlight
      bounds={bounds}
      getValue={getValue}
      getAxisValue={getX}
      valueScale={yScale}
      axisScale={xScale}
      chartDataGrouped={chartDataGroupedByX}
      dimension={xDimension}
      isHorizontal={false}
    />
  );
};
