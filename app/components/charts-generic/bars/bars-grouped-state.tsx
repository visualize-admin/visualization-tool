import { ascending, descending, group, max, min, rollup, sum } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback, useMemo } from "react";
import {
  BarFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { Observation, ObservationValue } from "../../../domain/data";
import { getPalette, mkNumber } from "../../../domain/helpers";
import { sortByIndex } from "../../../lib/array";
import {
  BAR_HEIGHT,
  BAR_SPACE_ON_TOP,
  BOTTOM_MARGIN_OFFSET,
} from "./constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export interface GroupedBarsState {
  chartType: string;
  sortedData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => string;
  yScale: ScaleBand<string>;
  yScaleIn: ScaleBand<string>;
  getSegment: (d: Observation) => string;
  segments: string[];
  xAxisLabel: string;
  colors: ScaleOrdinal<string, string>;
  grouped: [string, Record<string, ObservationValue>[]][];
}

const useGroupedBarsState = ({
  data,
  fields,
  dimensions,
  measures,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: BarFields;
}): GroupedBarsState => {
  const width = useWidth();
  const getX = useCallback(
    (d: Observation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );

  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.y.componentIri;

  // Sort
  const ySortingType = fields.y.sorting?.sortingType;
  const ySortingOrder = fields.y.sorting?.sortingOrder;
  const yOrder = [
    ...rollup(
      data,
      (v) => sum(v, (x) => getX(x)),
      (x) => getY(x)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);

  const sortedData = useMemo(
    () =>
      sortData({
        data,
        getY,
        ySortingType,
        ySortingOrder,
        yOrder,
      }),
    [data, getY, ySortingType, ySortingOrder, yOrder]
  );
  // segments
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;
  const segmentsOrderedByName = Array.from(
    new Set(sortedData.map((d) => getSegment(d)))
  ).sort((a, b) =>
    segmentSortingOrder === "asc" ? ascending(a, b) : descending(a, b)
  );

  const segmentsOrderedByTotalValue = [
    ...rollup(
      sortedData,
      (v) => sum(v, (x) => getX(x)),
      (x) => getSegment(x)
    ),
  ]
    .sort((a, b) =>
      segmentSortingOrder === "asc"
        ? ascending(a[1], b[1])
        : descending(a[1], b[1])
    )
    .map((d) => d[0]);

  const segments =
    segmentSortingType === "byDimensionLabel"
      ? segmentsOrderedByName
      : segmentsOrderedByTotalValue;

  // Map ordered segments to colors
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

  // x
  const minValue = Math.min(mkNumber(min(sortedData, (d) => getX(d))), 0);
  const maxValue = max(sortedData, (d) => getX(d)) as number;
  const xScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();

  // y
  const bandDomain = [...new Set(sortedData.map((d) => getY(d) as string))];
  const chartHeight =
    bandDomain.length * (BAR_HEIGHT * segments.length + BAR_SPACE_ON_TOP);

  const yScale = scaleBand<string>().domain(bandDomain).range([0, chartHeight]);

  const yScaleIn = scaleBand()
    .domain(segments)
    // .padding(0)
    .range([0, BAR_HEIGHT * segments.length]);

  // Group
  const groupedMap = group(sortedData, getY);
  const grouped = [...groupedMap];

  // sort by segments
  grouped.forEach((group) => {
    return [
      group[0],
      sortByIndex({
        data: group[1],
        order: segments,
        getCategory: getSegment,
        sortOrder: segmentSortingOrder,
      }),
    ];
  });

  const margins = {
    top: 0,
    right: 40,
    bottom: BOTTOM_MARGIN_OFFSET,
    left: 0,
  };
  const chartWidth = width - margins.left - margins.right;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);

  return {
    chartType: "bar",
    sortedData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    yScaleIn,
    getSegment,
    segments,
    xAxisLabel,
    colors,
    grouped,
  };
};

const GroupedBarsChartProvider = ({
  data,
  fields,
  dimensions,
  measures,

  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useGroupedBarsState({
    data,
    fields,
    dimensions,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedBarsChart = ({
  data,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <GroupedBarsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
        >
          {children}
        </GroupedBarsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getY,
  ySortingType,
  ySortingOrder,
  yOrder,
}: {
  data: Observation[];
  getY: (d: Observation) => string;
  ySortingType: SortingType | undefined;
  ySortingOrder: SortingOrder | undefined;
  yOrder: string[];
}) => {
  if (ySortingOrder === "desc" && ySortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (ySortingOrder === "asc" && ySortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else if (ySortingType === "byMeasure") {
    const sd = sortByIndex({
      data,
      order: yOrder,
      getCategory: getY,
      sortOrder: ySortingOrder,
    });
    return sd;
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  }
};
