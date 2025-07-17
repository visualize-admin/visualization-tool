import { Delaunay } from "d3-delaunay";
import { pointer } from "d3-selection";
import { memo, MouseEvent, useCallback, useMemo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useAnnotationInteractions } from "@/charts/shared/use-annotation-interactions";
import { Observation } from "@/domain/data";

type InteractionVoronoiChartState = AreasState | LinesState | ScatterplotState;

export const InteractionVoronoi = memo(function InteractionVoronoi({
  debug,
}: {
  debug?: boolean;
}) {
  const ref = useRef<SVGGElement>(null);
  const chartState = useChartState() as InteractionVoronoiChartState;
  const {
    bounds: { chartWidth, chartHeight, margins },
    getSegment,
    colors,
  } = chartState;
  const { onClick, onHover, onHoverOut } = useAnnotationInteractions({
    focusingSegment: true,
  });

  const voronoiPoints = useMemo(() => {
    return getVoronoiPoints(chartState);
  }, [chartState]);

  const delaunay = useMemo(() => {
    return Delaunay.from(
      voronoiPoints,
      (d) => d.x,
      (d) => d.y
    );
  }, [voronoiPoints]);

  const voronoi = useMemo(() => {
    return delaunay.voronoi([
      0,
      0,
      atLeastZero(chartWidth),
      atLeastZero(chartHeight),
    ]);
  }, [chartWidth, chartHeight, delaunay]);

  const findVoronoiPoint = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) {
        return;
      }

      const [x, y] = pointer(e, ref.current);
      const i = delaunay.find(x, y);

      return voronoiPoints[i];
    },
    [voronoiPoints, delaunay]
  );

  const handleHover = useCallback(
    (e: MouseEvent) => {
      const point = findVoronoiPoint(e);

      if (point) {
        onHover(point.observation, { segment: point.segment });
      }
    },
    [findVoronoiPoint, onHover]
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const point = findVoronoiPoint(e);

      if (point) {
        onClick(point.observation, { segment: point.segment });
      }
    },
    [findVoronoiPoint, onClick]
  );

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`}>
      {debug &&
        voronoiPoints.map(({ observation }, i) => (
          <path
            key={i}
            d={voronoi.renderCell(i)}
            stroke="white"
            strokeOpacity={1}
            fill={colors(getSegment(observation))}
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

type VoronoiDataPoint = {
  x: number;
  y: number;
  observation: Observation;
  segment?: string;
};

const getVoronoiPoints = (chartState: InteractionVoronoiChartState) => {
  const { chartData, xScale, getX, yScale, getY, getSegment } = chartState;

  switch (chartState.chartType) {
    case "area": {
      const { series } = chartState;

      return series.flatMap((s) => {
        const segment = s.key;

        return s
          .map((d) => {
            const observation = d.data;
            const x = xScale(getX(observation) ?? NaN);
            const y = yScale(series.length === 1 ? d[0] : (d[0] + d[1]) * 0.5);

            return {
              x,
              y,
              observation,
              segment,
            };
          })
          .filter(
            (point) => !Number.isNaN(point.x) && !Number.isNaN(point.y)
          ) satisfies VoronoiDataPoint[];
      });
    }
    case "line":
    case "scatterplot": {
      return chartData
        .map((d) => {
          const segment = getSegment(d);

          return {
            observation: d,
            x: xScale(getX(d) ?? NaN),
            y: yScale(getY(d) ?? NaN),
            segment,
          };
        })
        .filter(
          (point) => !Number.isNaN(point.x) && !Number.isNaN(point.y)
        ) satisfies VoronoiDataPoint[];
    }
    default:
      const _exhaustiveCheck: never = chartState;
      return _exhaustiveCheck;
  }
};

const atLeastZero = (n: number) => (n < 0 ? 0 : n);
