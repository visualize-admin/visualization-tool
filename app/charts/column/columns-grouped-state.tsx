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
  ColumnsGroupedStateVariables,
  useColumnsGroupedStateData,
  useColumnsGroupedStateVariables,
} from "@/charts/column/columns-grouped-state-props";
import {
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN,
} from "@/charts/column/constants";
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
  InteractiveXTimeRangeState,
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
import { ColumnConfig } from "@/configurator";
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

export type GroupedColumnsState = CommonChartState &
  ColumnsGroupedStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "column";
    xScale: ScaleBand<string>;
    xScaleInteraction: ScaleBand<string>;
    xScaleIn: ScaleBand<string>;
    yScale: ScaleLinear<number, number>;
    segments: string[];
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    grouped: [string, Observation[]][];
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    leftAxisLabelOffsetTop: number;
    bottomAxisLabelSize: AxisLabelSizeVariables;
  };

const useColumnsGroupedState = (
  chartProps: ChartProps<ColumnConfig>,
  variables: ColumnsGroupedStateVariables,
  data: ChartStateData
): GroupedColumnsState => {
  const { chartConfig } = chartProps;
  const {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    yMeasure,
    getY,
    getMinY,
    getYErrorRange,
    getFormattedYUncertainty,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
    xAxisLabel,
    yAxisLabel,
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
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      )
    );
  }, [segmentData, getY, getSegment]);

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
  const xFilter = chartConfig.cubes.find((d) => d.iri === xDimension.cubeIri)
    ?.filters[xDimension.id];
  const sumsByX = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (d) => getY(d)),
        (x) => getX(x)
      )
    );
  }, [chartData, getX, getY]);

  const {
    xTimeRangeDomainLabels,
    colors,
    yScale,
    paddingYScale,
    xScaleTimeRange,
    xScale,
    xScaleIn,
    xScaleInteraction,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (
      fields.segment &&
      segmentDimension &&
      fields.color?.type === "segment"
    ) {
      const segmentColor = fields.color;
      const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
        const dvIri =
          segmentsByAbbreviationOrLabel.get(segment)?.value ||
          segmentsByValue.get(segment)?.value ||
          "";

        return {
          label: segment,
          color: segmentColor.colorMapping![dvIri] ?? schemeCategory10[0],
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
    } else {
      colors.domain(allSegments);
      colors.range(
        getPalette({
          paletteId: fields.color?.paletteId,
          colorField: fields.color,
        })
      );
    }

    colors.unknown(() => undefined);

    const xValues = [...new Set(scalesData.map(getX))];
    const xTimeRangeValues = [...new Set(timeRangeData.map(getX))];
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
    const xTimeRangeDomainLabels = xTimeRangeValues.map(getXLabel);
    const xScale = scaleBand()
      .domain(xDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(xDomain)
      .paddingInner(0)
      .paddingOuter(0);
    const xScaleIn = scaleBand().domain(segments).padding(PADDING_WITHIN);

    const xScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];
    const xScaleTimeRange = scaleTime().domain(xScaleTimeRangeDomain);

    // y
    const minValue = getMinY(scalesData, (d) =>
      getYErrorRange ? getYErrorRange(d)[0] : getY(d)
    );
    const maxValue = Math.max(
      max(scalesData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d)
      ) ?? 0,
      0
    );
    const yScale = scaleLinear().domain([minValue, maxValue]).nice();

    const minPaddingValue = getMinY(paddingData, (d) =>
      getYErrorRange ? getYErrorRange(d)[0] : getY(d)
    );
    const maxPaddingValue = Math.max(
      max(paddingData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d)
      ) ?? 0,
      0
    );
    const paddingYScale = scaleLinear()
      .domain([minPaddingValue, maxPaddingValue])
      .nice();

    return {
      colors,
      yScale,
      paddingYScale,
      xScaleTimeRange,
      xScale,
      xScaleIn,
      xScaleInteraction,
      xTimeRangeDomainLabels,
    };
  }, [
    fields.segment,
    fields.color,
    fields.x?.sorting,
    fields.x?.useAbbreviations,
    segmentDimension,
    scalesData,
    getX,
    xDimension,
    sumsByX,
    xFilter,
    getXLabel,
    segments,
    timeRangeData,
    paddingData,
    allSegments,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    getXAsDate,
    getYErrorRange,
    getY,
    getMinY,
  ]);

  // Group
  const grouped: [string, Observation[]][] = useMemo(() => {
    const xKeys = xScale.domain();
    const groupedMap = group(chartData, getX);
    const grouped: [string, Observation[]][] =
      groupedMap.size < xKeys.length
        ? xKeys.map((d) => {
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
  }, [getSegment, getX, chartData, segmentSortingOrder, segments, xScale]);

  const { top, left, bottom } = useChartPadding({
    xLabelPresent: !!xAxisLabel,
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain: xTimeRangeDomainLabels.every((d) => d === undefined)
      ? xScale.domain()
      : xTimeRangeDomainLabels,
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
    bottom,
    left,
  };
  const chartWidth = getChartWidth({ width, left, right });
  const bounds = useChartBounds({ width, chartWidth, height, margins });
  const { chartHeight } = bounds;

  // Adjust scales based on chart dimensions
  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xScaleIn.range([0, xScale.bandwidth()]);
  xScaleTimeRange.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const bw = xScale.bandwidth();
    const x = getX(datum);

    const tooltipValues = chartData.filter((d) => getX(d) === x);
    const yValues = tooltipValues.map(getY);
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      // Always ascending to match visual order of colors of the stack
      sortingOrder: "asc",
    });
    const yValueFormatter = (value: number | null) => {
      return formatNumberWithUnit(
        value,
        formatters[yMeasure.id] ?? formatNumber,
        yMeasure.unit
      );
    };

    const xAnchorRaw = (xScale(x) as number) + bw * 0.5;
    const [yMin, yMax] = extent(yValues, (d) => d ?? 0) as [number, number];
    const yAnchor = isMobile ? chartHeight : yScale((yMin + yMax) * 0.5);
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor: xAnchorRaw,
          topAnchor: !fields.segment,
        });

    return {
      xAnchor: xAnchorRaw + (placement.x === "right" ? 0.5 : -0.5) * bw,
      yAnchor,
      placement,
      value: getXAbbreviationOrLabel(datum),
      datum: {
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: yValueFormatter(getY(datum)),
        error: getFormattedYUncertainty(datum),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        label: getSegmentAbbreviationOrLabel(td),
        value: yMeasure.unit
          ? `${formatNumber(getY(td))} ${yMeasure.unit}`
          : formatNumber(getY(td)),
        error: getFormattedYUncertainty(td),
        color: colors(getSegment(td)) as string,
      })),
    };
  };

  return {
    chartType: "column",
    bounds,
    chartData,
    allData,
    xScale,
    xScaleInteraction,
    xScaleIn,
    xScaleTimeRange,
    yScale,
    segments,
    colors,
    getColorLabel: getSegmentLabel,
    grouped,
    getAnnotationInfo,
    leftAxisLabelSize,
    leftAxisLabelOffsetTop: top,
    bottomAxisLabelSize,
    ...variables,
  };
};

const GroupedColumnChartProvider = (
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useColumnsGroupedStateVariables(chartProps);
  const data = useColumnsGroupedStateData(chartProps, variables);
  const state = useColumnsGroupedState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedColumnChart = (
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
) => {
  return (
    <InteractionProvider>
      <GroupedColumnChartProvider {...props} />
    </InteractionProvider>
  );
};
