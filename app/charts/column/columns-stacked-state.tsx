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
import orderBy from "lodash/orderBy";
import { ReactNode, useCallback, useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
import {
  getLabelWithUnit,
  getWideData,
  useDataAfterInteractiveFilters,
  useOptionalNumericVariable,
  usePlottableData,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { CommonChartState } from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import { useMaybeAbbreviations } from "@/charts/shared/use-abbreviations";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnFields, SortingOrder, SortingType } from "@/configurator";
import { isTemporalDimension, Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

export interface StackedColumnsState extends CommonChartState {
  chartType: "column";
  preparedData: Observation[];
  allData: Observation[];
  getX: (d: Observation) => string;
  getXLabel: (d: string) => string;
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
  yAxisDimension: DimensionMetadataFragment;
  chartWideData: ArrayLike<Observation>;
  allDataWide: ArrayLike<Observation>;
  grouped: [string, Observation[]][];
  series: $FixMe[];
  getAnnotationInfo: (d: Observation, orderedSegments: string[]) => TooltipInfo;
}

const useColumnsStackedState = (
  chartProps: Pick<
    ChartProps,
    "data" | "dimensions" | "measures" | "chartConfig"
  > & {
    fields: ColumnFields;
    aspectRatio: number;
  }
): StackedColumnsState => {
  const { data, fields, measures, dimensions, chartConfig, aspectRatio } =
    chartProps;
  const { interactiveFiltersConfig } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });

  const xKey = fields.x.componentIri;

  const xDimension = dimensions.find((d) => d.iri === xKey);

  if (!xDimension) {
    throw Error(`No dimension <${xKey}> in cube!`);
  }

  const xIsTime = isTemporalDimension(xDimension);

  const { getAbbreviationOrLabelByValue: getXAbbreviationOrLabel } =
    useMaybeAbbreviations({
      useAbbreviations: fields.x.useAbbreviations,
      dimension: xDimension,
    });

  const getXIri = useCallback(
    (d: Observation) => {
      return d[`${fields.x.componentIri}/__iri__`] as string | undefined;
    },
    [fields.x.componentIri]
  );

  const observationLabelsLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    data.forEach((d) => {
      const iri = getXIri(d);
      const label = getXAbbreviationOrLabel(d);
      lookup.set(iri ?? label, label);
    });

    return lookup;
  }, [data, getXAbbreviationOrLabel, getXIri]);

  const getX = useCallback(
    (d: Observation) => {
      return getXIri(d) ?? getXAbbreviationOrLabel(d);
    },
    [getXIri, getXAbbreviationOrLabel]
  );
  const getXLabel = useCallback(
    (d: string) => {
      return observationLabelsLookup.get(d) ?? d;
    },
    [observationLabelsLookup]
  );

  const getXAsDate = useTemporalVariable(xKey);
  const getY = useOptionalNumericVariable(fields.y.componentIri);

  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  );

  const {
    getAbbreviationOrLabelByValue: getSegmentAbbreviationOrLabel,
    abbreviationOrLabelLookup: segmentsByAbbreviationOrLabel,
  } = useMaybeAbbreviations({
    useAbbreviations: fields.segment?.useAbbreviations,
    dimension: segmentDimension,
  });

  const getSegmentIri = useCallback(
    (d: Observation) => {
      return (
        fields.segment ? d[`${fields.segment.componentIri}/__iri__`] : undefined
      ) as string | undefined;
    },
    [fields.segment]
  );

  const observationSegmentLabelsLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    data.forEach((d) => {
      const iri = getSegmentIri(d);
      const label = getSegmentAbbreviationOrLabel(d);
      lookup.set(iri ?? label, label);
    });

    return lookup;
  }, [data, getSegmentIri, getSegmentAbbreviationOrLabel]);

  const getSegment = useCallback(
    (d: Observation) => {
      return getSegmentIri(d) ?? getSegmentAbbreviationOrLabel(d);
    },
    [getSegmentIri, getSegmentAbbreviationOrLabel]
  );
  const getSegmentLabel = useCallback(
    (d: string) => {
      return observationSegmentLabelsLookup.get(d) ?? d;
    },
    [observationSegmentLabelsLookup]
  );

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  // All Data
  const xSortingType = fields.x.sorting?.sortingType;
  const xSortingOrder = fields.x.sorting?.sortingOrder;

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
        sortingType: xSortingType,
        sortingOrder: xSortingOrder,
        xOrder,
      }),
    [data, getX, xSortingType, xSortingOrder, xOrder]
  );

  const plottableSortedData = usePlottableData({
    data: sortedData,
    plotters: [getXAsDate, getY],
  });

  // Data for chart
  const { preparedData, scalesData } = useDataAfterInteractiveFilters({
    sortedData: plottableSortedData,
    interactiveFiltersConfig,
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

  const scalesDataGroupedByX = useMemo(
    () => group(scalesData, getX),
    [scalesData, getX]
  );

  const scalesWideData = getWideData({
    dataGroupedByX: scalesDataGroupedByX,
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

  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension?.iri]
    : undefined;
  const segments = useMemo(() => {
    const uniqueSegments = Array.from(
      new Set(plottableSortedData.map((d) => getSegment(d)))
    );

    const sorting = fields?.segment?.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      sumsBySegment,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });

    return orderBy(uniqueSegments, sorters, getSortingOrders(sorters, sorting));
  }, [
    plottableSortedData,
    segmentDimension,
    fields.segment?.sorting,
    fields.segment?.useAbbreviations,
    sumsBySegment,
    segmentFilter,
    getSegment,
  ]);

  // Scales
  // Map ordered segments labels to colors
  const {
    colors,
    xScale,
    xScaleInteraction,
    xEntireScale,
    yStackDomain,
    bandDomainLabels,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (
      fields.segment &&
      segmentsByAbbreviationOrLabel &&
      fields.segment.colorMapping
    ) {
      const orderedSegmentLabelsAndColors = segments.map((segment) => {
        // FIXME: Labels in observations can differ from dimension values because the latter can be concatenated to only appear once per value
        // See https://github.com/visualize-admin/visualization-tool/issues/97
        const dvIri =
          segmentsByAbbreviationOrLabel.get(segment)?.value ||
          segmentsByValue.get(segment)?.value ||
          "";

        // There is no way to gracefully recover here :(
        if (!dvIri) {
          console.warn(`Can't find color for '${segment}'.`);
        }

        return {
          label: segment,
          color: fields.segment?.colorMapping![dvIri] || "#006699",
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
      colors.unknown(() => undefined);
    } else {
      colors.domain(segments);
      colors.range(getPalette(fields.segment?.palette));
      colors.unknown(() => undefined);
    }

    // x
    const bandDomain = [...new Set(scalesData.map(getX))];
    const bandDomainLabels = bandDomain.map(getXLabel);
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
    const minTotal = min<$FixMe, number>(scalesWideData, (d) =>
      segments
        .map((s) => d[s])
        .filter((d) => d < 0)
        .reduce((a, b) => a + b, 0)
    );
    const maxTotal = max<$FixMe, number>(scalesWideData, (d) =>
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
      bandDomainLabels,
    };
  }, [
    scalesWideData,
    fields.segment,
    getX,
    getXLabel,
    getXAsDate,
    plottableSortedData,
    scalesData,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    segments,
  ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

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
    bandDomainLabels
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
        xValue: getXAbbreviationOrLabel(datum),
        datum: {
          label: fields.segment && getSegmentAbbreviationOrLabel(datum),
          value: yValueFormatter(getY(datum)),
          color: colors(getSegment(datum)) as string,
        },
        values: sortedTooltipValues.map((td) => ({
          label: getSegmentAbbreviationOrLabel(td),
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
      getSegmentAbbreviationOrLabel,
      getX,
      getXAbbreviationOrLabel,
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
    bounds,
    preparedData,
    allData: plottableSortedData,
    getX,
    getXLabel,
    getXAsDate,
    xScale,
    xScaleInteraction,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    getSegmentLabel,
    yAxisLabel,
    yAxisDimension: yMeasure,
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
  chartConfig,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures" | "chartConfig"> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useColumnsStackedState({
    data,
    fields,
    dimensions,
    chartConfig,
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
  chartConfig,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures" | "chartConfig"> & {
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
          chartConfig={chartConfig}
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
