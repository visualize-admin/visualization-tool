import * as d3 from "d3";
import React, { useMemo } from "react";

import {
  ComboLineDualStateVariables,
  useComboLineDualStateData,
  useComboLineDualStateVariables,
} from "@/charts/combo/combo-line-dual-state-props";
import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import {
  getChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveXTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { getCenteredTooltipPlacement } from "@/charts/shared/interaction/tooltip-box";
import { getTickNumber } from "@/charts/shared/ticks";
import { TICK_FONT_SIZE } from "@/charts/shared/use-chart-theme";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ComboLineDualConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber, useTimeFormatUnit } from "@/formatters";
import { getPalette } from "@/palettes";
import { getTextWidth } from "@/utils/get-text-width";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineDualState = CommonChartState &
  ComboLineDualStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "comboLineDual";
    xKey: string;
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    yOrientationScales: {
      left: d3.ScaleLinear<number, number>;
      right: d3.ScaleLinear<number, number>;
    };
    colors: d3.ScaleOrdinal<string, string>;
    getColorLabel: (label: string) => string;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    maxRightTickWidth: number;
  };

const useComboLineDualState = (
  chartProps: ChartProps<ComboLineDualConfig> & { aspectRatio: number },
  variables: ComboLineDualStateVariables,
  data: ChartStateData
): ComboLineDualState => {
  const { chartConfig, aspectRatio } = chartProps;
  const { xDimension, getX, getXAsString } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();

  const xKey = fields.x.componentIri;
  const dataGroupedByX = React.useMemo(() => {
    return d3.group(chartData, getXAsString);
  }, [chartData, getXAsString]);

  const chartWideData = React.useMemo(() => {
    const chartWideData: Observation[] = [];
    // We can safely sort, as X is always a date.
    const entries = [...dataGroupedByX.entries()].sort();

    for (let i = 0; i < dataGroupedByX.size; i++) {
      const [date, observations] = entries[i];
      const observation: Observation = Object.assign(
        {
          [xKey]: date,
          [`${xKey}/__iri__`]: observations[0][`${xKey}/__iri__`],
          // Doesn't make sense to sum up the x value, as units might be different.
          total: 0,
        },
        ...observations.flatMap((o) => {
          return [variables.y.lineLeft, variables.y.lineRight].map((d) => {
            return {
              [d.label]: d.getY(o),
            };
          });
        })
      );

      chartWideData.push(observation);
    }

    return chartWideData;
  }, [dataGroupedByX, variables.y.lineLeft, , variables.y.lineRight, xKey]);

  // x
  const xDomain = d3.extent(chartData, (d) => getX(d)) as [Date, Date];
  const xScale = d3.scaleTime().domain(xDomain);

  const interactiveXTimeRangeDomain = useMemo(() => {
    return d3.extent(timeRangeData, (d) => getX(d)) as [Date, Date];
  }, [timeRangeData, getX]);
  const interactiveXTimeRangeScale = d3
    .scaleTime()
    .domain(interactiveXTimeRangeDomain);

  // y
  const minLeftValue =
    d3.min(scalesData, (o) => {
      return variables.y.lineLeft.getY(o);
    }) ?? 0;
  const minRightValue =
    d3.min(scalesData, (o) => {
      return variables.y.lineRight.getY(o);
    }) ?? 0;
  const minValue = d3.min([minLeftValue, minRightValue]) ?? 0;
  const maxLeftValue =
    d3.max(scalesData, (o) => {
      return variables.y.lineLeft.getY(o);
    }) ?? 0;
  const maxRightValue =
    d3.max(scalesData, (o) => {
      return variables.y.lineRight.getY(o);
    }) ?? 0;
  const maxValue = d3.max([maxLeftValue, maxRightValue]) ?? 0;
  const yScale = d3.scaleLinear().domain([minValue, maxValue]).nice();
  const yOrientationScales = {
    left: d3.scaleLinear().domain([minLeftValue, maxLeftValue]).nice(),
    right: d3.scaleLinear().domain([minRightValue, maxRightValue]).nice(),
  };

  const paddingLeftMinValue =
    d3.min(paddingData, (o) => {
      return variables.y.lineLeft.getY(o);
    }) ?? 0;
  const paddingRightMinValue =
    d3.min(paddingData, (o) => {
      return variables.y.lineRight.getY(o);
    }) ?? 0;
  const paddingLeftMaxValue =
    d3.max(paddingData, (o) => {
      return variables.y.lineLeft.getY(o);
    }) ?? 0;
  const paddingRightMaxValue =
    d3.max(paddingData, (o) => {
      return variables.y.lineRight.getY(o);
    }) ?? 0;
  const paddingLeftYScale = d3
    .scaleLinear()
    .domain([paddingLeftMinValue, paddingLeftMaxValue])
    .nice();
  const paddingRightYScale = d3
    .scaleLinear()
    .domain([paddingRightMinValue, paddingRightMaxValue])
    .nice();

  const colors = d3
    .scaleOrdinal<string, string>()
    .domain([variables.y.lineLeft, variables.y.lineRight].map((d) => d.label))
    .range(getPalette());

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingLeftYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
  });
  const fakeRightTicks = paddingRightYScale.ticks(
    getTickNumber(width * aspectRatio)
  );
  const maxRightTickWidth = Math.max(
    ...fakeRightTicks.map(
      (d) =>
        getTextWidth(formatNumber(d), { fontSize: TICK_FONT_SIZE }) +
        TICK_PADDING
    )
  );
  const right = Math.max(maxRightTickWidth, 40);
  const margins = {
    top: 50,
    right,
    bottom,
    left,
  };
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  interactiveXTimeRangeScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);
  yOrientationScales.left.range([chartHeight, 0]);
  yOrientationScales.right.range([chartHeight, 0]);

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const x = getX(d);

    return {
      datum: {
        label: "",
        value: "0",
        color: "#006699",
      },
      xAnchor: xScale(x),
      // Center the tooltip vertically.
      yAnchor:
        [variables.y.lineLeft, variables.y.lineRight]
          .map(({ orientation, getY }) =>
            yOrientationScales[orientation](getY(d) ?? 0)
          )
          .reduce((a, b) => a + b, 0) * 0.5,
      xValue: timeFormatUnit(x, xDimension.timeUnit),
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor: xScale(x),
        topAnchor: false,
      }),
      values: [variables.y.lineLeft, variables.y.lineRight].map(
        ({ orientation, getY, label }) => {
          const y = getY(d) ?? 0;

          return {
            label,
            value: `${y}`,
            color: colors(label),
            hide: y === null,
            yPos: yOrientationScales[orientation](y),
          };
        }
      ),
    } as TooltipInfo;
  };

  return {
    chartType: "comboLineDual",
    xKey,
    bounds,
    maxRightTickWidth,
    chartData,
    allData,
    xScale,
    interactiveXTimeRangeScale,
    yScale,
    yOrientationScales,
    colors,
    getColorLabel: (label) => label,
    chartWideData,
    getAnnotationInfo,
    ...variables,
  };
};

const ComboLineDualChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineDualConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineDualStateVariables(chartProps);
  const data = useComboLineDualStateData(chartProps, variables);
  const state = useComboLineDualState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineDualChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineDualConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineDualChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
