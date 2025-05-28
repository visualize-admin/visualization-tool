import { extent, group, rollup, sum } from "d3-array";
import {
  ScaleBand,
  scaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
} from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import {
  Series,
  stack,
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
} from "d3-shape";
import orderBy from "lodash/orderBy";
import { PropsWithChildren, useCallback, useMemo } from "react";

import {
  BarsStackedStateData,
  BarsStackedStateVariables,
  useBarsStackedStateData,
  useBarsStackedStateVariables,
} from "@/charts/bar/bars-stacked-state-props";
import {
  MIN_BAR_HEIGHT,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/bar/constants";
import {
  AxisLabelSizeVariables,
  getChartWidth,
  useAxisLabelSizeVariables,
  useChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  getWideData,
  normalizeData,
  useGetIdentityX,
} from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  CommonChartState,
  InteractiveYTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import {
  getCenteredTooltipPlacement,
  MOBILE_TOOLTIP_PLACEMENT,
} from "@/charts/shared/interaction/tooltip-box";
import { DEFAULT_MARGIN_TOP } from "@/charts/shared/margins";
import {
  useValueLabelFormatter,
  ValueLabelFormatter,
} from "@/charts/shared/show-values-utils";
import {
  getStackedTooltipValueFormatter,
  getStackedXScale,
} from "@/charts/shared/stacked-helpers";
import { useChartFormatters } from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { BarConfig } from "@/configurator";
import { isTemporalDimension, Observation } from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/chart-props";

export type StackedBarsState = CommonChartState &
  BarsStackedStateVariables &
  InteractiveYTimeRangeState & {
    chartType: "bar";
    yScale: ScaleBand<string>;
    yScaleInteraction: ScaleBand<string>;
    xScale: ScaleLinear<number, number>;
    segments: string[];
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    chartWideData: ArrayLike<Observation>;
    series: Series<{ [key: string]: number }, string>[];
    getAnnotationInfo: (
      d: Observation,
      orderedSegments: string[]
    ) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    leftAxisLabelOffsetTop: number;
    bottomAxisLabelSize: AxisLabelSizeVariables;
    valueLabelFormatter: ValueLabelFormatter;
    formatYAxisTick?: (tick: string) => string;
  };

const useBarsStackedState = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsStackedStateVariables,
  data: BarsStackedStateData
): StackedBarsState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const {
    yDimension,
    xMeasure,
    getX,
    getYAsDate,
    getYAbbreviationOrLabel,
    getYLabel,
    getY,
    formatYDate,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
    xAxisLabel,
    yAxisLabel,
  } = variables;
  const getIdentityX = useGetIdentityX(xMeasure.id);
  const {
    chartData,
    scalesData,
    segmentData,
    timeRangeData,
    paddingData,
    allData,
  } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x } = fields;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const calculationType = useChartInteractiveFilters((d) => d.calculation.type);

  const yKey = fields.y.componentId;

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries(
      rollup(
        scalesData,
        (v) => sum(v, (x) => getX(x)),
        (x) => getSegment(x)
      )
    );
  }, [getSegment, getX, scalesData]);

  const segmentFilter = segmentDimension?.id
    ? chartConfig.cubes.find((d) => d.iri === segmentDimension.cubeIri)
        ?.filters[segmentDimension.id]
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

  const sumsByY = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (d) => getX(d)),
        (x) => getY(x)
      )
    );
  }, [chartData, getX, getY]);

  const normalize = calculationType === "percent";
  const chartDataGroupedByY = useMemo(() => {
    if (normalize) {
      return group(
        normalizeData(chartData, {
          key: xMeasure.id,
          getAxisValue: getX,
          getTotalGroupValue: (d) => sumsByY[getY(d)],
        }),
        getY
      );
    }

    return group(chartData, getY);
  }, [normalize, chartData, getY, xMeasure.id, getX, sumsByY]);

  const chartWideData = useMemo(() => {
    return getWideData({
      dataGrouped: chartDataGroupedByY,
      key: yKey,
      getAxisValue: getX,
      getSegment,
      allSegments: segments,
      imputationType: "zeros",
    });
  }, [getSegment, getX, chartDataGroupedByY, segments, yKey]);

  const yFilter = chartConfig.cubes.find((d) => d.iri === yDimension.cubeIri)
    ?.filters[yDimension.id];

  // Map ordered segments labels to colors
  const {
    colors,
    yScale,
    yTimeRangeDomainLabels,
    yScaleInteraction,
    yScaleTimeRange,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (fields.segment && segmentsByAbbreviationOrLabel && fields.color) {
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
          color:
            fields.color.type === "segment"
              ? (fields.color.colorMapping![dvIri] ?? schemeCategory10[0])
              : schemeCategory10[0],
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
    } else {
      colors.domain(allSegments);
      colors.range(
        getPalette({
          paletteId: fields.color.paletteId,
          colorField: fields.color,
        })
      );
    }

    colors.unknown(() => undefined);

    const yValues = [...new Set(scalesData.map(getY))];
    const yTimeRangeValues = [...new Set(timeRangeData.map(getY))];
    const ySorting = fields.y?.sorting;
    const ySorters = makeDimensionValueSorters(yDimension, {
      sorting: ySorting,
      useAbbreviations: fields.y?.useAbbreviations,
      measureBySegment: sumsByY,
      dimensionFilter: yFilter,
    });
    const yDomain = orderBy(
      yValues,
      ySorters,
      getSortingOrders(ySorters, ySorting)
    );
    const yTimeRangeDomainLabels = yTimeRangeValues.map(getYLabel);
    const yScale = scaleBand()
      .domain(yDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const yScaleInteraction = scaleBand()
      .domain(yDomain)
      .paddingInner(0)
      .paddingOuter(0);

    const yScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getYAsDate(d)
    ) as [Date, Date];
    const yScaleTimeRange = scaleTime().domain(yScaleTimeRangeDomain);

    return {
      colors,
      yScale,
      yTimeRangeDomainLabels,
      yScaleTimeRange,
      yScaleInteraction,
    };
  }, [
    fields.color,
    fields.segment,
    fields.y.sorting,
    fields.y.useAbbreviations,
    yDimension,
    yFilter,
    sumsByY,
    getY,
    getYLabel,
    getYAsDate,
    scalesData,
    timeRangeData,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    allSegments,
  ]);

  const animationIri = fields.animation?.componentId;
  const getAnimation = useCallback(
    (d: Observation) => {
      return animationIri ? (d[animationIri] as string) : "";
    },
    [animationIri]
  );

  const xScale = useMemo(() => {
    return getStackedXScale(scalesData, {
      normalize,
      getY,
      getX,
      getTime: getAnimation,
      customDomain: x.customDomain,
    });
  }, [scalesData, normalize, getX, getY, getAnimation, x.customDomain]);

  const paddingXScale = useMemo(() => {
    //  When the user can toggle between absolute and relative values, we use the
    // absolute values to calculate the xScale domain, so that the xScale doesn't
    // change when the user toggles between absolute and relative values.
    if (interactiveFiltersConfig?.calculation.active) {
      const scale = getStackedXScale(paddingData, {
        normalize: false,
        getX,
        getY,
        getTime: getAnimation,
        customDomain: x.customDomain,
      });

      if (scale.domain()[1] < 100 && scale.domain()[0] > -100) {
        return scaleLinear().domain([0, 100]);
      }

      return scale;
    }

    return getStackedXScale(paddingData, {
      normalize,
      getX,
      getY,
      getTime: getAnimation,
      customDomain: x.customDomain,
    });
  }, [
    interactiveFiltersConfig?.calculation.active,
    paddingData,
    normalize,
    getX,
    getY,
    getAnimation,
    x.customDomain,
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
  const { top, left, bottom } = useChartPadding({
    xLabelPresent: !!xMeasure.label,
    yScale: paddingXScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain: yTimeRangeDomainLabels.every((d) => d === undefined)
      ? yScale.domain()
      : yTimeRangeDomainLabels,
    normalize,
    isFlipped: true,
  });
  const right = 40;
  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yAxisLabel,
    width,
  });
  const bottomAxisLabelSize = useAxisLabelSizeVariables({
    label: xAxisLabel,
    width,
  });
  const margins = {
    top: DEFAULT_MARGIN_TOP + top + leftAxisLabelSize.offset,
    right,
    bottom: bottom + 45,
    left,
  };

  const barCount = yScale.domain().length;

  const chartWidth = getChartWidth({ width, left, right });
  const bounds = useChartBounds({ width, chartWidth, height, margins });
  const { chartHeight } = bounds;

  // Here we adjust the height to make sure the bars have a minimum height and are legible
  const adjustedChartHeight =
    barCount * MIN_BAR_HEIGHT > chartHeight
      ? barCount * MIN_BAR_HEIGHT
      : chartHeight;

  yScale.range([0, adjustedChartHeight]);
  yScaleInteraction.range([0, adjustedChartHeight]);
  yScaleTimeRange.range([0, adjustedChartHeight]);
  xScale.range([0, chartWidth]);

  const isMobile = useIsMobile();

  const maybeFormatDate = useCallback(
    (tick: string) => {
      return isTemporalDimension(yDimension) ? formatYDate(tick) : tick;
    },
    [yDimension, formatYDate]
  );

  // Tooltips
  const getAnnotationInfo = useCallback(
    (datum: Observation): TooltipInfo => {
      const bw = yScale.bandwidth();
      const y = getY(datum);

      const tooltipValues = chartDataGroupedByY.get(y) as Observation[];
      const xValues = tooltipValues.map(getX);
      const sortedTooltipValues = sortByIndex({
        data: tooltipValues,
        order: segments,
        getCategory: getSegment,
        sortingOrder: "asc",
      });
      const xValueFormatter = getStackedTooltipValueFormatter({
        normalize,
        measureId: xMeasure.id,
        measureUnit: xMeasure.unit,
        formatters,
        formatNumber,
      });

      const yAnchorRaw = (yScale(y) as number) + bw;
      const xAnchor = isMobile
        ? chartHeight
        : xScale(sum(xValues.map((d) => d ?? 0)));
      const placement = isMobile
        ? MOBILE_TOOLTIP_PLACEMENT
        : getCenteredTooltipPlacement({
            chartWidth,
            //NOTE: this might be wrong
            xAnchor,
            topAnchor: !fields.segment,
          });
      const yLabel = getYAbbreviationOrLabel(datum);

      return {
        yAnchor: yAnchorRaw + (placement.y === "top" ? 0.5 : -0.5) * bw,
        xAnchor,
        placement,
        value: maybeFormatDate(yLabel),
        datum: {
          label: fields.segment && getSegmentAbbreviationOrLabel(datum),
          value: xValueFormatter(getX(datum), getIdentityX(datum)),
          color: colors(getSegment(datum)) as string,
        },
        values: sortedTooltipValues.map((td) => ({
          label: getSegmentAbbreviationOrLabel(td),
          value: xValueFormatter(getX(td), getIdentityX(td)),
          color: colors(getSegment(td)) as string,
        })),
      };
    },
    [
      getX,
      xScale,
      chartDataGroupedByY,
      segments,
      getSegment,
      xMeasure.id,
      xMeasure.unit,
      formatters,
      formatNumber,
      getYAbbreviationOrLabel,
      fields.segment,
      getSegmentAbbreviationOrLabel,
      getY,
      getIdentityX,
      colors,
      chartWidth,
      chartHeight,
      isMobile,
      normalize,
      yScale,
      maybeFormatDate,
    ]
  );

  const valueLabelFormatter = useValueLabelFormatter({
    measureId: xMeasure.id,
    dimensions,
    measures,
    normalize,
  });

  return {
    chartType: "bar",
    bounds: {
      ...bounds,
      chartHeight: adjustedChartHeight,
    },
    chartData,
    allData,
    xScale,
    yScaleInteraction,
    yScaleTimeRange,
    yScale,
    segments,
    colors,
    getColorLabel: getSegmentLabel,
    chartWideData,
    series,
    getAnnotationInfo,
    leftAxisLabelSize,
    leftAxisLabelOffsetTop: top,
    bottomAxisLabelSize,
    valueLabelFormatter,
    formatYAxisTick: maybeFormatDate,
    ...variables,
  };
};

const StackedBarsChartProvider = (
  props: PropsWithChildren<ChartProps<BarConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useBarsStackedStateVariables(chartProps);
  const data = useBarsStackedStateData(chartProps, variables);
  const state = useBarsStackedState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const StackedBarsChart = (
  props: PropsWithChildren<ChartProps<BarConfig>>
) => {
  return (
    <InteractionProvider>
      <StackedBarsChartProvider {...props} />
    </InteractionProvider>
  );
};
