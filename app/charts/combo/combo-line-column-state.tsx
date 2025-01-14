import { max, mean, min } from "d3-array";
import {
  ScaleBand,
  scaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  ScaleTime,
} from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { PropsWithChildren } from "react";

import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
import {
  ComboLineColumnStateVariables,
  useComboLineColumnStateData,
  useComboLineColumnStateVariables,
} from "@/charts/combo/combo-line-column-state-props";
import {
  adjustScales,
  getMargins,
  useCommonComboState,
  useYScales,
} from "@/charts/combo/combo-state";
import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import {
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
import { getTickNumber } from "@/charts/shared/ticks";
import { TICK_FONT_SIZE } from "@/charts/shared/use-chart-theme";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { ComboLineColumnConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { useFormatFullDateAuto } from "@/formatters";
import { TimeUnit } from "@/graphql/resolver-types";
import { getTimeInterval } from "@/intervals";
import { getTextWidth } from "@/utils/get-text-width";
import { useAxisTitleAdjustments } from "@/utils/use-axis-title-adjustments";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineColumnState = CommonChartState &
  ComboLineColumnStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "comboLineColumn";
    xKey: string;
    xScale: ScaleBand<string>;
    xScaleTime: ScaleTime<number, number>;
    xScaleInteraction: ScaleBand<string>;
    yScale: ScaleLinear<number, number>;
    yOrientationScales: {
      left: ScaleLinear<number, number>;
      right: ScaleLinear<number, number>;
    };
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (label: string) => string;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    maxRightTickWidth: number;
  };

const useComboLineColumnState = (
  chartProps: ChartProps<ComboLineColumnConfig>,
  variables: ComboLineColumnStateVariables,
  data: ChartStateData
): ComboLineColumnState => {
  const { chartConfig } = chartProps;
  const { getX, getXAsDate } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const xKey = fields.x.componentId;
  const {
    width,
    height,
    formatNumber,
    timeFormatUnit,
    chartWideData,
    xScaleTime,
    xScaleTimeRange,
    colors,
  } = useCommonComboState({
    chartData,
    timeRangeData,
    getXAsDate,
    getXAsString: getX,
    xKey,
    yGetters: [variables.y.left, variables.y.right],
    computeTotal: false,
  });

  // x
  // We can only use TemporalDimension in ComboLineColumn chart (see UI encodings).
  const interval = getTimeInterval(variables.xTimeUnit as TimeUnit);
  const formatDate = useFormatFullDateAuto();
  const [xMin, xMax] = xScaleTime.domain() as [Date, Date];
  const xDomain = interval.range(xMin, xMax).concat(xMax).map(formatDate);
  const xScale = scaleBand()
    .domain(xDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);

  // y
  const { yScale: yScaleLeft, paddingYScale: paddingLeftYScale } = useYScales({
    scalesData,
    paddingData,
    getY: variables.y.left.getY,
    getMinY: variables.y.left.getMinY,
  });
  const { yScale: yScaleRight, paddingYScale: paddingRightYScale } = useYScales(
    {
      scalesData,
      paddingData,
      getY: variables.y.right.getY,
      getMinY: variables.y.right.getMinY,
    }
  );
  const [minLeftValue, maxLeftValue] = yScaleLeft.domain();
  const [minRightValue, maxRightValue] = yScaleRight.domain();
  const minValue = min([minLeftValue, minRightValue]) ?? 0;
  const maxValue = max([maxLeftValue, maxRightValue]) ?? 0;
  const yScale = scaleLinear().domain([minValue, maxValue]).nice();
  const yOrientationScales = {
    left: yScaleLeft,
    right: yScaleRight,
  };

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingLeftYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain: xDomain,
  });
  const fakeRightTicks = paddingRightYScale.ticks(getTickNumber(height));
  const maxRightTickWidth = Math.max(
    ...fakeRightTicks.map(
      (d) =>
        getTextWidth(formatNumber(d), { fontSize: TICK_FONT_SIZE }) +
        TICK_PADDING
    )
  );

  const { topMarginAxisTitleAdjustment } = useAxisTitleAdjustments({
    leftAxisTitle: variables.y.left.label,
    rightAxisTitle: variables.y.right.label,
    containerWidth: width,
  });

  const right = Math.max(maxRightTickWidth, 40);
  const margins = getMargins({
    left,
    right,
    bottom,
    top: topMarginAxisTitleAdjustment,
  });
  const bounds = useChartBounds(width, margins, height);
  const { chartWidth, chartHeight } = bounds;
  const xScales = [xScale, xScaleTime, xScaleTimeRange];
  const yScales = [yScale, yScaleLeft, yScaleRight];
  adjustScales(xScales, yScales, { chartWidth, chartHeight });

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const x = getX(d);
    const xScaled = (xScale(x) as number) + xScale.bandwidth() * 0.5;
    const values = [variables.y.left, variables.y.right]
      .map(({ orientation, getY, label, chartType }) => {
        const y = getY(d);
        const yPos = yOrientationScales[orientation](y ?? 0);
        if (!Number.isFinite(y) || y === null) {
          return null;
        }
        return {
          label,
          value: `${y}`,
          color: colors(label),
          hide: y === null,
          yPos,
          symbol: chartType === "line" ? "line" : "square",
        };
      })
      .filter(truthy);
    const yAnchor = isMobile ? chartHeight : mean(values.map((d) => d.yPos));
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor: xScaled,
          topAnchor: false,
        });

    return {
      datum: { label: "", value: "0", color: schemeCategory10[0] },
      xAnchor: xScaled,
      yAnchor,
      value: timeFormatUnit(x, variables.xTimeUnit as TimeUnit),
      placement,
      values,
    } as TooltipInfo;
  };

  return {
    chartType: "comboLineColumn",
    xKey,
    bounds,
    maxRightTickWidth,
    chartData,
    allData,
    xScale,
    xScaleInteraction: xScale.copy().padding(0),
    xScaleTime,
    xScaleTimeRange,
    yScale,
    yOrientationScales,
    colors,
    getColorLabel: (label) => label,
    chartWideData,
    getAnnotationInfo,
    ...variables,
  };
};

const ComboLineColumnChartProvider = (
  props: PropsWithChildren<ChartProps<ComboLineColumnConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineColumnStateVariables(chartProps);
  const data = useComboLineColumnStateData(chartProps, variables);
  const state = useComboLineColumnState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineColumnChart = (
  props: PropsWithChildren<ChartProps<ComboLineColumnConfig>>
) => {
  return (
    <InteractionProvider>
      <ComboLineColumnChartProvider {...props} />
    </InteractionProvider>
  );
};
