import {
  ascending,
  descending,
  extent,
  group,
  max,
  min,
  rollup,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
  stack,
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
  sum,
} from "d3";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import React, { ReactNode, useCallback, useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
import {
  getLabelWithUnit,
  getWideData,
  useOptionalNumericVariable,
  usePlottableData,
  usePreparedData,
  useSegment,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnFields, SortingOrder, SortingType } from "@/configurator";
import {
  formatNumberWithUnit,
  getPalette,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { sortByIndex } from "@/utils/array";
import { makeDimensionValueSorters } from "@/utils/sorting-values";

export interface StackedColumnsState {
  chartType: "column";
  preparedData: Observation[];
  allData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => string;
  getXAsDate: (d: Observation) => Date;
  xIsTime: boolean;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  xEntireScale: ScaleTime<number, number>;
  getY: (d: Observation) => number | null;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (segment: string) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  yAxisDescription: string | undefined;
  chartWideData: ArrayLike<Observation>;
  allDataWide: ArrayLike<Observation>;
  grouped: [string, Observation[]][];
  series: $FixMe[];
  getAnnotationInfo: (d: Observation, orderedSegments: string[]) => TooltipInfo;
}

const useColumnsStackedState = (
  chartProps: Pick<
    ChartProps,
    "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
  > & {
    fields: ColumnFields;
    aspectRatio: number;
  }
): StackedColumnsState => {
  const {
    data,
    fields,
    measures,
    dimensions,
    interactiveFiltersConfig,
    aspectRatio,
  } = chartProps;
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const [interactiveFilters] = useInteractiveFilters();

  const xDimension = dimensions.find((d) => d.iri === fields.x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xIsTime = xDimension.__typename === "TemporalDimension";

  const getX = useStringVariable(fields.x.componentIri);
  const getXAsDate = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const getSegment = useSegment(fields.segment?.componentIri);

  const xKey = fields.x.componentIri;

  // All Data
  const sortingType = fields.x.sorting?.sortingType;
  const sortingOrder = fields.x.sorting?.sortingOrder;

  const allDataGroupedByX = useMemo(() => group(data, getX), [data, getX]);
  const allDataWide = useMemo(
    () =>
      getWideData({
        dataGroupedByX: allDataGroupedByX,
        xKey,
        getY,
        getSegment,
      }),
    [allDataGroupedByX, xKey, getY, getSegment]
  );

  const xOrder = useMemo(
    () =>
      allDataWide
        .sort((a, b) => ascending(a.total ?? undefined, b.total ?? undefined))
        .map((d) => getX(d)),
    [allDataWide, getX]
  );

  const sortedData = useMemo(
    () =>
      sortData({
        data,
        getX,
        sortingType,
        sortingOrder,
        xOrder,
      }),
    [data, getX, sortingType, sortingOrder, xOrder]
  );

  const plottableSortedData = usePlottableData({
    data: sortedData,
    plotters: [getXAsDate, getY],
  });

  // Data for Chart
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData: plottableSortedData,
    interactiveFilters,
    getX: getXAsDate,
    getSegment,
  });

  const preparedDataGroupedByX = useMemo(
    () => group(preparedData, getX),
    [preparedData, getX]
  );

  const chartWideData = getWideData({
    dataGroupedByX: preparedDataGroupedByX,
    xKey,
    getY,
    getSegment,
  });

  const sumsBySegment = useMemo(
    () =>
      Object.fromEntries([
        ...rollup(
          plottableSortedData,
          (v) => sum(v, (x) => getY(x)),
          (x) => getSegment(x)
        ),
      ]),
    [getSegment, getY, plottableSortedData]
  );

  const segments = useMemo(() => {
    const uniqueSegments = Array.from(
      new Set(plottableSortedData.map((d) => getSegment(d)))
    );
    const dimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    );

    const sorters = makeDimensionValueSorters(dimension, {
      sorting: fields?.segment?.sorting,
      sumsBySegment,
    });
    return orderBy(uniqueSegments, sorters, sortingOrder);
  }, [
    plottableSortedData,
    dimensions,
    fields.segment?.sorting,
    fields.segment?.componentIri,
    sumsBySegment,
    sortingOrder,
    getSegment,
  ]);

  const { segmentValuesByLabel, segmentValuesByValue } = useMemo(() => {
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    ) || { values: [] };
    return {
      segmentValuesByValue: keyBy(segmentDimension.values, (x) => x.value),
      segmentValuesByLabel: keyBy(segmentDimension.values, (x) => x.label),
    };
  }, [dimensions, fields.segment?.componentIri]);

  // Scales
  // Map ordered segments labels to colors
  const {
    colors,
    xScale,
    xScaleInteraction,
    xEntireScale,
    yStackDomain,
    bandDomain,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (fields.segment && segmentValuesByLabel && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = segments.map((segment) => {
        // FIXME: Labels in observations can differ from dimension values because the latter can be concatenated to only appear once per value
        // See https://github.com/visualize-admin/visualization-tool/issues/97
        const dvIri =
          segmentValuesByLabel[segment]?.value ||
          segmentValuesByValue[segment]?.value;

        // There is no way to gracefully recover here :(
        if (!dvIri) {
          console.warn(`Can't find color for '${segment}'.`);
          // throw Error(`Can't find color for '${segment}'.`);
        }

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
    const bandDomain = [...new Set(preparedData.map((d) => getX(d) as string))];
    const xScale = scaleBand()
      .domain(bandDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(bandDomain)
      .paddingInner(0)
      .paddingOuter(0);

    // x as time, needs to be memoized!
    const xEntireDomainAsTime = extent(plottableSortedData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];
    const xEntireScale = scaleTime().domain(xEntireDomainAsTime);

    // y
    const minTotal = min<$FixMe, number>(chartWideData, (d) =>
      segments
        .map((s) => d[s])
        .filter((d) => d < 0)
        .reduce((a, b) => a + b, 0)
    );
    const maxTotal = max<$FixMe, number>(chartWideData, (d) =>
      segments
        .map((s) => d[s])
        .filter((d) => d >= 0)
        .reduce((a, b) => a + b, 0)
    );
    const yStackDomain = [minTotal, maxTotal] as [number, number];

    return {
      colors,
      yStackDomain,
      xScale,
      xEntireScale,
      xScaleInteraction,
      bandDomain,
    };
  }, [
    chartWideData,
    fields.segment,
    getX,
    getXAsDate,
    plottableSortedData,
    preparedData,
    segmentValuesByLabel,
    segmentValuesByValue,
    segments,
  ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);
  const yAxisDescription = yMeasure.description || undefined;

  const yScale = scaleLinear().domain(yStackDomain).nice();

  // stack order
  const series = useMemo(() => {
    const sorting = fields.segment?.sorting;
    const sortingType = sorting?.sortingType;
    const sortingOrder = sorting?.sortingOrder;
    const stackOrder =
      sortingType === "byTotalSize"
        ? sortingOrder === "asc"
          ? stackOrderAscending
          : stackOrderDescending
        : // Reverse segments here, so they're sorted from top to bottom
          stackOrderReverse;

    const stacked = stack()
      .order(stackOrder)
      .offset(stackOffsetDiverging)
      .keys(segments);

    const series = stacked(
      chartWideData as {
        [key: string]: number;
      }[]
    );
    return series;
  }, [chartWideData, fields.segment?.sorting, segments]);

  /** Chart dimensions */
  const { left, bottom } = useChartPadding(
    yScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain
  );

  const margins = {
    top: 50,
    right: 40,
    bottom: bottom + BOTTOM_MARGIN_OFFSET,
    left: left + LEFT_MARGIN_OFFSET,
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

  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  /** When segment values are IRIs, we need to find show the label */
  const getSegmentLabel = useCallback(
    (segment: string): string => {
      return segmentValuesByValue[segment]?.label || segment;
    },
    [segmentValuesByValue]
  );

  const formatters = useChartFormatters(chartProps);

  // Tooltips
  const getAnnotationInfo = useCallback(
    (datum: Observation): TooltipInfo => {
      const xRef = xScale(getX(datum)) as number;
      const xOffset = xScale.bandwidth() / 2;

      const tooltipValues = preparedDataGroupedByX.get(
        getX(datum)
      ) as Observation[];

      const sortedTooltipValues = sortByIndex({
        data: tooltipValues,
        order: segments,
        getCategory: getSegment,
        sortOrder: "asc",
      });

      const cumulativeSum = (
        (sum) => (d: Observation) =>
          (sum += getY(d) ?? 0)
      )(0);
      const cumulativeRulerItemValues = sortedTooltipValues.map(cumulativeSum);

      const yRef = yScale(
        Math.max(
          cumulativeRulerItemValues[cumulativeRulerItemValues.length - 1],
          0
        )
      );
      const yAnchor = yRef;
      const yPlacement = "top";

      const getXPlacement = () => {
        if (xRef + xOffset * 2 > 0.75 * chartWidth) {
          return "left";
        } else if (xRef < 0.25 * chartWidth) {
          return "right";
        } else {
          return "center";
        }
      };
      const xPlacement = getXPlacement();

      const getXAnchor = () => {
        return xPlacement === "right"
          ? xRef
          : xPlacement === "center"
          ? xRef + xOffset
          : xRef + xOffset * 2;
      };
      const xAnchor = getXAnchor();
      const rawSegment = fields.segment && getSegment(datum);

      const yValueFormatter = (value: number | null) =>
        formatNumberWithUnit(
          value,
          formatters[yMeasure.iri] || formatNumber,
          yMeasure.unit
        );

      return {
        xAnchor,
        yAnchor,
        placement: { x: xPlacement, y: yPlacement },
        xValue: getX(datum),
        datum: {
          label: rawSegment,
          value: yValueFormatter(getY(datum)),
          color: colors(getSegment(datum)) as string,
        },
        values: sortedTooltipValues.map((td) => ({
          label: getSegmentLabel(getSegment(td)),
          value: yValueFormatter(getY(td)),
          color: colors(getSegment(td)) as string,
        })),
      };
    },
    [
      chartWidth,
      colors,
      fields.segment,
      formatNumber,
      formatters,
      getSegment,
      getSegmentLabel,
      getX,
      getY,
      preparedDataGroupedByX,
      segments,
      xScale,
      yMeasure.iri,
      yMeasure.unit,
      yScale,
    ]
  );

  return {
    chartType: "column",
    preparedData,
    allData: plottableSortedData,
    bounds,
    getX,
    getXAsDate,
    xScale,
    xScaleInteraction,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    getSegmentLabel,
    yAxisLabel,
    yAxisDescription,
    segments,
    colors,
    chartWideData,
    allDataWide,
    grouped: [...preparedDataGroupedByX],
    series,
    getAnnotationInfo,
    xIsTime,
  };
};

const StackedColumnsChartProvider = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useColumnsStackedState({
    data,
    fields,
    dimensions,
    interactiveFiltersConfig,
    measures,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const StackedColumnsChart = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  aspectRatio: number;
  children: ReactNode;
  fields: ColumnFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <StackedColumnsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </StackedColumnsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getX,
  sortingType,
  sortingOrder,
  xOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  sortingType: SortingType | undefined;
  sortingOrder: SortingOrder | undefined;
  xOrder: string[];
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingType === "byMeasure") {
    const sd = sortByIndex({
      data,
      order: xOrder,
      getCategory: getX,
      sortOrder: sortingOrder,
    });

    return sd;
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
