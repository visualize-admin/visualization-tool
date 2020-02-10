import { bisector } from "d3-array";
import { clientPoint } from "d3-selection";
import * as React from "react";
import { useRef } from "react";
import { Observation } from "../../../domain";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { LinesState } from "./lines-state";

export const InteractionRuler = () => {
  const [, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const {
    getX,
    xScale,
    yScale,
    colors,
    bounds,
    wide
  } = useChartState() as LinesState;

  const { chartWidth, chartHeight, margins } = bounds;

  const findDatum = (e: React.MouseEvent) => {
    const [x] = clientPoint(ref.current!, e);

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

    const placement = x > chartWidth / 2 ? "left" : "right";

    if (closestDatum) {
      dispatch({
        type: "RULER_UPDATE",
        value: {
          ruler: {
            visible: true,
            x: xScale(getX(closestDatum)),
            placement,
            points: Object.keys(closestDatum).map(segment => ({
              y: yScale(closestDatum[segment] as number),
              color: colors(segment),
              body: segment
            }))
          }
        }
      });
    }
  };
  const hideRuler = () => {
    dispatch({
      type: "RULER_HIDE"
    });
  };

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      <rect
        fillOpacity={0}
        width={chartWidth}
        height={chartHeight}
        onMouseOut={hideRuler}
        onMouseOver={findDatum}
        onMouseMove={findDatum}
      />
    </g>
  );
};
