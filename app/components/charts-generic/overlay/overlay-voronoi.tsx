import { Delaunay } from "d3-delaunay";
import { pointer } from "d3-selection";
import * as React from "react";
import { useRef } from "react";
import { useChartState } from "../use-chart-state";
import { useInteraction } from "../use-interaction";
import { LinesState } from "../lines/lines-state";
import { AreasState } from "../areas/areas-state";
import { ScatterplotState } from "../scatterplot/scatterplot-state";

export const InteractionVoronoi = React.memo(
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
      bounds,
    } = useChartState() as LinesState | AreasState | ScatterplotState;

    const { chartWidth, chartHeight, margins } = bounds;

    // FIXME: delaunay/voronoi calculation could be memoized
    const delaunay = Delaunay.from(
      data,
      (d) => xScale(getX(d)),
      (d) => yScale(getY(d))
    );
    const voronoi = delaunay.voronoi([0, 0, chartWidth, chartHeight]);

    const findLocation = (e: React.MouseEvent) => {
      const [x, y] = pointer(e, ref.current!);

      const location = delaunay.find(x, y);
      const d = data[location];

      if (typeof location !== "undefined") {
        dispatch({
          type: "INTERACTION_UPDATE",
          value: {
            interaction: {
              visible: true,
              d,
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
