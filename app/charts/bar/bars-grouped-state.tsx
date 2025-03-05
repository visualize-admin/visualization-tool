import { extent, group, max, rollup, sum } from "d3-array";
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
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  BarsGroupedStateVariables,
  useBarsGroupedStateData,
  useBarsGroupedStateVariables,
} from "@/charts/bar/bars-grouped-state-props";
import {
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN,
} from "@/charts/bar/constants";
import {
  AxisLabelSizeVariables,
  getChartWidth,
  useAxisLabelSizeVariables,
  useChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveYTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import {
  getCenteredTooltipPlacement,
  MOBILE_TOOLTIP_PLACEMENT,
} from "@/charts/shared/interaction/tooltip-box";
import { DEFAULT_MARGIN_TOP } from "@/charts/shared/margins";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { BarConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

export type GroupedBarsState = CommonChartState &
  BarsGroupedStateVariables &
  InteractiveYTimeRangeState & {
    chartType: "bar";
    yScale: ScaleBand<string>;
    yScaleInteraction: ScaleBand<string>;
    yScaleIn: ScaleBand<string>;
    xScale: ScaleLinear<number, number>;
    segments: string[];
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    grouped: [string, Observation[]][];
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    bottomAxisLabelSize: AxisLabelSizeVariables;
  };

const useBarsGroupedState = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsGroupedStateVariables,
  data: ChartStateData
): GroupedBarsState => {
  const { chartConfig } = chartProps;
  const {
    yDimension,
    getX,
    getYAsDate,
    getYAbbreviationOrLabel,
    getYLabel,
    xMeasure,
    getY,
    getMinX,
    getXErrorRange,
    getFormattedXUncertainty,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
  } = variables;
  const {
    chartData,
    scalesData,
    segmentData,
    timeRangeData,
    paddingData,
    allData,
  } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  // segments
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries(
      rollup(
        segmentData,
        (v) => sum(v, (y) => getX(y)),
        (y) => getSegment(y)
      )
    );
  }, [segmentData, getX, getSegment]);

  const segmentFilter = segmentDimension?.id
    ? chartConfig.cubes.find((d) => d.iri === segmentDimension.cubeIri)
        ?.filters[segmentDimension.id]
    : undefined;
  const { allSegments, segments } = useMemo(() => {
    const allUniqueSegments = Array.from(
      new Set(segmentData.map((d) => getSegment(d)))
    );
    const uniqueSegments = Array.from(
      new Set(scalesData.map((d) => getSegment(d)))
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

  /* Scales */
  const yFilter = chartConfig.cubes.find((d) => d.iri === yDimension.cubeIri)
    ?.filters[yDimension.id];
  const sumsByY = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (d) => getX(d)),
        (y) => getY(y)
      )
    );
  }, [chartData, getX, getY]);

  const {
    yTimeRangeDomainLabels,
    colors,
    xScale,
    paddingYScale,
    yScaleTimeRange,
    yScale,
    yScaleIn,
    yScaleInteraction,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (fields.segment && segmentDimension && fields.color) {
      const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
        const dvIri =
          segmentsByAbbreviationOrLabel.get(segment)?.value ||
          segmentsByValue.get(segment)?.value ||
          "";

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
    const yScaleIn = scaleBand().domain(segments).padding(PADDING_WITHIN);

    const yScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getYAsDate(d)
    ) as [Date, Date];
    const yScaleTimeRange = scaleTime().domain(yScaleTimeRangeDomain);

    // x
    const minValue = getMinX(scalesData, (d) =>
      getXErrorRange ? getXErrorRange(d)[0] : getX(d)
    );
    const maxValue = Math.max(
      max(scalesData, (d) =>
        getXErrorRange ? getXErrorRange(d)[1] : getX(d)
      ) ?? 0,
      0
    );
    const xScale = scaleLinear().domain([minValue, maxValue]).nice();

    const minPaddingValue = getMinX(paddingData, (d) =>
      getXErrorRange ? getXErrorRange(d)[0] : getX(d)
    );
    const maxPaddingValue = Math.max(
      max(paddingData, (d) =>
        getXErrorRange ? getXErrorRange(d)[1] : getX(d)
      ) ?? 0,
      0
    );
    const paddingYScale = scaleLinear()
      .domain([minPaddingValue, maxPaddingValue])
      .nice();

    return {
      colors,
      xScale,
      paddingYScale,
      yScaleTimeRange,
      yScale,
      yScaleIn,
      yScaleInteraction,
      yTimeRangeDomainLabels,
    };
  }, [
    fields.color,
    fields.segment,
    fields.y?.sorting,
    fields.y?.useAbbreviations,
    segmentDimension,
    scalesData,
    getY,
    yDimension,
    sumsByY,
    yFilter,
    getYLabel,
    segments,
    timeRangeData,
    paddingData,
    allSegments,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    getYAsDate,
    getXErrorRange,
    getX,
    getMinX,
  ]);

  // Group
  const grouped: [string, Observation[]][] = useMemo(() => {
    const yKeys = yScale.domain();
    const groupedMap = group(chartData, getY);
    const grouped: [string, Observation[]][] =
      groupedMap.size < yKeys.length
        ? yKeys.map((d) => {
            if (groupedMap.has(d)) {
              return [d, groupedMap.get(d) as Observation[]];
            } else {
              return [d, []];
            }
          })
        : [...groupedMap];

    return grouped.map(([key, data]) => {
      return [
        key,
        sortByIndex({
          data,
          order: segments,
          getCategory: getSegment,
          sortingOrder: segmentSortingOrder,
        }),
      ];
    });
  }, [getSegment, getY, chartData, segmentSortingOrder, segments, yScale]);

  const { left, bottom } = useChartPadding({
    xLabelPresent: !!xMeasure.label,
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent: !!fields.animation,
    formatNumber,
    bandDomain: yTimeRangeDomainLabels.every((d) => d === undefined)
      ? yScale.domain()
      : yTimeRangeDomainLabels,
    isFlipped: true,
  });
  const right = 40;
  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yDimension.label,
    width,
    marginLeft: left,
    marginRight: right,
  });
  const bottomAxisLabelSize = useAxisLabelSizeVariables({
    label: xMeasure.label,
    width,
    marginLeft: left,
    marginRight: right,
  });
  const margins = {
    top: DEFAULT_MARGIN_TOP + leftAxisLabelSize.offset,
    right,
    bottom: bottom + 10,
    left,
  };
  const chartWidth = getChartWidth({ width, left, right });
  const bounds = useChartBounds({ width, chartWidth, height, margins });
  const { chartHeight } = bounds;

  // Adjust of scales based on chart dimensions
  yScale.range([0, chartHeight]);
  yScaleInteraction.range([0, chartHeight]);
  yScaleIn.range([0, yScale.bandwidth()]);
  yScaleTimeRange.range([0, chartHeight]);
  xScale.range([0, chartWidth]);

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const bw = yScale.bandwidth();
    const y = getY(datum);

    const tooltipValues = chartData.filter((d) => getY(d) === y);
    const xValues = tooltipValues.map(getX);
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      // Always ascending to match visual order of colors of the stack
      sortingOrder: "asc",
    });
    const xValueFormatter = (value: number | null) => {
      return formatNumberWithUnit(
        value,
        formatters[xMeasure.id] ?? formatNumber,
        xMeasure.unit
      );
    };

    const yAnchorRaw = (yScale(y) as number) + bw * 0.5;
    const [xMin, xMax] = extent(xValues, (d) => d ?? 0) as [number, number];
    const xAnchor = isMobile ? chartHeight : xScale(xMin + xMax);
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor,
          topAnchor: !fields.segment,
        });

    return {
      yAnchor: yAnchorRaw + (placement.y === "bottom" ? 0.5 : -0.5) * bw,
      xAnchor,
      placement,
      value: getYAbbreviationOrLabel(datum),
      datum: {
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: xValueFormatter(getX(datum)),
        error: getFormattedXUncertainty(datum),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        label: getSegmentAbbreviationOrLabel(td),
        value: xMeasure.unit
          ? `${formatNumber(getX(td))} ${xMeasure.unit}`
          : formatNumber(getX(td)),
        error: getFormattedXUncertainty(td),
        color: colors(getSegment(td)) as string,
      })),
    };
  };

  return {
    chartType: "bar",
    bounds,
    chartData,
    allData,
    yScale,
    yScaleInteraction,
    yScaleIn,
    yScaleTimeRange,
    xScale,
    segments,
    colors,
    getColorLabel: getSegmentLabel,
    grouped,
    getAnnotationInfo,
    leftAxisLabelSize,
    bottomAxisLabelSize,
    ...variables,
  };
};

const GroupedBarChartProvider = (
  props: React.PropsWithChildren<ChartProps<BarConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useBarsGroupedStateVariables(chartProps);
  const data = useBarsGroupedStateData(chartProps, variables);
  const state = useBarsGroupedState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedBarChart = (
  props: React.PropsWithChildren<ChartProps<BarConfig>>
) => {
  return (
    <InteractionProvider>
      <GroupedBarChartProvider {...props} />
    </InteractionProvider>
  );
};
