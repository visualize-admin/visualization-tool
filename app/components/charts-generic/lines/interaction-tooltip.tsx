import { Delaunay } from "d3-delaunay";
import { clientPoint } from "d3-selection";
import * as React from "react";
import { useRef } from "react";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { LineTooltip } from "./tooltip";
import { LinesState } from "./lines-state";

export const InteractionTooltip = React.memo(
  ({ debug }: { debug?: boolean }) => {
    const [, dispatch] = useInteraction();
    const ref = useRef<SVGGElement>(null);
    const {
      data,
      getX,
      xScale,
      getY,
      yScale,
      getSegment,
      colors,
      bounds
    } = useChartState() as LinesState;

    const { chartWidth, chartHeight, margins } = bounds;

    // FIXME: delaunay/voronoi calculation could be memoized
    const delaunay = Delaunay.from(
      data,
      d => xScale(getX(d)),
      d => yScale(getY(d))
    );
    const voronoi = delaunay.voronoi([0, 0, chartWidth, chartHeight]);

    const findLocation = (e: React.MouseEvent) => {
      const [x, y] = clientPoint(ref.current!, e);

      const location = delaunay.find(x, y);

      const placement = x > chartWidth / 2 ? "left" : "right";

      if (location) {
        dispatch({
          type: "TOOLTIP_UPDATE",
          value: {
            tooltip: {
              visible: true,
              x: xScale(getX(data[location])),
              y: yScale(getY(data[location])),
              placement,
              content: <LineTooltip content={data[location]} />
            }
          }
        });
      }
    };
    const hideTooltip = () => {
      dispatch({
        type: "TOOLTIP_HIDE"
      });
    };

    return (
      <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
        <rect
          fillOpacity={0}
          width={chartWidth}
          height={chartHeight}
          onMouseOut={hideTooltip}
          onMouseOver={findLocation}
          onMouseMove={findLocation}
        />

        {debug &&
          data.map((d, i) => (
            <path
              key={i}
              d={voronoi.renderCell(i)}
              fill={colors(getSegment(d))}
              fillOpacity={0.2}
              stroke="white"
              strokeOpacity={1}
            />
          ))}
      </g>
    );
  }
);
