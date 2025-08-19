import { bisector } from "d3-array";
import { pointer } from "d3-selection";
import { memo, MouseEvent, useCallback, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";
import { useEvent } from "@/utils/use-event";

export const InteractionHorizontal = memo(function InteractionHorizontal() {
  const {
    chartData,
    chartWideData,
    xScale,
    getX,
    getTooltipInfo,
    bounds: { chartWidth, chartHeight, margins },
  } = useChartState() as
    | AreasState
    | LinesState
    | ComboLineSingleState
    | ComboLineDualState;
  const [interaction, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const hideTooltip = useEvent(() => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  });

  const showTooltip = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      const [x, y] = pointer(e, ref.current);
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
        ? getTooltipInfo(closestDatum).yAnchor
        : undefined;

      if (!closestDatum || Number.isNaN(yAnchor) || yAnchor === undefined) {
        if (interaction.visible) {
          hideTooltip();
        }

        return;
      }

      const closestDatumTime = getX(closestDatum).getTime();
      const observation = chartData.find(
        (d) => closestDatumTime === getX(d).getTime()
      );

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
            observation,
            mouse: { x, y },
          },
        });
      }
    },
    [
      chartData,
      chartWideData,
      dispatch,
      getTooltipInfo,
      getX,
      hideTooltip,
      interaction.observation,
      interaction.visible,
      xScale,
    ]
  );

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        width={chartWidth}
        height={chartHeight}
        fillOpacity={0}
        onMouseOut={hideTooltip}
        onMouseOver={showTooltip}
        onMouseMove={showTooltip}
      />
    </g>
  );
});
