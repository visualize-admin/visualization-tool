import { bisector, pointer } from "d3";
import { MouseEvent, memo, useRef } from "react";

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
  const { chartData, chartWideData, xScale, getX } =
    chartState.chartType === "comboLineColumn"
      ? {
          chartData: chartState.chartData,
          chartWideData: chartState.chartWideData,
          xScale: chartState.xScaleTime,
          getX: chartState.getXAsDate,
        }
      : chartState;
  const { chartWidth, chartHeight, margins } = chartState.bounds;
  const [state, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const findDatum = (e: MouseEvent) => {
    const [x, y] = pointer(e, ref.current!);
    const bisectDate = bisector(
      (ds: Observation, date: Date) => getX(ds).getTime() - date.getTime()
    ).left;
    const thisDate = xScale.invert(x);
    const i = bisectDate(chartWideData, thisDate, 1);
    const dLeft = chartWideData[i - 1];
    const dRight = chartWideData[i] || dLeft;
    const closestDatum =
      thisDate.getTime() - getX(dLeft).getTime() >
      getX(dRight).getTime() - thisDate.getTime()
        ? dRight
        : dLeft;

    if (closestDatum) {
      const closestDatumTime = getX(closestDatum).getTime();
      const datumToUpdate = chartData.find(
        (d) => closestDatumTime === getX(d).getTime()
      ) as Observation;

      if (
        !state.interaction.d ||
        closestDatumTime !== getX(state.interaction.d).getTime()
      ) {
        dispatch({
          type: "INTERACTION_UPDATE",
          value: {
            interaction: {
              visible: true,
              mouse: { x, y },
              d: datumToUpdate,
            },
          },
        });
      }
    }
  };

  const hideTooltip = () => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  };

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        fillOpacity={0}
        width={chartWidth}
        height={chartHeight}
        onMouseOut={hideTooltip}
        onMouseOver={findDatum}
        onMouseMove={findDatum}
      />
    </g>
  );
});
