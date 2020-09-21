import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import { arc, PieArcDatum, pie, Pie } from "d3-shape";
import * as React from "react";
import { ReactNode, useMemo, useCallback } from "react";
import {
  Observation,
  PieFields,
  SortingType,
  SortingOrder,
} from "../../../domain";
import { getPalette, useFormatNumber } from "../../../domain/helpers";
import { Tooltip } from "../interaction/tooltip";
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
  sortingType?: SortingType;
  sortingOrder?: SortingOrder;
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else {
    // default to ascending byDimensionLabel
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};

export interface PieState {
  bounds: Bounds;
  sortedData: Observation[];
  getPieData: Pie<$IntentionalAny, Observation>;
  getY: (d: Observation) => number;
  getX: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  getAnnotationInfo: (d: PieArcDatum<Observation>) => Tooltip;
}

const usePieState = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: PieFields;
  aspectRatio: number;
}): PieState => {
  const width = useWidth();
  const formatNumber = useFormatNumber();

  const getY = useCallback(
    (d: Observation): number => +d[fields.y.componentIri] as number,
    [fields.y.componentIri]
  );
  const getX = useCallback(
    (d: Observation): string => d[fields.segment.componentIri] as string,
    [fields.segment.componentIri]
  );

  // Sort data
  const sortingType = fields.segment.sorting?.sortingType;
  const sortingOrder = fields.segment.sorting?.sortingOrder;

  // Data actually sorted in pie(),
  // Sorting here only useful to legend items.
  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  // Map ordered segments to colors
  const segments = Array.from(new Set(sortedData.map((d) => getX(d))));
  const colors = scaleOrdinal<string, string>();
  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  ) as $FixMe;

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
      const dvIri = segmentDimension.values.find(
        (s: $FixMe) => s.label === segment
      ).value;

      return {
        label: segment,
        color: fields.segment?.colorMapping![dvIri] || "#006699",
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(segments);
    colors.range(getPalette(fields.segment?.palette));
  }

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

  // Pie data
  const getPieData = pie<Observation>()
    .value((d) => getY(d))
    .sort((a, b) => {
      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return descending(getX(a), getX(b));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return ascending(getX(a), getX(b));
      } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
        return descending(getY(a), getY(b));
      } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
        return ascending(getY(a), getY(b));
      } else {
        // default to ascending byDimensionLabel
        return ascending(getX(a), getX(b));
      }
    });

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
    getPieData,
    getY,
    getX,
    colors,
    getAnnotationInfo,
  };
};

const PieChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: PieFields;
  aspectRatio: number;
}) => {
  const state = usePieState({
    data,
    fields,
    dimensions,
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
  dimensions,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
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
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </PieChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
