import overEvery from "lodash/overEvery";
import React from "react";

import { useTemporalVariable } from "@/charts/shared/chart-helpers";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds } from "@/charts/shared/use-width";
import { ChartConfig, ChartType, isAnimationInConfig } from "@/configurator";
import { DimensionValue, Observation, ObservationValue } from "@/domain/data";
import { truthy } from "@/domain/types";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import {
  GeoCoordinatesDimension,
  GeoShapesDimension,
  NumericalMeasure,
  TemporalDimension,
  TimeUnit,
} from "@/graphql/resolver-types";

// TODO: usetemporalXchartstate...
export type CommonChartState = {
  chartType: ChartType;
  chartData: Observation[];
  allData: Observation[];
  bounds: Bounds;
};

type NumericalValueGetter = (d: Observation) => number | null;

type StringValueGetter = (d: Observation) => string;

type TemporalValueGetter = (d: Observation) => Date;

export type RenderingVariables = {
  /** Optinally provide an option to pass a segment to the key.
   * This is useful for stacked charts, where we can't easily
   * access the segment value from the data.
   */
  getRenderingKey: (d: Observation, segment?: string) => string;
};

export type BandXVariables = {
  xDimension: DimensionMetadataFragment;
  getX: StringValueGetter;
  getXLabel: (d: string) => string;
  getXAbbreviationOrLabel: (d: Observation) => string;
  xTimeUnit: TimeUnit | undefined;
  getXAsDate: TemporalValueGetter;
};

export type TemporalXVariables = {
  xDimension: TemporalDimension;
  getX: TemporalValueGetter;
};

export type NumericalXVariables = {
  xMeasure: NumericalMeasure;
  getX: NumericalValueGetter;
  xAxisLabel: string;
};

export type NumericalYVariables = {
  yMeasure: NumericalMeasure;
  getY: NumericalValueGetter;
  yAxisLabel: string;
};

export type NumericalXErrorVariables = {
  showXStandardError: boolean;
  xErrorMeasure: DimensionMetadataFragment | undefined;
  getXError: ((d: Observation) => ObservationValue) | null;
  getXErrorRange: null | ((d: Observation) => [number, number]);
};

export type NumericalYErrorVariables = {
  showYStandardError: boolean;
  yErrorMeasure: DimensionMetadataFragment | undefined;
  getYError: ((d: Observation) => ObservationValue) | null;
  getYErrorRange: null | ((d: Observation) => [number, number]);
};

export type SegmentVariables = {
  segmentDimension: DimensionMetadataFragment | undefined;
  segmentsByAbbreviationOrLabel: Map<string, DimensionValue>;
  getSegment: StringValueGetter;
  getSegmentAbbreviationOrLabel: StringValueGetter;
  getSegmentLabel: (d: string) => string;
};

export type AreaLayerVariables = {
  areaLayerDimension: GeoShapesDimension | undefined;
  getArea: StringValueGetter;
};

export type SymbolLayerVariables = {
  symbolLayerDimension:
    | GeoShapesDimension
    | GeoCoordinatesDimension
    | undefined;
  getSymbol: StringValueGetter;
};

export type ChartStateData = {
  /** Data with all interactive filters applied, used to draw the shapes. */
  chartData: Observation[];
  /** Data with color legend and time range filters applied, used to compute the scales.
   * As time slider filter is not applied to it, it holds the information about all
   * potential scale values and makes it possible to fix the scales when animating
   * the charts. */
  scalesData: Observation[];
  /** Data with time range filter applied. Needed to hold the information about all
   * color values that can be used in a chart, to save unchecked color legend items
   * from being removed. */
  segmentData: Observation[];
  /** Full dataset, needed to show the timeline when using time slider.
   * We can't use `scalesData` here, due to the fact the the `useChartData` hook gets
   * re-rendered and prevents the timeline from working it such case. */
  allData: Observation[];
};

type ValuePredicate = (v: any) => boolean;

/** Prepares the data to be used in charts, taking interactive filters into account. */
export const useChartData = (
  observations: Observation[],
  {
    chartConfig,
    getXAsDate,
    getSegment,
  }: {
    chartConfig: ChartConfig;
    getXAsDate?: (d: Observation) => Date;
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
      getXAsDate && fromTime && toTime && timeRange?.active
        ? (d: Observation) => {
            const time = getXAsDate(d).getTime();
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
    getXAsDate,
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
