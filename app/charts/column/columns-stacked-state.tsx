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
import { keyBy, sortBy } from "lodash";
import React, { ReactNode, useCallback, useMemo } from "react";
import { ColumnFields, SortingOrder, SortingType } from "@/configurator";
import {
  getPalette,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { DimensionMetaDataFragment } from "@/graphql/query-hooks";
import { sortByIndex } from "@/lib/array";
import { useLocale } from "@/locales/use-locale";
import { makeOrdinalDimensionSorter } from "@/utils/sorting-values";
import {
  getLabelWithUnit,
  getWideData,
  useOptionalNumericVariable,
  usePreparedData,
  useSegment,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";

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
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  chartWideData: ArrayLike<Observation>;
  allDataWide: ArrayLike<Observation>;
  grouped: [string, Observation[]][];
  series: $FixMe[];
  getAnnotationInfo: (d: Observation, orderedSegments: string[]) => TooltipInfo;
}

const useColumnsStackedState = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  fields: ColumnFields;
  aspectRatio: number;
}): StackedColumnsState => {
  const locale = useLocale();
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
        getY,
        sortingType,
        sortingOrder,
        xOrder,
      }),
    [data, getX, getY, sortingType, sortingOrder, xOrder]
  );

  // Data for Chart
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData,
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

  //Ordered segments
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const segments = useMemo(() => {
    const getSegmentsOrderedByName = () =>
      Array.from(new Set(sortedData.map((d) => getSegment(d)))).sort((a, b) =>
        segmentSortingOrder === "asc"
          ? a.localeCompare(b, locale)
          : b.localeCompare(a, locale)
      );

    const dimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    );
    const getSegmentsOrderedByPosition = () => {
      const segments = Array.from(
        new Set(sortedData.map((d) => getSegment(d)))
      );
      if (!dimension) {
        return segments;
      }
      const sorter = makeOrdinalDimensionSorter(dimension);
      return sortBy(segments, sorter);
    };

    const getSegmentsOrderedByTotalValue = () =>
      [
        ...rollup(
          sortedData,
          (v) => sum(v, (x) => getY(x)),
          (x) => getSegment(x)
        ),
      ]
        .sort((a, b) =>
          segmentSortingOrder === "asc"
            ? ascending(a[1], b[1])
            : descending(a[1], b[1])
        )
        .map((d) => d[0]);

    if (dimension?.__typename === "OrdinalDimension") {
      return getSegmentsOrderedByPosition();
    }

    return segmentSortingType === "byDimensionLabel"
      ? getSegmentsOrderedByName()
      : getSegmentsOrderedByTotalValue();
  }, [
    dimensions,
    segmentSortingType,
    sortedData,
    getSegment,
    segmentSortingOrder,
    locale,
    fields.segment?.componentIri,
    getY,
  ]);

  const segmentValuesByLabel = useMemo(() => {
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    ) as DimensionMetaDataFragment; // FIXME: define this type properly in the query
    return keyBy(segmentDimension.values, (x) => x.label);
  }, [dimensions, fields.segment?.componentIri]);

  // Scales
  // Map ordered segments labels to colors
  const colors = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (fields.segment && segmentValuesByLabel && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = segments.map((segment) => {
        // FIXME: Labels in observations can differ from dimension values because the latter can be concatenated to only appear once per value
        // See https://github.com/visualize-admin/visualization-tool/issues/97
        const dvIri = segmentValuesByLabel[segment]?.value;

        // There is no way to gracefully recover here :(
        if (!dvIri) {
          throw Error(`Can't find color for '${segment}'.`);
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
    return colors;
  }, [fields.segment, segmentValuesByLabel, segments]);

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
  const xEntireDomainAsTime = useMemo(
    () => extent(sortedData, (d) => getXAsDate(d)) as [Date, Date],
    [getXAsDate, sortedData]
  );
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

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const yScale = scaleLinear().domain(yStackDomain).nice();

  // stack order
  const stackOrder =
    segmentSortingType === "byTotalSize" && segmentSortingOrder === "asc"
      ? stackOrderAscending
      : segmentSortingType === "byTotalSize" && segmentSortingOrder === "desc"
      ? stackOrderDescending
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

      return {
        xAnchor,
        yAnchor,
        placement: { x: xPlacement, y: yPlacement },
        xValue: getX(datum),
        datum: {
          label: fields.segment && getSegment(datum),
          value: yMeasure.unit
            ? `${formatNumber(getY(datum))} ${yMeasure.unit}`
            : formatNumber(getY(datum)),
          color: colors(getSegment(datum)) as string,
        },
        values: sortedTooltipValues.map((td) => ({
          label: getSegment(td),
          value: yMeasure.unit
            ? `${formatNumber(getY(td))} ${yMeasure.unit}`
            : formatNumber(getY(td)),
          color: colors(getSegment(td)) as string,
        })),
      };
    },
    [
      chartHeight,
      chartWidth,
      colors,
      fields.segment,
      formatNumber,
      getSegment,
      getX,
      getY,
      preparedDataGroupedByX,
      segments,
      xScale,
      yMeasure.unit,
      yScale,
    ]
  );

  return {
    chartType: "column",
    preparedData,
    allData: sortedData,
    bounds,
    getX,
    getXAsDate,
    xScale,
    xScaleInteraction,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
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
  getY,
  sortingType,
  sortingOrder,
  xOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  getY: (d: Observation) => number | null;
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
