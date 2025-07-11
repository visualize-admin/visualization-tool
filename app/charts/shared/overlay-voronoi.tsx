import { Delaunay } from "d3-delaunay";
import { pointer } from "d3-selection";
import { memo, MouseEvent as ReactMouseEvent, useMemo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";

const atLeastZero = (n: number) => (n < 0 ? 0 : n);

export const InteractionVoronoi = memo(function InteractionVoronoi({
  debug,
}: {
  debug?: boolean;
}) {
  const [, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);
  const {
    chartData,
    getX,
    xScale,
    getY,
    yScale,
    getSegment,
    colors,
    bounds: { chartWidth, chartHeight, margins },
  } = useChartState() as LinesState | AreasState | ScatterplotState;

  const delaunay = useMemo(() => {
    return Delaunay.from(
      chartData,
      (d) => xScale(getX(d) ?? NaN),
      (d) => yScale(getY(d) ?? NaN)
    );
  }, [chartData, xScale, yScale, getX, getY]);

  const voronoi = useMemo(() => {
    return delaunay.voronoi([
      0,
      0,
      atLeastZero(chartWidth),
      atLeastZero(chartHeight),
    ]);
  }, [chartWidth, chartHeight, delaunay]);

  const findLocation = (e: ReactMouseEvent) => {
    const [x, y] = pointer(e, ref.current!);
    const location = delaunay.find(x, y);
    const observation = chartData[location];

    if (typeof location !== "undefined") {
      dispatch({
        type: "INTERACTION_UPDATE",
        value: {
          type: "tooltip",
          visible: true,
          observation,
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
      {debug &&
        chartData.map((d, i) => (
          <path
            key={i}
            d={voronoi.renderCell(i)}
            fill={colors(getSegment(d))}
            fillOpacity={0.2}
            stroke="white"
            strokeOpacity={1}
          />
        ))}
      <rect
        fillOpacity={0}
        width={chartWidth}
        height={Math.max(0, chartHeight)}
        onMouseOut={hideTooltip}
        onMouseOver={findLocation}
        onMouseMove={findLocation}
      />
    </g>
  );
});
