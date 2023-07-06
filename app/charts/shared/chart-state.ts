import overEvery from "lodash/overEvery";
import React from "react";

import { useTemporalVariable } from "@/charts/shared/chart-helpers";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds } from "@/charts/shared/use-width";
import { ChartConfig, ChartType, isAnimationInConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { NumericalMeasure, TemporalDimension } from "@/graphql/resolver-types";

export type CommonChartState = {
  chartType: ChartType;
  chartData: Observation[];
  allData: Observation[];
  bounds: Bounds;
};

type NumericalDimensionValueGetter = (d: Observation) => number | null;

type TemporalDimensionValueGetter = (d: Observation) => Date;

export type TemporalXVariables = {
  xDimension: TemporalDimension;
  getX: TemporalDimensionValueGetter;
};

export type NumericalXVariables = {
  xMeasure: NumericalMeasure;
  getX: NumericalDimensionValueGetter;
  xAxisLabel: string;
};

export type NumericalYVariables = {
  yMeasure: NumericalMeasure;
  getY: NumericalDimensionValueGetter;
  yAxisLabel: string;
};

export type ChartStateData = {
  /** Data to be used in the chart. */
  chartData: Observation[];
  /** Data to be used to compute the scales.
   * They are different when a time slider is present, since the scales
   * should be computed using all the data, to prevent them from changing
   * when the time slider is moved, while the chart should only show the data
   * corresponding to the selected time.*/
  scalesData: Observation[];
  /** Data to be used to compute the full color scales. */
  segmentData: Observation[];
  /** All data, used to e.g. draw the timeline of Time Slider. */
  allData: Observation[];
};

type ValuePredicate = (v: any) => boolean;

/** Prepares the data to be used in charts, taking interactive filters into account. */
export const useChartData = (
  observations: Observation[],
  {
    chartConfig,
    getXDate,
    getSegment,
  }: {
    chartConfig: ChartConfig;
    getXDate?: (d: Observation) => Date;
    getSegment?: (d: Observation) => string;
  }
): {
  /** Data to be used in the chart. */
  chartData: Observation[];
  /** Data to be used to compute the scales.
   * They are different when a time slider is present, since the scales
   * should be computed using all the data, to prevent them from changing
   * when the time slider is moved, while the chart should only show the data
   * corresponding to the selected time.*/
  scalesData: Observation[];
  /** Data to be used to compute the full color scales. */
  segmentData: Observation[];
} => {
  const { interactiveFiltersConfig } = chartConfig;
  const [IFState] = useInteractiveFilters();

  // time range
  const timeRange = interactiveFiltersConfig?.timeRange;
  const fromTime = IFState.timeRange.from?.getTime();
  const toTime = IFState.timeRange.to?.getTime();

  // time slider
  const animationField = isAnimationInConfig(chartConfig)
    ? chartConfig.fields.animation
    : undefined;
  const getTime = useTemporalVariable(animationField?.componentIri ?? "");
  const timeSliderValue = IFState.timeSlider.value;

  // legend
  const legend = interactiveFiltersConfig?.legend;
  const legendItems = Object.keys(IFState.categories);

  const { allFilters, legendFilters, timeFilters } = React.useMemo(() => {
    const timeRangeFilter =
      getXDate && fromTime && toTime && timeRange?.active
        ? (d: Observation) => {
            const time = getXDate(d).getTime();
            return time >= fromTime && time <= toTime;
          }
        : null;
    const timeSliderFilter =
      animationField?.componentIri && timeSliderValue
        ? (d: Observation) => {
            return getTime(d).getTime() === timeSliderValue.getTime();
          }
        : null;
    const legendFilter =
      legend?.active && getSegment
        ? (d: Observation) => {
            return !legendItems.includes(getSegment(d));
          }
        : null;

    return {
      allFilters: overEvery(
        (
          [
            timeRangeFilter,
            timeSliderFilter,
            legendFilter,
          ] as (ValuePredicate | null)[]
        ).filter(truthy)
      ),
      legendFilters: overEvery(
        ([legendFilter] as (ValuePredicate | null)[]).filter(truthy)
      ),
      timeFilters: overEvery(
        ([timeRangeFilter] as (ValuePredicate | null)[]).filter(truthy)
      ),
    };
  }, [
    getXDate,
    fromTime,
    toTime,
    timeRange?.active,
    animationField?.componentIri,
    timeSliderValue,
    legend?.active,
    getSegment,
    getTime,
    legendItems,
  ]);

  const chartData = React.useMemo(() => {
    return observations.filter(allFilters);
  }, [allFilters, observations]);

  const scalesData = React.useMemo(() => {
    return observations.filter(overEvery(legendFilters, timeFilters));
  }, [observations, legendFilters, timeFilters]);

  const segmentData = React.useMemo(() => {
    return observations.filter(timeFilters);
  }, [observations, timeFilters]);

  return {
    chartData,
    scalesData,
    segmentData,
  };
};
