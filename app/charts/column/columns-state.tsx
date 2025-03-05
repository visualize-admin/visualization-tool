import { extent, max, rollup, sum } from "d3-array";
import {
  ScaleBand,
  scaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
} from "d3-scale";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  ColumnsStateVariables,
  useColumnsStateData,
  useColumnsStateVariables,
} from "@/charts/column/columns-state-props";
import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
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
  ShowValuesVariables,
  useShowValuesVariables,
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
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import { getPalette } from "@/palettes";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsState = CommonChartState &
  ColumnsStateVariables &
  InteractiveXTimeRangeState &
  Omit<ShowValuesVariables, "yOffset"> & {
    chartType: "column";
    xScale: ScaleBand<string>;
    xScaleInteraction: ScaleBand<string>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    bottomAxisLabelSize: AxisLabelSizeVariables;
  };

const useColumnsState = (
  chartProps: ChartProps<ColumnConfig>,
  variables: ColumnsStateVariables,
  data: ChartStateData
): ColumnsState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    xTimeUnit,
    yMeasure,
    getY,
    getMinY,
    getYErrorRange,
    getFormattedYUncertainty,
    getSegmentLabel,
    xAxisLabel,
  } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { y } = fields;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const timeFormatUnit = useTimeFormatUnit();

  const sumsByX = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getX(x)
      )
    );
  }, [chartData, getX, getY]);

  const {
    xScale,
    colors,
    yScale,
    paddingYScale,
    xScaleTimeRange,
    xScaleInteraction,
    xTimeRangeDomainLabels,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (fields.color.type === "single") {
      colors.range(
        getPalette({
          paletteId: fields.color.paletteId,
          colorField: fields.color,
        })
      );
    }

    const sorters = makeDimensionValueSorters(xDimension, {
      sorting: fields.x.sorting,
      measureBySegment: sumsByX,
      useAbbreviations: fields.x.useAbbreviations,
      dimensionFilter: xDimension?.id
        ? chartConfig.cubes.find((d) => d.iri === xDimension.cubeIri)?.filters[
            xDimension.id
          ]
        : undefined,
    });
    const sortingOrders = getSortingOrders(sorters, fields.x.sorting);
    const bandDomain = orderBy(
      [...new Set(scalesData.map(getX))],
      sorters,
      sortingOrders
    );
    const xTimeRangeValues = [...new Set(timeRangeData.map(getX))];
    const xTimeRangeDomainLabels = xTimeRangeValues.map(getXLabel);
    const xScale = scaleBand()
      .domain(bandDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(bandDomain)
      .paddingInner(0)
      .paddingOuter(0);

    const xScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];

    const xScaleTimeRange = scaleTime().domain(xScaleTimeRangeDomain);

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

    const paddingMinValue = getMinY(paddingData, (d) =>
      getYErrorRange ? getYErrorRange(d)[0] : getY(d)
    );
    const paddingMaxValue = Math.max(
      max(paddingData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d)
      ) ?? 0,
      0
    );
    const paddingYScale = scaleLinear()
      .domain([paddingMinValue, paddingMaxValue])
      .nice();

    return {
      colors,
      xScale,
      yScale,
      paddingYScale,
      xScaleTimeRange,
      xScaleInteraction,
      xTimeRangeDomainLabels,
    };
  }, [
    fields.color,
    getX,
    getXLabel,
    getXAsDate,
    getY,
    getYErrorRange,
    scalesData,
    paddingData,
    timeRangeData,
    fields.x.sorting,
    fields.x.useAbbreviations,
    xDimension,
    chartConfig.cubes,
    sumsByX,
    getMinY,
  ]);

  const { left, bottom } = useChartPadding({
    xLabelPresent: !!xAxisLabel,
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent: !!fields.animation,
    formatNumber,
    bandDomain: xTimeRangeDomainLabels.every((d) => d === undefined)
      ? xScale.domain()
      : xTimeRangeDomainLabels,
  });
  const right = 40;

  const chartWidth = getChartWidth({ width, left, right });
  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xScaleTimeRange.range([0, chartWidth]);

  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yMeasure.label,
    width,
    marginLeft: left,
    marginRight: right,
  });
  const bottomAxisLabelSize = useAxisLabelSizeVariables({
    label: xAxisLabel,
    width,
    marginLeft: left,
    marginRight: right,
  });
  const { yOffset: yValueLabelsOffset, ...showValuesVariables } =
    useShowValuesVariables(y, {
      chartData,
      dimensions,
      measures,
      getY,
      bandwidth: xScale.bandwidth(),
    });
  const margins = {
    top: DEFAULT_MARGIN_TOP + leftAxisLabelSize.offset + yValueLabelsOffset,
    right,
    bottom,
    left,
  };
  const bounds = useChartBounds({ width, height, chartWidth, margins });
  const { chartHeight } = bounds;
  yScale.range([chartHeight, 0]);
  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const xAnchor = (xScale(getX(d)) as number) + xScale.bandwidth() * 0.5;
    const yAnchor = isMobile
      ? chartHeight
      : yScale(Math.max(getY(d) ?? NaN, 0));
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor,
          topAnchor: !fields.segment,
        });
    const xLabel = getXAbbreviationOrLabel(d);
    const y = getY(d);
    const yValueUnitFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.id] ?? formatNumber,
        yMeasure.unit
      );

    return {
      xAnchor,
      yAnchor,
      placement,
      value: xTimeUnit ? timeFormatUnit(xLabel, xTimeUnit) : xLabel,
      datum: {
        label: undefined,
        value: y !== null && isNaN(y) ? "-" : `${yValueUnitFormatter(getY(d))}`,
        error: getFormattedYUncertainty(d),
        color: "",
      },
      values: undefined,
    };
  };

  return {
    colors,
    getColorLabel: getSegmentLabel,
    chartType: "column",
    bounds,
    chartData,
    allData,
    xScale,
    xScaleTimeRange,
    xScaleInteraction,
    yScale,
    getAnnotationInfo,
    leftAxisLabelSize,
    bottomAxisLabelSize,
    ...showValuesVariables,
    ...variables,
  };
};

const ColumnChartProvider = (
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useColumnsStateVariables(chartProps);
  const data = useColumnsStateData(chartProps, variables);
  const state = useColumnsState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ColumnChart = (
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
) => {
  return (
    <InteractionProvider>
      <ColumnChartProvider {...props} />
    </InteractionProvider>
  );
};
