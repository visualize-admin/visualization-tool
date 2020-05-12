import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import { arc, PieArcDatum } from "d3-shape";
import * as React from "react";
import { ReactNode, useMemo, useCallback } from "react";
import { Observation, PieFields } from "../../../domain";
import { formatNumber, getPalette } from "../../../domain/helpers";
import { Tooltip } from "../annotations/tooltip";
import { Bounds, Observer, useWidth } from "../use-width";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { descending, ascending } from "d3-array";

const sortData = ({
  data,
  getX,
  getY,
  sortingType,
  sortingOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  getY: (d: Observation) => number;
  sortingType: string;
  sortingOrder: string;
}) => {
  if (sortingOrder === "desc" && sortingType === "alphabetical") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "alphabetical") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingOrder === "desc" && sortingType === "y") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (sortingOrder === "asc" && sortingType === "y") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};

export interface PieState {
  bounds: Bounds;
  sortedData: Observation[];
  getY: (d: Observation) => number;
  getX: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  getAnnotationInfo: (d: PieArcDatum<Observation>) => Tooltip;
}

const usePieState = ({
  data,
  fields,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: PieFields;
  aspectRatio: number;
}): PieState => {
  const width = useWidth();

  const getY = useCallback(
    (d: Observation): number => +d[fields.y.componentIri] as number,
    [fields.y.componentIri]
  );
  const getX = useCallback(
    (d: Observation): string => d[fields.segment.componentIri] as string,
    [fields.segment.componentIri]
  );

  // Sort data
  const { sortingType, sortingOrder } = fields.segment.sorting;

  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  const colors = scaleOrdinal(getPalette(fields.segment.palette)).domain(
    sortedData.map(getX)
  );

  // Dimensions
  const margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * aspectRatio;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  // Pie values
  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = Math.min(maxSide, 100);

  const arcGenerator = arc<Observation, PieArcDatum<Observation>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  // Tooltip
  const getAnnotationInfo = (arcDatum: PieArcDatum<Observation>): Tooltip => {
    const [x, y] = arcGenerator.centroid(arcDatum);
    const datum = arcDatum.data;

    const xTranslate = chartWidth / 2;
    const yTranslate = chartHeight / 2;

    const xAnchor = x + xTranslate;
    const yAnchor = y + yTranslate;

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement =
      yAnchor > chartHeight * 0.2
        ? "top"
        : yAnchor < chartHeight * 0.8
        ? "bottom"
        : "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: getX(datum),
      datum: {
        value: formatNumber(getY(datum)),
        color: colors(getX(datum)) as string,
      },
      values: undefined,
    };
  };
  return {
    bounds,
    sortedData,
    getY,
    getX,
    colors,
    getAnnotationInfo,
  };
};

const PieChartProvider = ({
  data,
  fields,
  measures,
  aspectRatio,

  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: PieFields;
  aspectRatio: number;
}) => {
  const state = usePieState({
    data,
    fields,
    measures,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const PieChart = ({
  data,
  fields,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  aspectRatio: number;
  fields: PieFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <PieChartProvider
          data={data}
          fields={fields}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </PieChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
