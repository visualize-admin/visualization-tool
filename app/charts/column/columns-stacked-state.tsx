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
import React, { useCallback, useMemo } from "react";

import {
  ColumnsStackedStateData,
  ColumnsStackedStateVariables,
  useColumnsStackedStateData,
  useColumnsStackedStateVariables,
} from "@/charts/column/columns-stacked-state-props";
import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
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
  useGetIdentityY,
} from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  CommonChartState,
  InteractiveXTimeRangeState,
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
  getStackedYScale,
} from "@/charts/shared/stacked-helpers";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { ColumnConfig } from "@/configurator";
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
    formatXAxisTick?: (d: string) => string;
  };

const useColumnsStackedState = (
  chartProps: ChartProps<ColumnConfig>,
  variables: ColumnsStackedStateVariables,
  data: ColumnsStackedStateData
): StackedColumnsState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    formatXDate,
    yMeasure,
    getY,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
    xAxisLabel,
    yAxisLabel,
  } = variables;
  const getIdentityY = useGetIdentityY(yMeasure.id);
  const {
    chartData,
    scalesData,
    segmentData,
    timeRangeData,
    paddingData,
    allData,
  } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { y } = fields;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const calculationType = useChartInteractiveFilters((d) => d.calculation.type);

  const xKey = fields.x.componentId;

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

  const sumsByX = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (d) => getY(d)),
        (x) => getX(x)
      )
    );
  }, [chartData, getX, getY]);

  const normalize = calculationType === "percent";
  const chartDataGroupedByX = useMemo(() => {
    if (normalize) {
      return group(
        normalizeData(chartData, {
          key: yMeasure.id,
          getAxisValue: getY,
          getTotalGroupValue: (d) => sumsByX[getX(d)],
        }),
        getX
      );
    }

    return group(chartData, getX);
  }, [normalize, chartData, getX, yMeasure.id, getY, sumsByX]);

  const chartWideData = useMemo(() => {
    return getWideData({
      dataGrouped: chartDataGroupedByX,
      key: xKey,
      getAxisValue: getY,
      getSegment,
      allSegments: segments,
      imputationType: "zeros",
    });
  }, [getSegment, getY, chartDataGroupedByX, segments, xKey]);

  const xFilter = chartConfig.cubes.find((d) => d.iri === xDimension.cubeIri)
    ?.filters[xDimension.id];

  // Map ordered segments labels to colors
  const {
    colors,
    xScale,
    xTimeRangeDomainLabels,
    xScaleInteraction,
    xScaleTimeRange,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (
      fields.segment &&
      segmentsByAbbreviationOrLabel &&
      fields.color.type === "segment"
    ) {
      const segmentColor = fields.color;
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
          color: segmentColor.colorMapping![dvIri] ?? schemeCategory10[0],
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

    const xScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];
    const xScaleTimeRange = scaleTime().domain(xScaleTimeRangeDomain);

    return {
      colors,
      xScale,
      xTimeRangeDomainLabels,
      xScaleTimeRange,
      xScaleInteraction,
    };
  }, [
    fields.segment,
    fields.color,
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

  const animationIri = fields.animation?.componentId;
  const getAnimation = useCallback(
    (d: Observation) => {
      return animationIri ? (d[animationIri] as string) : "";
    },
    [animationIri]
  );

  const yScale = useMemo(() => {
    return getStackedYScale(scalesData, {
      normalize,
      getX,
      getY,
      getTime: getAnimation,
      customDomain: y.customDomain,
    });
  }, [scalesData, normalize, getX, getY, getAnimation, y.customDomain]);

  const paddingYScale = useMemo(() => {
    //  When the user can toggle between absolute and relative values, we use the
    // absolute values to calculate the yScale domain, so that the yScale doesn't
    // change when the user toggles between absolute and relative values.
    if (interactiveFiltersConfig?.calculation.active) {
      const scale = getStackedYScale(paddingData, {
        normalize: false,
        getX,
        getY,
        getTime: getAnimation,
        customDomain: y.customDomain,
      });

      if (scale.domain()[1] < 100 && scale.domain()[0] > -100) {
        return scaleLinear().domain([0, 100]);
      }

      return scale;
    }

    return getStackedYScale(paddingData, {
      normalize,
      getX,
      getY,
      getTime: getAnimation,
      customDomain: y.customDomain,
    });
  }, [
    interactiveFiltersConfig?.calculation.active,
    paddingData,
    normalize,
    getX,
    getY,
    getAnimation,
    y.customDomain,
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
    xLabelPresent: !!xAxisLabel,
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain: xTimeRangeDomainLabels.every((d) => d === undefined)
      ? xScale.domain()
      : xTimeRangeDomainLabels,
    normalize,
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

  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xScaleTimeRange.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

  const maybeFormatDate = useCallback(
    (tick: string) => {
      return isTemporalDimension(xDimension) ? formatXDate(tick) : tick;
    },
    [xDimension, formatXDate]
  );

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
        measureId: yMeasure.id,
        measureUnit: yMeasure.unit,
        formatters,
        formatNumber,
      });

      const xAnchorRaw = (xScale(x) as number) + bw * 0.5;
      const yAnchor = isMobile
        ? chartHeight
        : yScale(sum(yValues.map((d) => d ?? 0)) * 0.5);
      const placement = isMobile
        ? MOBILE_TOOLTIP_PLACEMENT
        : getCenteredTooltipPlacement({
            chartWidth,
            xAnchor: xAnchorRaw,
            topAnchor: !fields.segment,
          });
      const xLabel = getXAbbreviationOrLabel(datum);

      return {
        xAnchor: xAnchorRaw + (placement.x === "right" ? 0.5 : -0.5) * bw,
        yAnchor,
        placement,
        value: maybeFormatDate(xLabel),
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
      yMeasure.id,
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
      chartHeight,
      isMobile,
      normalize,
      yScale,
      maybeFormatDate,
    ]
  );

  const valueLabelFormatter = useValueLabelFormatter({
    measureId: yMeasure.id,
    dimensions,
    measures,
    normalize,
  });

  return {
    chartType: "column",
    bounds,
    chartData,
    allData,
    xScale,
    xScaleInteraction,
    xScaleTimeRange,
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
    formatXAxisTick: maybeFormatDate,
    ...variables,
  };
};

const StackedColumnsChartProvider = (
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
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
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
) => {
  return (
    <InteractionProvider>
      <StackedColumnsChartProvider {...props} />
    </InteractionProvider>
  );
};
