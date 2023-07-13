import { Delaunay, pointer } from "d3";
import { MouseEvent as ReactMouseEvent, memo, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";

export const InteractionVoronoi = memo(function InteractionVoronoi({
  debug,
}: {
  debug?: boolean;
}) {
  const [, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);
  const { chartData, getX, xScale, getY, yScale, getSegment, colors, bounds } =
    useChartState() as LinesState | AreasState | ScatterplotState;

  const { chartWidth, chartHeight, margins } = bounds;

  // FIXME: delaunay/voronoi calculation could be memoized
  const delaunay = Delaunay.from(
    chartData,
    (d) => xScale(getX(d) ?? NaN),
    (d) => yScale(getY(d) ?? NaN)
  );
  const voronoi = delaunay.voronoi([0, 0, chartWidth, chartHeight]);

  const findLocation = (e: ReactMouseEvent) => {
    const [x, y] = pointer(e, ref.current!);

    const location = delaunay.find(x, y);
    const d = chartData[location];

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
        height={chartHeight}
        onMouseOut={hideTooltip}
        onMouseOver={findLocation}
        onMouseMove={findLocation}
      />
    </g>
  );
});
