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
import { useCallback, useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
import {
  getMaybeAbbreviations,
  useMaybeAbbreviations,
} from "@/charts/shared/abbreviations";
import {
  getLabelWithUnit,
  getMaybeTemporalDimensionValues,
  getWideData,
  useDataAfterInteractiveFilters,
  useOptionalNumericVariable,
  usePlottableData,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import {
  ChartStateMetadata,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import {
  getObservationLabels,
  useObservationLabels,
} from "@/charts/shared/observation-labels";
import { useChartPadding } from "@/charts/shared/padding";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnConfig } from "@/configurator";
import { isTemporalDimension, Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

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
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
): StackedColumnsState => {
  const { data, measures, dimensions, chartConfig, aspectRatio } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });

  const xKey = fields.x.componentIri;

  const xDimension = dimensions.find((d) => d.iri === xKey);

  if (!xDimension) {
    throw Error(`No dimension <${xKey}> in cube!`);
  }

  const xIsTime = isTemporalDimension(xDimension);
  const xDimensionValues = useMemo(() => {
    return getMaybeTemporalDimensionValues(xDimension, data);
  }, [xDimension, data]);

  const { getAbbreviationOrLabelByValue: getXAbbreviationOrLabel } =
    useMaybeAbbreviations({
      useAbbreviations: fields.x.useAbbreviations,
      dimensionIri: xDimension.iri,
      dimensionValues: xDimensionValues,
    });

  const { getValue: getX, getLabel: getXLabel } = useObservationLabels(
    data,
    getXAbbreviationOrLabel,
    fields.x.componentIri
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
    dimensionIri: segmentDimension?.iri,
    dimensionValues: segmentDimension?.values,
  });

  const { getValue: getSegment, getLabel: getSegmentLabel } =
    useObservationLabels(
      data,
      getSegmentAbbreviationOrLabel,
      fields.segment?.componentIri
    );

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

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

  const plottableData = usePlottableData({
    data,
    plotters: [getXAsDate, getY],
  });

  // Data for chart
  const { preparedData, scalesData } = useDataAfterInteractiveFilters({
    observations: plottableData,
    interactiveFiltersConfig,
    animationField: fields.animation,
    getX: getXAsDate,
    getSegment: getSegmentAbbreviationOrLabel,
  });

  const preparedDataGroupedByX = useMemo(
    () => group(preparedData, getX),
    [preparedData, getX]
  );

  const sumsBySegment = useMemo(
    () =>
      Object.fromEntries([
        ...rollup(
          plottableData,
          (v) => sum(v, (x) => getY(x)),
          (x) => getSegment(x)
        ),
      ]),
    [getSegment, getY, plottableData]
  );

  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension?.iri]
    : undefined;
  const { segments, plottableSegments } = useMemo(() => {
    const allUniqueSegments = Array.from(
      new Set(plottableData.map(getSegment))
    );
    const allPlottableSegments = Array.from(
      new Set(preparedData.map(getSegment))
    );

    const sorting = fields?.segment?.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      sumsBySegment,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });

    const allSegments = orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, sorting)
    );

    return {
      segments: allSegments,
      plottableSegments: allSegments.filter((d) =>
        allPlottableSegments.includes(d)
      ),
    };
  }, [
    plottableData,
    preparedData,
    segmentDimension,
    fields.segment?.sorting,
    fields.segment?.useAbbreviations,
    sumsBySegment,
    segmentFilter,
    getSegment,
  ]);

  const chartWideData = getWideData({
    dataGroupedByX: preparedDataGroupedByX,
    xKey,
    getY,
    getSegment,
    allSegments: plottableSegments,
    imputationType: "zeros",
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

  // Scales
  const xFilter = chartConfig.filters[xDimension.iri];
  const sumsByX = useMemo(
    () =>
      Object.fromEntries([
        ...rollup(
          plottableData,
          (v) => sum(v, (x) => getY(x)),
          (x) => getX(x)
        ),
      ]),
    [plottableData, getX, getY]
  );
  // Map ordered segments labels to colors
  const {
    colors,
    xScale,
    xScaleInteraction,
    xEntireScale,
    yStackDomain,
    xDomainLabels,
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

    const xValues = [...new Set(scalesData.map(getX))];
    const xSorting = fields.x?.sorting;
    const xSorters = makeDimensionValueSorters(xDimension, {
      sorting: xSorting,
      useAbbreviations: fields.x?.useAbbreviations,
      measureBySegment: sumsByX,
      dimensionFilter: xFilter,
    });
    const xDomain = orderBy(
      xValues,
      xSorters,
      getSortingOrders(xSorters, xSorting)
    );
    const xDomainLabels = xDomain.map(getXLabel);
    const xScale = scaleBand()
      .domain(xDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(xDomain)
      .paddingInner(0)
      .paddingOuter(0);

    // x as time, needs to be memoized!
    const xEntireDomainAsTime = extent(plottableData, (d) => getXAsDate(d)) as [
      Date,
      Date
    ];
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
      xDomainLabels,
    };
  }, [
    scalesWideData,
    fields.segment,
    fields.x.sorting,
    fields.x.useAbbreviations,
    xDimension,
    xFilter,
    sumsByX,
    getX,
    getXLabel,
    getXAsDate,
    plottableData,
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
      .keys(plottableSegments);

    const series = stacked(
      chartWideData as {
        [key: string]: number;
      }[]
    );
    return series;
  }, [chartWideData, fields.segment?.sorting, plottableSegments]);

  /** Chart dimensions */
  const { left, bottom } = useChartPadding(
    yScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    xDomainLabels
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

  const formatters = useChartFormatters(props);

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
        sortingOrder: "asc",
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
    allData: plottableData,
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

export const getColumnsStackedStateMetadata = (
  chartConfig: ColumnConfig,
  observations: Observation[],
  dimensions: DimensionMetadataFragment[]
): ChartStateMetadata => {
  const { fields } = chartConfig;

  const xKey = fields.x.componentIri;

  const xDimension = dimensions.find((d) => d.iri === xKey);

  if (!xDimension) {
    throw Error(`No dimension <${xKey}> in cube!`);
  }

  const xDimensionValues = getMaybeTemporalDimensionValues(
    xDimension,
    observations
  );

  const { getAbbreviationOrLabelByValue: getXAbbreviationOrLabel } =
    getMaybeAbbreviations({
      useAbbreviations: fields.x.useAbbreviations,
      dimensionIri: xDimension.iri,
      dimensionValues: xDimensionValues,
    });

  const { getValue: getX } = getObservationLabels(
    observations,
    getXAbbreviationOrLabel,
    fields.x.componentIri
  );

  const y = fields.y.componentIri;
  const getY = (d: Observation) => {
    return d[y] !== null ? Number(d[y]) : null;
  };

  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  );

  const { getAbbreviationOrLabelByValue: getSegmentAbbreviationOrLabel } =
    getMaybeAbbreviations({
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionIri: segmentDimension?.iri,
      dimensionValues: segmentDimension?.values,
    });

  const { getValue: getSegment } = getObservationLabels(
    observations,
    getSegmentAbbreviationOrLabel,
    fields.segment?.componentIri
  );

  const allDataGroupedByX = group(observations, getX);
  const allDataWide = getWideData({
    dataGroupedByX: allDataGroupedByX,
    xKey,
    getY,
    getSegment,
  });

  const xOrder = allDataWide
    .sort((a, b) => ascending(a.total ?? undefined, b.total ?? undefined))
    .map((d) => getX(d));

  const { sortingOrder, sortingType } = fields.x.sorting ?? {};

  return {
    sortData: (data) => {
      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => descending(getX(a), getX(b)));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => ascending(getX(a), getX(b)));
      } else if (sortingType === "byMeasure") {
        return sortByIndex({
          data,
          order: xOrder,
          getCategory: getX,
          sortingOrder,
        });
      } else {
        return [...data].sort((a, b) => ascending(getX(a), getX(b)));
      }
    },
  };
};

const StackedColumnsChartProvider = ({
  chartConfig,
  data,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<ColumnConfig> & { aspectRatio: number }
>) => {
  const state = useColumnsStackedState({
    chartConfig,
    data,
    dimensions,
    measures,
    aspectRatio,
  });

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const StackedColumnsChart = ({
  chartConfig,
  data,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<ColumnConfig> & { aspectRatio: number }
>) => {
  return (
    <Observer>
      <InteractionProvider>
        <StackedColumnsChartProvider
          chartConfig={chartConfig}
          data={data}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </StackedColumnsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
