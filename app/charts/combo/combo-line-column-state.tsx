import * as d3 from "d3";
import React, { useMemo } from "react";

import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
import {
  ComboLineColumnStateVariables,
  useComboLineColumnStateData,
  useComboLineColumnStateVariables,
} from "@/charts/combo/combo-line-column-state-props";
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
import { ComboLineColumnConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import {
  useFormatFullDateAuto,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import { TimeUnit } from "@/graphql/resolver-types";
import { getTimeInterval } from "@/intervals";
import { getPalette } from "@/palettes";
import { getTextWidth } from "@/utils/get-text-width";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineColumnState = CommonChartState &
  ComboLineColumnStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "comboLineColumn";
    xKey: string;
    xScale: d3.ScaleBand<string>;
    xScaleTime: d3.ScaleTime<number, number>;
    xScaleInteraction: d3.ScaleBand<string>;
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

const useComboLineColumnState = (
  chartProps: ChartProps<ComboLineColumnConfig> & { aspectRatio: number },
  variables: ComboLineColumnStateVariables,
  data: ChartStateData
): ComboLineColumnState => {
  const { chartConfig, aspectRatio } = chartProps;
  const { getX, getXAsDate } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();

  const xKey = fields.x.componentIri;
  const dataGroupedByX = React.useMemo(() => {
    return d3.group(chartData, getX);
  }, [chartData, getX]);

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
          return [variables.y.left, variables.y.right].map((d) => {
            return {
              [d.label]: d.getY(o),
            };
          });
        })
      );

      chartWideData.push(observation);
    }

    return chartWideData;
  }, [dataGroupedByX, xKey, variables.y.left, variables.y.right]);

  // x
  const xDomainTime = d3.extent(chartData, (d) => getXAsDate(d)) as [
    Date,
    Date
  ];
  const xScaleTime = d3.scaleTime().domain(xDomainTime);
  // We can only use TemporalDimension in ComboLineColumn chart (see ui encodings).
  const interval = getTimeInterval(variables.xTimeUnit as TimeUnit);
  const formatDate = useFormatFullDateAuto();
  const xDomain = interval
    .range(xDomainTime[0], xDomainTime[1])
    .concat(xDomainTime[1])
    .map(formatDate);
  const xScale = d3
    .scaleBand()
    .domain(xDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);

  const interactiveXTimeRangeDomain = useMemo(() => {
    return d3.extent(timeRangeData, (d) => getXAsDate(d)) as [Date, Date];
  }, [timeRangeData, getXAsDate]);
  const interactiveXTimeRangeScale = d3
    .scaleTime()
    .domain(interactiveXTimeRangeDomain);

  // y
  const minLeftValue =
    variables.y.left.chartType === "column"
      ? 0
      : d3.min(scalesData, (o) => {
          return variables.y.left.getY(o);
        }) ?? 0;
  const minRightValue =
    variables.y.right.chartType === "column"
      ? 0
      : d3.min(scalesData, (o) => {
          return variables.y.right.getY(o);
        }) ?? 0;
  const minValue = d3.min([minLeftValue, minRightValue]) ?? 0;
  const maxLeftValue =
    d3.max(scalesData, (o) => {
      return variables.y.left.getY(o);
    }) ?? 0;
  const maxRightValue =
    d3.max(scalesData, (o) => {
      return variables.y.right.getY(o);
    }) ?? 0;
  const maxValue = d3.max([maxLeftValue, maxRightValue]) ?? 0;
  const yScale = d3.scaleLinear().domain([minValue, maxValue]).nice();
  const yOrientationScales = {
    left: d3.scaleLinear().domain([minLeftValue, maxLeftValue]).nice(),
    right: d3.scaleLinear().domain([minRightValue, maxRightValue]).nice(),
  };

  const paddingLeftMinValue =
    d3.min(paddingData, (o) => {
      return variables.y.left.getY(o);
    }) ?? 0;
  const paddingRightMinValue =
    d3.min(paddingData, (o) => {
      return variables.y.right.getY(o);
    }) ?? 0;
  const paddingLeftMaxValue =
    d3.max(paddingData, (o) => {
      return variables.y.left.getY(o);
    }) ?? 0;
  const paddingRightMaxValue =
    d3.max(paddingData, (o) => {
      return variables.y.right.getY(o);
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
    .domain([variables.y.left, variables.y.right].map((d) => d.label))
    .range(getPalette());

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingLeftYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain: xDomain,
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
  xScaleTime.range([0, chartWidth]);
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
      xAnchor: (xScale(x) as number) + xScale.bandwidth() * 0.5,
      // Center the tooltip vertically.
      yAnchor:
        [variables.y.left, variables.y.right]
          .map(({ orientation, getY }) =>
            yOrientationScales[orientation](getY(d) ?? 0)
          )
          .reduce((a, b) => a + b, 0) * 0.5,
      xValue: timeFormatUnit(x, variables.xTimeUnit as TimeUnit),
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor: (xScale(x) as number) + xScale.bandwidth() * 0.5,
        topAnchor: false,
      }),
      values: [variables.y.left, variables.y.right].map(
        ({ orientation, getY, label, chartType }) => {
          const y = getY(d) ?? 0;

          return {
            label,
            value: `${y}`,
            color: colors(label),
            hide: y === null,
            yPos: yOrientationScales[orientation](y),
            symbol: chartType === "line" ? "line" : "square",
          };
        }
      ),
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

const ComboLineColumnChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineColumnConfig> & { aspectRatio: number }
  >
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
  props: React.PropsWithChildren<
    ChartProps<ComboLineColumnConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineColumnChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
