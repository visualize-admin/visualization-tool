import { bisector } from "d3";
import { pointer } from "d3";
import { memo, useRef, MouseEvent } from "react";
import { Observation } from "../../domain/data";
import { AreasState } from "../area/areas-state";
import { LinesState } from "../line/lines-state";
import { useChartState } from "./use-chart-state";
import { useInteraction } from "./use-interaction";

export const InteractionHorizontal = memo(function InteractionHorizontal({
  debug,
}: {
  debug?: boolean;
}) {
  const [, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const { data, bounds, getX, xScale, chartWideData } = useChartState() as
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
      dispatch({
        type: "INTERACTION_UPDATE",
        value: {
          interaction: {
            visible: true,
            mouse: { x, y },
            d: data.find(
              // FIXME: we should also filter on y
              (d) => getX(closestDatum).getTime() === getX(d).getTime()
            ),
          },
        },
      });
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
