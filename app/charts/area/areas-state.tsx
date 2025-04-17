import { extent, group, rollup, sum } from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
} from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import {
  Series,
  stack,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
} from "d3-shape";
import orderBy from "lodash/orderBy";
import { PropsWithChildren, useCallback, useMemo } from "react";

import {
  AreasStateVariables,
  useAreasStateData,
  useAreasStateVariables,
} from "@/charts/area/areas-state-props";
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
import {
  getCenteredTooltipPlacement,
  MOBILE_TOOLTIP_PLACEMENT,
} from "@/charts/shared/interaction/tooltip-box";
import { DEFAULT_MARGIN_TOP } from "@/charts/shared/margins";
import {
  ShowTemporalValueLabelsVariables,
  useShowTemporalValueLabelsVariables,
} from "@/charts/shared/show-values-utils";
import {
  getStackedTooltipValueFormatter,
  getStackedYScale,
} from "@/charts/shared/stacked-helpers";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { useLimits } from "@/config-utils";
import { AreaConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber, useTimeFormatUnit } from "@/formatters";
import { getPalette } from "@/palettes";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

export type AreasState = CommonChartState &
  AreasStateVariables &
  InteractiveXTimeRangeState &
  Omit<ShowTemporalValueLabelsVariables, "yOffset"> & {
    chartType: "area";
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    segments: string[];
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    chartWideData: ArrayLike<Observation>;
    series: Series<{ [key: string]: number }, string>[];
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    leftAxisLabelOffset: number;
    bottomAxisLabelSize: AxisLabelSizeVariables;
  };

const useAreasState = (
  chartProps: ChartProps<AreaConfig>,
  variables: AreasStateVariables,
  data: ChartStateData
): AreasState => {
  const { chartConfig, dimensions, measures } = chartProps;
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
    getSegmentLabel,
    xAxisLabel,
    yAxisLabel,
    minLimitValue,
    maxLimitValue,
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
  const timeFormatUnit = useTimeFormatUnit();
  const calculationType = useChartInteractiveFilters((d) => d.calculation.type);

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values ?? [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  /** Ordered segments */
  const segmentSorting = fields.segment?.sorting;
  const segmentSortingType = segmentSorting?.sortingType;
  const segmentSortingOrder = segmentSorting?.sortingOrder;

  const segmentFilter = segmentDimension?.id
    ? chartConfig.cubes.find((d) => d.iri === segmentDimension.cubeIri)
        ?.filters[segmentDimension.id]
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

  const xKey = fields.x.componentId;
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
          key: yMeasure.id,
          getAxisValue: getY,
          getTotalGroupValue: (d) => {
            return sumsByX[getXAsString(d)];
          },
        }),
        getXAsString
      );
    }

    return group(chartData, getXAsString);
  }, [chartData, getXAsString, sumsByX, getY, yMeasure.id, normalize]);

  const chartWideData = useMemo(() => {
    return getWideData({
      dataGrouped: chartDataGroupedByX,
      key: xKey,
      getAxisValue: getY,
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
  const { colors, xScale, xScaleTimeRange } = useMemo(() => {
    const xDomain = extent(scalesData, (d) => getX(d)) as [Date, Date];
    const xScale = scaleTime().domain(xDomain);
    const xScaleTimeRangeDomain = extent(timeRangeData, (d) => getX(d)) as [
      Date,
      Date,
    ];
    const xScaleTimeRange = scaleTime().domain(xScaleTimeRangeDomain);
    const colors = scaleOrdinal<string, string>();

    if (segmentDimension && fields.color?.type === "segment") {
      const segmentColor = fields.color;
      const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
        const dvIri =
          segmentsByAbbreviationOrLabel.get(segment)?.value ??
          segmentsByValue.get(segment)?.value ??
          "";

        return {
          label: segment,
          color: segmentColor.colorMapping[dvIri] ?? schemeCategory10[0],
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

    return {
      colors,
      xScale,
      xScaleTimeRange,
    };
  }, [
    fields.color,
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
      minLimitValue,
      maxLimitValue,
    });
  }, [scalesData, normalize, getXAsString, getY, minLimitValue, maxLimitValue]);

  const paddingYScale = useMemo(() => {
    //  When the user can toggle between absolute and relative values, we use the
    // absolute values to calculate the yScale domain, so that the yScale doesn't
    // change when the user toggles between absolute and relative values.
    if (interactiveFiltersConfig?.calculation.active) {
      const scale = getStackedYScale(paddingData, {
        normalize: false,
        getX: getXAsString,
        getY,
        minLimitValue,
        maxLimitValue,
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
      minLimitValue,
      maxLimitValue,
    });
  }, [
    interactiveFiltersConfig?.calculation.active,
    paddingData,
    normalize,
    getXAsString,
    getY,
    minLimitValue,
    maxLimitValue,
  ]);

  /** Dimensions */
  const { top, left, bottom } = useChartPadding({
    xLabelPresent: !!xAxisLabel,
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
    normalize,
  });
  const right = 40;

  const chartWidth = getChartWidth({ width, left, right });
  xScale.range([0, chartWidth]);
  xScaleTimeRange.range([0, chartWidth]);

  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yAxisLabel,
    width,
  });
  const bottomAxisLabelSize = useAxisLabelSizeVariables({
    label: xAxisLabel,
    width,
  });
  const { yOffset: yValueLabelsOffset, ...showValuesVariables } =
    useShowTemporalValueLabelsVariables(y, {
      dimensions,
      measures,
      segment: fields.segment,
    });
  const margins = {
    top:
      DEFAULT_MARGIN_TOP + top + leftAxisLabelSize.offset + yValueLabelsOffset,
    right,
    bottom,
    left,
  };
  const bounds = useChartBounds({ width, chartWidth, height, margins });
  const { chartHeight } = bounds;

  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

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
        measureId: yMeasure.id,
        measureUnit: yMeasure.unit,
        formatters,
        formatNumber,
      });
      const xAnchor = xScale(getX(datum));
      const allNaN = yValues.every((d) => Number.isNaN(d));
      const yDesktopAnchor = allNaN
        ? NaN
        : normalize
          ? yScale.range()[0] * 0.5
          : yScale(sum(yValues) * (fields.segment ? 0.5 : 1));
      const yAnchor = isMobile ? chartHeight : yDesktopAnchor;
      const placement = isMobile
        ? MOBILE_TOOLTIP_PLACEMENT
        : getCenteredTooltipPlacement({
            chartWidth,
            xAnchor,
            topAnchor: !fields.segment,
          });

      return {
        xAnchor,
        yAnchor,
        placement,
        value: timeFormatUnit(getX(datum), xDimension.timeUnit),
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
      yMeasure.id,
      yMeasure.unit,
      normalize,
      getIdentityY,
      chartWidth,
      chartHeight,
      isMobile,
    ]
  );

  return {
    chartType: "area",
    bounds,
    chartData,
    allData,
    xScale,
    xScaleTimeRange,
    yScale,
    segments,
    colors,
    getColorLabel: getSegmentLabel,
    chartWideData,
    series,
    getAnnotationInfo,
    leftAxisLabelSize,
    leftAxisLabelOffset: top,
    bottomAxisLabelSize,
    ...showValuesVariables,
    ...variables,
  };
};

const AreaChartProvider = (
  props: PropsWithChildren<
    ChartProps<AreaConfig> & { limits: ReturnType<typeof useLimits> }
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
  props: PropsWithChildren<
    ChartProps<AreaConfig> & { limits: ReturnType<typeof useLimits> }
  >
) => {
  return (
    <InteractionProvider>
      <AreaChartProvider {...props} />
    </InteractionProvider>
  );
};
