import { bisector } from "d3-array";
import { pointer } from "d3-selection";
import * as React from "react";
import { useRef } from "react";
import { Observation } from "../../../domain";
import { AreasState } from "../areas/areas-state";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";

export const InteractionHorizontal = React.memo(
  ({ debug }: { debug?: boolean }) => {
    const [, dispatch] = useInteraction();
    const ref = useRef<SVGGElement>(null);

    const { data, bounds, getX, xScale, wide } = useChartState() as AreasState;

    const { chartWidth, chartHeight, margins } = bounds;

    const findDatum = (e: React.MouseEvent) => {
      const [x, y] = pointer(e, ref.current!);

      const bisectDate = bisector(
        (ds: Observation, date: Date) => getX(ds).getTime() - date.getTime()
      ).left;

      const thisDate = xScale.invert(x);
      const i = bisectDate(wide, thisDate, 1);
      const dLeft = wide[i - 1];
      const dRight = wide[i] || dLeft;

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
  }
);
