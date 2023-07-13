import {
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
  scaleTime,
  stack,
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
  sum,
} from "d3";
import orderBy from "lodash/orderBy";
import React, { useCallback, useMemo } from "react";

import {
  ColumnsStackedStateData,
  ColumnsStackedStateVariables,
  useColumnsStackedStateData,
  useColumnsStackedStateVariables,
} from "@/charts/column/columns-stacked-state-props";
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
import { getWideData, normalizeData } from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  CommonChartState,
  InteractiveXTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export type StackedColumnsState = CommonChartState &
  ColumnsStackedStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "column";
    xScale: ScaleBand<string>;
    xScaleInteraction: ScaleBand<string>;
    yScale: ScaleLinear<number, number>;
    segments: string[];
    colors: ScaleOrdinal<string, string>;
    chartWideData: ArrayLike<Observation>;
    allDataWide: ArrayLike<Observation>;
    series: $FixMe[];
    getAnnotationInfo: (
      d: Observation,
      orderedSegments: string[]
    ) => TooltipInfo;
  };

const useColumnsStackedState = (
  chartProps: ChartProps<ColumnConfig> & { aspectRatio: number },
  variables: ColumnsStackedStateVariables,
  data: ColumnsStackedStateData
): StackedColumnsState => {
  const normalize = true;
  const { aspectRatio, chartConfig } = chartProps;
  const {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    yMeasure,
    getY,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
  } = variables;
  const {
    chartData,
    scalesData,
    segmentData,
    timeRangeData,
    allData,
    plottableDataWide,
  } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);

  const xKey = fields.x.componentIri;

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries([
      ...rollup(
        scalesData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      ),
    ]);
  }, [getSegment, getY, scalesData]);

  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension?.iri]
    : undefined;
  const { allSegments, segments } = useMemo(() => {
    const allUniqueSegments = Array.from(new Set(segmentData.map(getSegment)));
    const uniqueSegments = Array.from(new Set(scalesData.map(getSegment)));
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
      allSegments,
      segments: allSegments.filter((d) => uniqueSegments.includes(d)),
    };
  }, [
    scalesData,
    segmentData,
    segmentDimension,
    fields.segment?.sorting,
    fields.segment?.useAbbreviations,
    sumsBySegment,
    segmentFilter,
    getSegment,
  ]);

  const sumsByX = useMemo(() => {
    return Object.fromEntries([
      ...rollup(
        scalesData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getX(x)
      ),
    ]);
  }, [getX, getY, scalesData]);

  const preparedDataGroupedByX = useMemo(() => {
    if (normalize) {
      return group(
        normalizeData(chartData, {
          yKey: yMeasure.iri,
          getY,
          getTotalGroupValue: (d) => {
            return sumsByX[getX(d)];
          },
        }),
        getX
      );
    }

    return group(chartData, getX);
  }, [chartData, getX, sumsByX, getY, yMeasure.iri, normalize]);

  const chartWideData = React.useMemo(() => {
    const wideData = getWideData({
      dataGroupedByX: preparedDataGroupedByX,
      xKey,
      getY,
      getSegment,
      allSegments: segments,
      imputationType: "zeros",
    });

    return wideData;
  }, [getSegment, getY, preparedDataGroupedByX, segments, xKey]);

  const scalesDataGroupedByX = useMemo(() => {
    if (normalize) {
      return group(
        normalizeData(scalesData, {
          yKey: yMeasure.iri,
          getY,
          getTotalGroupValue: (d) => {
            return sumsByX[getX(d)];
          },
        }),
        getX
      );
    }

    return group(scalesData, getX);
  }, [normalize, scalesData, getX, yMeasure.iri, getY, sumsByX]);

  const scalesWideData = React.useMemo(() => {
    const wideData = getWideData({
      dataGroupedByX: scalesDataGroupedByX,
      xKey,
      getY,
      getSegment,
      allSegments: segments,
      imputationType: "zeros",
    });

    return wideData;
  }, [xKey, getSegment, getY, scalesDataGroupedByX, segments]);

  // Scales
  const xFilter = chartConfig.filters[xDimension.iri];
  // Map ordered segments labels to colors
  const {
    colors,
    xScale,
    xScaleInteraction,
    interactiveXTimeRangeScale,
    yStackDomain,
    xDomainLabels,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (
      fields.segment &&
      segmentsByAbbreviationOrLabel &&
      fields.segment.colorMapping
    ) {
      const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
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
      colors.domain(allSegments);
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

    const interactiveXTimeRangeDomain = extent(timeRangeData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];
    const interactiveXTimeRangeScale = scaleTime().domain(
      interactiveXTimeRangeDomain
    );

    // y
    const minTotal = min<$FixMe, number>(scalesWideData, (d) =>
      allSegments
        .map((s) => d[s])
        .filter((d) => d < 0)
        .reduce((a, b) => a + b, 0)
    );
    const maxTotal = max<$FixMe, number>(scalesWideData, (d) =>
      allSegments
        .map((s) => d[s])
        .filter((d) => d >= 0)
        .reduce((a, b) => a + b, 0)
    );
    const yStackDomain = [minTotal, maxTotal] as [number, number];

    return {
      colors,
      yStackDomain,
      xScale,
      interactiveXTimeRangeScale,
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
    scalesData,
    timeRangeData,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    allSegments,
  ]);

  const yScale = scaleLinear().domain(yStackDomain);

  // If we're showing a normalized chart, the .nice() makes the chart y axis
  // jump. As the domain is by its nature [0, 1], we can just skip the .nice(),
  // to avoid rounding issues.
  if (!normalize) {
    yScale.nice();
  }

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
  interactiveXTimeRangeScale.range([0, chartWidth]);
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
    chartData,
    allData,
    xScale,
    xScaleInteraction,
    interactiveXTimeRangeScale,
    yScale,
    segments,
    colors,
    chartWideData,
    allDataWide: plottableDataWide,
    series,
    getAnnotationInfo,
    ...variables,
  };
};

const StackedColumnsChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useColumnsStackedStateVariables(chartProps);
  const data = useColumnsStackedStateData(chartProps, variables);
  const state = useColumnsStackedState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const StackedColumnsChart = (
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <StackedColumnsChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
