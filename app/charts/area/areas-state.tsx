import {
  extent,
  group,
  rollup,
  scaleLinear,
  ScaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
  stack,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
  sum,
} from "d3";
import orderBy from "lodash/orderBy";
import React, { useCallback, useMemo } from "react";

import {
  AreasStateVariables,
  useAreasStateData,
  useAreasStateVariables,
} from "@/charts/area/areas-state-props";
import {
  getChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  getWideData,
  normalizeData,
  stackOffsetDivergingPositiveZeros,
  useGetIdentityY,
} from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  ChartStateData,
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
import { AreaConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber, useTimeFormatUnit } from "@/formatters";
import { getPalette } from "@/palettes";
import { useInteractiveFilters } from "@/stores/interactive-filters";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export type AreasState = CommonChartState &
  AreasStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "area";
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    segments: string[];
    colors: ScaleOrdinal<string, string>;
    chartWideData: ArrayLike<Observation>;
    series: $FixMe[];
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useAreasState = (
  chartProps: ChartProps<AreaConfig> & { aspectRatio: number },
  variables: AreasStateVariables,
  data: ChartStateData
): AreasState => {
  const { chartConfig, aspectRatio } = chartProps;
  const {
    xDimension,
    getX,
    getXAsString,
    yMeasure,
    getY,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
  } = variables;
  const getIdentityY = useGetIdentityY(yMeasure.iri);
  const {
    chartData,
    scalesData,
    segmentData,
    timeRangeData,
    paddingData,
    allData,
  } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const timeFormatUnit = useTimeFormatUnit();
  const calculationType = useInteractiveFilters((d) => d.calculation.type);

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  /** Ordered segments */
  const segmentSorting = fields.segment?.sorting;
  const segmentSortingType = segmentSorting?.sortingType;
  const segmentSortingOrder = segmentSorting?.sortingOrder;

  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension?.iri]
    : undefined;

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries(
      rollup(
        segmentData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      )
    );
  }, [segmentData, getY, getSegment]);

  const { allSegments, segments } = useMemo(() => {
    const allUniqueSegments = Array.from(
      new Set(segmentData.map((d) => getSegment(d)))
    );
    const uniqueSegments = Array.from(
      new Set(scalesData.map((d) => getSegment(d)))
    );
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting: segmentSorting,
      sumsBySegment,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });
    const allSegments = orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, segmentSorting)
    );

    return {
      allSegments,
      segments: allSegments.filter((d) => uniqueSegments.includes(d)),
    };
  }, [
    segmentData,
    scalesData,
    sumsBySegment,
    segmentDimension,
    segmentSorting,
    segmentFilter,
    getSegment,
    fields.segment?.useAbbreviations,
  ]);

  const xKey = fields.x.componentIri;
  const sumsByX = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getXAsString(x)
      )
    );
  }, [chartData, getXAsString, getY]);

  const normalize = calculationType === "percent";
  const chartDataGroupedByX = useMemo(() => {
    if (normalize) {
      return group(
        normalizeData(chartData, {
          yKey: yMeasure.iri,
          getY,
          getTotalGroupValue: (d) => {
            return sumsByX[getXAsString(d)];
          },
        }),
        getXAsString
      );
    }

    return group(chartData, getXAsString);
  }, [chartData, getXAsString, sumsByX, getY, yMeasure.iri, normalize]);

  const chartWideData = React.useMemo(() => {
    return getWideData({
      dataGroupedByX: chartDataGroupedByX,
      xKey,
      getY,
      getSegment,
      allSegments: segments,
      imputationType: fields.y.imputationType,
    });
  }, [
    getSegment,
    getY,
    chartDataGroupedByX,
    segments,
    xKey,
    fields.y.imputationType,
  ]);

  /** Transform data  */
  const series = useMemo(() => {
    const stackOrder =
      segmentSortingType === "byTotalSize" && segmentSortingOrder === "asc"
        ? stackOrderAscending
        : segmentSortingType === "byTotalSize" && segmentSortingOrder === "desc"
        ? stackOrderDescending
        : stackOrderReverse;
    const stacked = stack()
      .order(stackOrder)
      .offset(stackOffsetDivergingPositiveZeros)
      .keys(segments);

    return stacked(chartWideData as { [key: string]: number }[]);
  }, [chartWideData, segmentSortingOrder, segmentSortingType, segments]);

  /** Scales */
  const { colors, xScale, interactiveXTimeRangeScale } = useMemo(() => {
    const xDomain = extent(scalesData, (d) => getX(d)) as [Date, Date];
    const xScale = scaleTime().domain(xDomain);
    const interactiveXTimeRangeDomain = extent(timeRangeData, (d) =>
      getX(d)
    ) as [Date, Date];
    const interactiveXTimeRangeScale = scaleTime().domain(
      interactiveXTimeRangeDomain
    );
    const colors = scaleOrdinal<string, string>();

    if (segmentDimension && fields.segment?.colorMapping) {
      const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
        const dvIri =
          segmentsByAbbreviationOrLabel.get(segment)?.value ??
          segmentsByValue.get(segment)?.value ??
          "";

        return {
          label: segment,
          color: fields.segment?.colorMapping![dvIri] ?? "#006699",
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
    } else {
      colors.domain(allSegments);
      colors.range(getPalette(fields.segment?.palette));
    }

    colors.unknown(() => undefined);

    return {
      colors,
      xScale,
      interactiveXTimeRangeScale,
    };
  }, [
    fields.segment?.palette,
    fields.segment?.colorMapping,
    getX,
    scalesData,
    timeRangeData,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    allSegments,
    segmentDimension,
  ]);

  const yScale = useMemo(() => {
    return getStackedYScale(scalesData, {
      normalize,
      getX: getXAsString,
      getY,
    });
  }, [scalesData, normalize, getXAsString, getY]);

  const paddingYScale = useMemo(() => {
    //  When the user can toggle between absolute and relative values, we use the
    // absolute values to calculate the yScale domain, so that the yScale doesn't
    // change when the user toggles between absolute and relative values.
    if (interactiveFiltersConfig?.calculation.active) {
      const scale = getStackedYScale(paddingData, {
        normalize: false,
        getX: getXAsString,
        getY,
      });

      if (scale.domain()[1] < 100 && scale.domain()[0] > -100) {
        return scaleLinear().domain([0, 100]);
      }

      return scale;
    }

    return getStackedYScale(paddingData, {
      normalize,
      getX: getXAsString,
      getY,
    });
  }, [
    paddingData,
    getXAsString,
    getY,
    interactiveFiltersConfig?.calculation.active,
    normalize,
  ]);

  /** Dimensions */
  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    normalize,
  });
  const margins = {
    top: 50,
    right: 40,
    bottom,
    left,
  };
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;

  /** Adjust scales according to dimensions */
  xScale.range([0, chartWidth]);
  interactiveXTimeRangeScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  /** Tooltip */
  const getAnnotationInfo = useCallback(
    (datum: Observation): TooltipInfo => {
      const x = getXAsString(datum);
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
      const xAnchor = xScale(getX(datum));
      const yAnchor = normalize
        ? yScale.range()[0] * 0.5
        : yScale(sum(yValues) * (fields.segment ? 0.5 : 1));

      return {
        xAnchor,
        yAnchor,
        placement: getCenteredTooltipPlacement({
          chartWidth,
          xAnchor,
          segment: !!fields.segment,
        }),
        xValue: timeFormatUnit(getX(datum), xDimension.timeUnit),
        datum: {
          label: fields.segment && getSegmentAbbreviationOrLabel(datum),
          value: yValueFormatter(getY(datum), getIdentityY(datum)),
          color: colors(getSegment(datum)) as string,
        },
        values: fields.segment
          ? sortedTooltipValues.map((td) => ({
              label: getSegmentAbbreviationOrLabel(td),
              value: yValueFormatter(getY(td), getIdentityY(td)),
              color: colors(getSegment(td)) as string,
            }))
          : undefined,
      };
    },
    [
      yScale,
      colors,
      fields.segment,
      formatNumber,
      formatters,
      getSegment,
      getSegmentAbbreviationOrLabel,
      getX,
      getXAsString,
      getY,
      chartDataGroupedByX,
      segments,
      timeFormatUnit,
      xDimension.timeUnit,
      xScale,
      yMeasure.iri,
      yMeasure.unit,
      normalize,
      getIdentityY,
      chartWidth,
    ]
  );

  return {
    chartType: "area",
    bounds,
    chartData,
    allData,
    xScale,
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

const AreaChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<AreaConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useAreasStateVariables(chartProps);
  const data = useAreasStateData(chartProps, variables);
  const state = useAreasState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const AreaChart = (
  props: React.PropsWithChildren<
    ChartProps<AreaConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <AreaChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
