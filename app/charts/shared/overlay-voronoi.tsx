import { Delaunay } from "d3-delaunay";
import { pointer } from "d3-selection";
import { memo, MouseEvent, useCallback, useMemo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useOverlayInteractions } from "@/charts/shared/overlay-utils";

const atLeastZero = (n: number) => (n < 0 ? 0 : n);

export const InteractionVoronoi = memo(function InteractionVoronoi({
  debug,
}: {
  debug?: boolean;
}) {
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
  const { onClick, onHover, onHoverOut } = useOverlayInteractions();
  const ref = useRef<SVGGElement>(null);

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

  const findObservation = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      const [x, y] = pointer(e, ref.current);
      const i = delaunay.find(x, y);

      return chartData[i];
    },
    [chartData, delaunay]
  );

  const handleHover = useCallback(
    (e: MouseEvent) => {
      const observation = findObservation(e);

      if (observation) {
        onHover(observation);
      }
    },
    [findObservation, onHover]
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const observation = findObservation(e);

      if (observation) {
        onClick(observation);
      }
    },
    [findObservation, onClick]
  );

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      {debug &&
        chartData.map((d, i) => (
          <path
            key={i}
            d={voronoi.renderCell(i)}
            stroke="white"
            strokeOpacity={1}
            fill={colors(getSegment(d))}
            fillOpacity={0.2}
          />
        ))}
      <rect
        width={chartWidth}
        height={chartHeight}
        fillOpacity={0}
        onMouseOver={handleHover}
        onMouseMove={handleHover}
        onMouseOut={onHoverOut}
        onClick={handleClick}
      />
    </g>
  );
});
