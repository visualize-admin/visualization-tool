import { mean } from "d3-array";
import { schemeCategory10 } from "d3-scale-chromatic";
import React from "react";

import {
  ComboLineSingleStateVariables,
  useComboLineSingleStateData,
  useComboLineSingleStateVariables,
} from "@/charts/combo/combo-line-single-state-props";
import {
  adjustScales,
  getMargins,
  useCommonComboState,
  useYScales,
} from "@/charts/combo/combo-state";
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
import { ComboLineSingleConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineSingleState = CommonChartState &
  ComboLineSingleStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "comboLineSingle";
    xKey: string;
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    yAxisLabel: string;
    colors: d3.ScaleOrdinal<string, string>;
    getColorLabel: (label: string) => string;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useComboLineSingleState = (
  chartProps: ChartProps<ComboLineSingleConfig> & { aspectRatio: number },
  variables: ComboLineSingleStateVariables,
  data: ChartStateData
): ComboLineSingleState => {
  const { chartConfig, aspectRatio, measuresByIri } = chartProps;
  const { xDimension, getX, getXAsString } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const yUnits = Array.from(
    new Set(
      variables.y.lines.map((d) => {
        return measuresByIri[d.iri].unit;
      })
    )
  );

  if (yUnits.length > 1) {
    throw new Error(
      "Multiple units are not supported in ComboLineSingle chart!"
    );
  }

  const yAxisLabel = yUnits[0] ?? "";

  const xKey = fields.x.componentIri;
  const {
    width,
    formatNumber,
    timeFormatUnit,
    chartWideData,
    xScaleTime: xScale,
    xScaleTimeRange,
    colors,
  } = useCommonComboState({
    chartData,
    timeRangeData,
    xKey,
    getXAsDate: getX,
    getXAsString,
    yGetters: variables.y.lines,
    computeTotal: true,
  });

  // y
  const { yScale, paddingYScale } = useYScales({
    scalesData,
    paddingData,
    getY: variables.y.lines.map((d) => d.getY),
  });

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
  });
  const margins = getMargins({ left, bottom });
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;
  const xScales = [xScale, xScaleTimeRange];
  const yScales = [yScale];
  adjustScales(xScales, yScales, { chartWidth, chartHeight });

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const x = getX(d);
    const xScaled = xScale(x);
    const values = variables.y.lines
      .map(({ getY, label }) => {
        const y = getY(d);
        if (!Number.isFinite(y) || y === null) {
          return null;
        }

        return {
          label,
          value: `${y}`,
          color: colors(label),
          hide: y === null,
          yPos: yScale(y ?? 0),
          symbol: "line",
        };
      })
      .filter(truthy);
    const yAnchor = mean(values.map((d) => d.yPos));

    return {
      datum: { label: "", value: "0", color: schemeCategory10[0] },
      xAnchor: xScaled,
      yAnchor: yAnchor,
      xValue: timeFormatUnit(x, xDimension.timeUnit),
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor: xScaled,
        topAnchor: false,
      }),
      values,
    } as TooltipInfo;
  };

  return {
    chartType: "comboLineSingle",
    xKey,
    bounds,
    chartData,
    allData,
    xScale,
    xScaleTimeRange,
    yScale,
    yAxisLabel,
    colors,
    getColorLabel: (label) => label,
    chartWideData,
    getAnnotationInfo,
    ...variables,
  };
};

const ComboLineSingleChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineSingleConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineSingleStateVariables(chartProps);
  const data = useComboLineSingleStateData(chartProps, variables);
  const state = useComboLineSingleState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineSingleChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineSingleConfig> & { aspectRatio: number }
  >
) => {
  return (
    <InteractionProvider>
      <ComboLineSingleChartProvider {...props} />
    </InteractionProvider>
  );
};
