import * as d3 from "d3";
import React, { useMemo } from "react";

import {
  ComboLineDualStateVariables,
  useComboLineDualStateData,
  useComboLineDualStateVariables,
} from "@/charts/combo/combo-line-dual-state-props";
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
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ComboLineDualConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber, useTimeFormatUnit } from "@/formatters";
import { getPalette } from "@/palettes";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineDualState = CommonChartState &
  ComboLineDualStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "comboLineDual";
    xKey: string;
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    colors: d3.ScaleOrdinal<string, string>;
    getColorLabel: (label: string) => string;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
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
  const minValue =
    d3.min(scalesData, (o) => {
      return d3.min([variables.y.lineLeft, variables.y.lineRight], (d) =>
        d.getY(o)
      );
    }) ?? 0;
  const maxValue =
    d3.max(scalesData, (o) => {
      return d3.max([variables.y.lineLeft, variables.y.lineRight], (d) =>
        d.getY(o)
      );
    }) ?? 0;
  const yDomain = [minValue, maxValue];
  const yScale = d3.scaleLinear().domain(yDomain).nice();

  const paddingMinValue =
    d3.min(paddingData, (o) => {
      return d3.min([variables.y.lineLeft, variables.y.lineRight], (d) =>
        d.getY(o)
      );
    }) ?? 0;
  const paddingMaxValue =
    d3.max(paddingData, (o) => {
      return d3.max([variables.y.lineLeft, variables.y.lineRight], (d) =>
        d.getY(o)
      );
    }) ?? 0;
  const paddingYScale = d3
    .scaleLinear()
    .domain([paddingMinValue, paddingMaxValue])
    .nice();

  const colors = d3
    .scaleOrdinal<string, string>()
    .domain([variables.y.lineLeft, variables.y.lineRight].map((d) => d.label))
    .range(getPalette());

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
  });
  const margins = {
    top: 50,
    right: 40,
    bottom,
    left,
  };
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  interactiveXTimeRangeScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

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
      yAnchor: yScale(
        [variables.y.lineLeft, variables.y.lineRight]
          .map(({ getY }) => getY(d) ?? 0)
          .reduce((a, b) => a + b, 0) * 0.5
      ),
      xValue: timeFormatUnit(x, xDimension.timeUnit),
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor: xScale(x),
        topAnchor: false,
      }),
      values: [variables.y.lineLeft, variables.y.lineRight].map(
        ({ getY, label }) => {
          const y = getY(d) ?? 0;

          return {
            label,
            value: `${y}`,
            color: colors(label),
            hide: y === null,
            yPos: yScale(y),
          };
        }
      ),
    } as TooltipInfo;
  };

  return {
    chartType: "comboLineDual",
    xKey,
    bounds,
    chartData,
    allData,
    xScale,
    interactiveXTimeRangeScale,
    yScale,
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
