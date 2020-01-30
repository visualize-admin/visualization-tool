import { Delaunay } from "d3-delaunay";
import { clientPoint } from "d3-selection";
import * as React from "react";
import { useRef } from "react";
import { Observation } from "../../../domain";
import { parseDate } from "../../../domain/helpers";
import { ChartProps, useChartState } from "../chart-state";

import { LineTooltip } from "./tooltip";
import { useLinesScale } from "./scales";
import { useBounds } from "..";

export const Interaction = React.memo(
  ({
    data,
    fields,
    debug
  }: Pick<ChartProps, "data" | "fields"> & { debug?: boolean }) => {
    const [, dispatch] = useChartState();
    const bounds = useBounds();

    const { chartWidth, chartHeight, margins } = bounds;
    const ref = useRef<SVGGElement>(null);

    // type assertion because ObservationValue is too generic
    const getX = (d: Observation): Date => parseDate(+d.x);
    const getY = (d: Observation): number => +d.y as number;
    const getPartition = (d: Observation): string => d.segment as string;

    const { colors, xScale, yScale } = useLinesScale({ data, fields });

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
              x: xScale(parseDate(+data[location].x)),
              y: yScale(+data[location].y),
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
              fill={colors(getPartition(d))}
              fillOpacity={0.2}
              stroke="white"
              strokeOpacity={1}
            />
          ))}
      </g>
    );
  }
);
