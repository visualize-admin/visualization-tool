import {
  extent,
  group,
  rollup,
  scaleBand,
  ScaleBand,
  scaleLinear,
  ScaleLinear,
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
import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
import {
  getChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  getWideData,
  normalizeData,
  useGetIdentityY,
} from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  CommonChartState,
  InteractiveXTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { getCenteredTooltipPlacement } from "@/charts/shared/interaction/tooltip-box";
import {
  getStackedTooltipValueFormatter,
  getStackedYScale,
} from "@/charts/shared/stacked-helpers";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import { useInteractiveFiltersStore } from "@/stores/interactive-filters";
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
  const getIdentityY = useGetIdentityY(yMeasure.iri);
  const { chartData, scalesData, segmentData, timeRangeData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const calculationType = useInteractiveFiltersStore((d) => d.calculation.type);

  const xKey = fields.x.componentIri;

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries(
      rollup(
        scalesData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      )
    );
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
    return Object.fromEntries(
      rollup(
        scalesData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getX(x)
      )
    );
  }, [getX, getY, scalesData]);

  const normalize = calculationType === "percent";
  const chartDataGroupedByX = useMemo(() => {
    if (normalize) {
      return group(
        normalizeData(chartData, {
          yKey: yMeasure.iri,
          getY,
          getTotalGroupValue: (d) => sumsByX[getX(d)],
        }),
        getX
      );
    }

    return group(chartData, getX);
  }, [chartData, getX, sumsByX, getY, yMeasure.iri, normalize]);

  const chartWideData = React.useMemo(() => {
    return getWideData({
      dataGroupedByX: chartDataGroupedByX,
      xKey,
      getY,
      getSegment,
      allSegments: segments,
      imputationType: "zeros",
    });
  }, [getSegment, getY, chartDataGroupedByX, segments, xKey]);

  const xFilter = chartConfig.filters[xDimension.iri];
  // Map ordered segments labels to colors
  const {
    colors,
    xScale,
    xScaleInteraction,
    interactiveXTimeRangeScale,
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
    } else {
      colors.domain(allSegments);
      colors.range(getPalette(fields.segment?.palette));
    }

    colors.unknown(() => undefined);

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

    return {
      colors,
      xScale,
      interactiveXTimeRangeScale,
      xScaleInteraction,
      xDomainLabels,
    };
  }, [
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

  const yScale = useMemo(() => {
    return getStackedYScale(scalesData, { normalize, getX, getY });
  }, [scalesData, normalize, getX, getY]);

  const allYScale = useMemo(() => {
    //  When the user can toggle between absolute and relative values, we use the
    // absolute values to calculate the yScale domain, so that the yScale doesn't
    // change when the user toggles between absolute and relative values.
    if (interactiveFiltersConfig?.calculation.active) {
      const scale = getStackedYScale(allData, { normalize: false, getX, getY });

      if (scale.domain()[1] < 100 && scale.domain()[0] > -100) {
        return scaleLinear().domain([0, 100]);
      }

      return scale;
    }

    return getStackedYScale(allData, { normalize, getX, getY });
  }, [
    allData,
    getX,
    getY,
    interactiveFiltersConfig?.calculation.active,
    normalize,
  ]);

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

    return stacked(
      chartWideData as {
        [key: string]: number;
      }[]
    );
  }, [chartWideData, fields.segment?.sorting, segments]);

  /** Chart dimensions */
  const { left, bottom } = useChartPadding(
    allYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    xDomainLabels,
    normalize
  );
  const margins = {
    top: 50,
    right: 40,
    bottom,
    left,
  };
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  interactiveXTimeRangeScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // Tooltips
  const getAnnotationInfo = useCallback(
    (datum: Observation): TooltipInfo => {
      const bw = xScale.bandwidth();
      const x = getX(datum);

      const tooltipValues = chartDataGroupedByX.get(x) as Observation[];
      const yValues = tooltipValues.map(getY);
      const sortedTooltipValues = sortByIndex({
        data: tooltipValues,
        order: segments,
        getCategory: getSegment,
        sortingOrder: "asc",
      });
      const yValueFormatter = getStackedTooltipValueFormatter({
        normalize,
        yMeasureIri: yMeasure.iri,
        yMeasureUnit: yMeasure.unit,
        formatters,
        formatNumber,
      });

      const xAnchorRaw = (xScale(x) as number) + bw * 0.5;
      const yAnchor = yScale(sum(yValues.map((d) => Math.abs(d ?? 0))) * 0.5);
      const placement = getCenteredTooltipPlacement({
        chartWidth,
        xAnchor: xAnchorRaw,
        segment: !!fields.segment,
      });

      return {
        xAnchor: xAnchorRaw + (placement.x === "right" ? 0.5 : -0.5) * bw,
        yAnchor,
        placement,
        xValue: getXAbbreviationOrLabel(datum),
        datum: {
          label: fields.segment && getSegmentAbbreviationOrLabel(datum),
          value: yValueFormatter(getY(datum), getIdentityY(datum)),
          color: colors(getSegment(datum)) as string,
        },
        values: sortedTooltipValues.map((td) => ({
          label: getSegmentAbbreviationOrLabel(td),
          value: yValueFormatter(getY(td), getIdentityY(td)),
          color: colors(getSegment(td)) as string,
        })),
      };
    },
    [
      getX,
      xScale,
      chartDataGroupedByX,
      segments,
      getSegment,
      yMeasure.iri,
      yMeasure.unit,
      formatters,
      formatNumber,
      getXAbbreviationOrLabel,
      fields.segment,
      getSegmentAbbreviationOrLabel,
      getY,
      getIdentityY,
      colors,
      chartWidth,
      normalize,
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
