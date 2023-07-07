import { bisector, pointer } from "d3";
import { MouseEvent, memo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";

export const InteractionHorizontal = memo(function InteractionHorizontal() {
  const [state, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const { chartData, bounds, getX, xScale, chartWideData } = useChartState() as
    | AreasState
    | LinesState;

  const { chartWidth, chartHeight, margins } = bounds;

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
