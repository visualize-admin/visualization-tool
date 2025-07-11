import { bisector } from "d3-array";
import { pointer } from "d3-selection";
import { memo, MouseEvent, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const InteractionHorizontal = memo(function InteractionHorizontal() {
  const chartState = useChartState() as
    | AreasState
    | LinesState
    | ComboLineSingleState
    | ComboLineDualState
    | ComboLineColumnState;
  const { chartData, chartWideData, xScale, getX, getAnnotationInfo } =
    chartState.chartType === "comboLineColumn"
      ? {
          chartData: chartState.chartData,
          chartWideData: chartState.chartWideData,
          xScale: chartState.xScaleTime,
          getX: chartState.getXAsDate,
          getAnnotationInfo: chartState.getAnnotationInfo,
        }
      : chartState;
  const { chartWidth, chartHeight, margins } = chartState.bounds;
  const [interaction, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const hideTooltip = () => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  };

  const findDatum = (e: MouseEvent) => {
    const [x, y] = pointer(e, ref.current!);
    const bisectDate = bisector(
      (d: Observation, date: Date) => getX(d).getTime() - date.getTime()
    ).left;
    const thisDate = xScale.invert(x);
    const i = bisectDate(chartWideData, thisDate, 1);
    const dLeft = chartWideData[i - 1];
    const dRight = chartWideData[i] ?? dLeft;
    const closestDatum =
      thisDate.getTime() - getX(dLeft).getTime() >
      getX(dRight).getTime() - thisDate.getTime()
        ? dRight
        : dLeft;
    const yAnchor = closestDatum
      ? getAnnotationInfo(closestDatum).yAnchor
      : undefined;

    if (!closestDatum || Number.isNaN(yAnchor) || yAnchor === undefined) {
      if (interaction.visible) {
        hideTooltip();
      }

      return;
    }

    const closestDatumTime = getX(closestDatum).getTime();
    const newObservation = chartData.find(
      (d) => closestDatumTime === getX(d).getTime()
    ) as Observation;

    if (
      !interaction.observation ||
      closestDatumTime !== getX(interaction.observation).getTime() ||
      !interaction.visible
    ) {
      dispatch({
        type: "INTERACTION_UPDATE",
        value: {
          type: "tooltip",
          visible: true,
          observation: newObservation,
          mouse: { x, y },
        },
      });
    }
  };

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        fillOpacity={0}
        width={chartWidth}
        height={Math.max(0, chartHeight)}
        onMouseOut={hideTooltip}
        onMouseOver={findDatum}
        onMouseMove={findDatum}
      />
    </g>
  );
});
