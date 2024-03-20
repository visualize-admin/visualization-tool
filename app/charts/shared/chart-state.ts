import { ScaleTime } from "d3";
import get from "lodash/get";
import overEvery from "lodash/overEvery";
import React from "react";

import { AreasState } from "@/charts/area/areas-state";
import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { LinesState } from "@/charts/line/lines-state";
import { MapState } from "@/charts/map/map-state";
import { PieState } from "@/charts/pie/pie-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { DimensionsByIri, MeasuresByIri } from "@/charts/shared/ChartProps";
import {
  getLabelWithUnit,
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  useStringVariable,
  useTemporalEntityVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { Bounds } from "@/charts/shared/use-width";
import { TableChartState } from "@/charts/table/table-state";
import {
  ChartConfig,
  ChartType,
  GenericField,
  InteractiveFiltersConfig,
  getAnimationField,
} from "@/configurator";
import {
  parseDate,
  useErrorMeasure,
  useErrorRange,
  useErrorVariable,
} from "@/configurator/components/ui-helpers";
import {
  Component,
  Dimension,
  DimensionValue,
  GeoCoordinatesDimension,
  GeoShapesDimension,
  Measure,
  NumericalMeasure,
  Observation,
  ObservationValue,
  TemporalEntityDimension,
  isNumericalMeasure,
  isTemporalDimension,
  isTemporalEntityDimension,
} from "@/domain/data";
import { Has } from "@/domain/types";
import { TemporalDimension, TimeUnit } from "@/graphql/resolver-types";
import { useInteractiveFilters } from "@/stores/interactive-filters";

export type ChartState =
  | AreasState
  | ColumnsState
  | StackedColumnsState
  | GroupedColumnsState
  | ComboLineSingleState
  | ComboLineColumnState
  | ComboLineDualState
  | LinesState
  | MapState
  | PieState
  | ScatterplotState
  | TableChartState
  | undefined;

export type CommonChartState = {
  chartType: ChartType;
  chartData: Observation[];
  allData: Observation[];
  bounds: Bounds;
  interactiveFiltersConfig: InteractiveFiltersConfig;
};

export type ColorsChartState = Has<ChartState, "colors">;
export const ChartContext = React.createContext<ChartState>(undefined);

export const useChartState = () => {
  const ctx = React.useContext(ChartContext);
  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <ChartContext.Provider /> to useChartState()"
    );
  }
  return ctx;
};

export type ChartWithInteractiveXTimeRangeState =
  | AreasState
  | ColumnsState
  | LinesState;

export type NumericalValueGetter = (d: Observation) => number | null;

export type StringValueGetter = (d: Observation) => string;

export type TemporalValueGetter = (d: Observation) => Date;

export type RenderingVariables = {
  /** Optionally provide an option to pass a segment to the key.
   * This is useful for stacked charts, where we can't easily
   * access the segment value from the data.
   */
  getRenderingKey: (d: Observation, segment?: string) => string;
};

export type BaseVariables = {
  interactiveFiltersConfig: InteractiveFiltersConfig;
};

export const useBaseVariables = (chartConfig: ChartConfig): BaseVariables => {
  return {
    interactiveFiltersConfig: chartConfig.interactiveFiltersConfig,
  };
};

export type BandXVariables = {
  xDimension: Dimension;
  getX: StringValueGetter;
  getXLabel: (d: string) => string;
  getXAbbreviationOrLabel: (d: Observation) => string;
  xTimeUnit: TimeUnit | undefined;
  getXAsDate: TemporalValueGetter;
};

export const useBandXVariables = (
  x: GenericField,
  {
    dimensionsByIri,
    observations,
  }: {
    dimensionsByIri: DimensionsByIri;
    observations: Observation[];
  }
): BandXVariables => {
  const xDimension = dimensionsByIri[x.componentIri];
  if (!xDimension) {
    throw Error(`No dimension <${x.componentIri}> in cube!`);
  }

  const xTimeUnit = isTemporalDimension(xDimension)
    ? xDimension.timeUnit
    : undefined;

  const {
    getAbbreviationOrLabelByValue: getXAbbreviationOrLabel,
    getValue: getX,
    getLabel: getXLabel,
  } = useDimensionWithAbbreviations(xDimension, {
    observations,
    field: x,
  });

  const getXAsDate = useTemporalVariable(x.componentIri);

  return {
    xDimension,
    getX,
    getXLabel,
    getXAbbreviationOrLabel,
    xTimeUnit,
    getXAsDate,
  };
};

export type TemporalXVariables = {
  xDimension: TemporalDimension | TemporalEntityDimension;
  getX: TemporalValueGetter;
  getXAsString: StringValueGetter;
};

export const useTemporalXVariables = (
  x: GenericField,
  { dimensionsByIri }: { dimensionsByIri: DimensionsByIri }
): TemporalXVariables => {
  const xDimension = dimensionsByIri[x.componentIri];
  if (!xDimension) {
    throw Error(`No dimension <${x.componentIri}> in cube!`);
  }

  if (
    !isTemporalDimension(xDimension) &&
    !isTemporalEntityDimension(xDimension)
  ) {
    throw Error(`Dimension <${x.componentIri}> is not temporal!`);
  }

  const getXTemporal = useTemporalVariable(x.componentIri);
  const getXTemporalEntity = useTemporalEntityVariable(
    dimensionsByIri[x.componentIri].values
  )(x.componentIri);
  const getXAsString = useStringVariable(x.componentIri);

  return {
    xDimension,
    getX: isTemporalDimension(xDimension) ? getXTemporal : getXTemporalEntity,
    getXAsString,
  };
};

export type NumericalXVariables = {
  xMeasure: NumericalMeasure;
  getX: NumericalValueGetter;
  xAxisLabel: string;
};

export const useNumericalXVariables = (
  x: GenericField,
  { measuresByIri }: { measuresByIri: MeasuresByIri }
): NumericalXVariables => {
  const xMeasure = measuresByIri[x.componentIri];
  if (!xMeasure) {
    throw Error(`No dimension <${x.componentIri}> in cube!`);
  }

  if (!isNumericalMeasure(xMeasure)) {
    throw Error(`Measure <${x.componentIri}> is not numerical!`);
  }

  const getX = useOptionalNumericVariable(x.componentIri);
  const xAxisLabel = getLabelWithUnit(xMeasure);

  return {
    xMeasure,
    getX,
    xAxisLabel,
  };
};

export type NumericalYVariables = {
  yMeasure: NumericalMeasure;
  getY: NumericalValueGetter;
  yAxisLabel: string;
};

export const useNumericalYVariables = (
  y: GenericField,
  { measuresByIri }: { measuresByIri: MeasuresByIri }
): NumericalYVariables => {
  const yMeasure = measuresByIri[y.componentIri];
  if (!yMeasure) {
    throw Error(`No dimension <${y.componentIri}> in cube!`);
  }

  if (!isNumericalMeasure(yMeasure)) {
    throw Error(`Measure <${y.componentIri}> is not numerical!`);
  }

  const getY = useOptionalNumericVariable(y.componentIri);
  const yAxisLabel = getLabelWithUnit(yMeasure);

  return {
    yMeasure,
    getY,
    yAxisLabel,
  };
};

export type NumericalYErrorVariables = {
  showYStandardError: boolean;
  yErrorMeasure: Component | undefined;
  getYError: ((d: Observation) => ObservationValue) | null;
  getYErrorRange: null | ((d: Observation) => [number, number]);
};

export const useNumericalYErrorVariables = (
  y: GenericField,
  {
    numericalYVariables,
    dimensions,
    measures,
  }: {
    numericalYVariables: NumericalYVariables;
    dimensions: Dimension[];
    measures: Measure[];
  }
): NumericalYErrorVariables => {
  const showYStandardError = get(y, ["showStandardError"], true);
  const yErrorMeasure = useErrorMeasure(y.componentIri, {
    dimensions,
    measures,
  });
  const getYErrorRange = useErrorRange(yErrorMeasure, numericalYVariables.getY);
  const getYError = useErrorVariable(yErrorMeasure);

  return {
    showYStandardError,
    yErrorMeasure,
    getYError,
    getYErrorRange,
  };
};

export type SegmentVariables = {
  segmentDimension: Dimension | undefined;
  segmentsByAbbreviationOrLabel: Map<string, DimensionValue>;
  getSegment: StringValueGetter;
  getSegmentAbbreviationOrLabel: StringValueGetter;
  getSegmentLabel: (d: string) => string;
};

export const useSegmentVariables = (
  segment: GenericField | undefined,
  {
    dimensionsByIri,
    observations,
  }: {
    dimensionsByIri: DimensionsByIri;
    observations: Observation[];
  }
): SegmentVariables => {
  const segmentDimension = dimensionsByIri[segment?.componentIri ?? ""];
  const {
    getAbbreviationOrLabelByValue: getSegmentAbbreviationOrLabel,
    abbreviationOrLabelLookup: segmentsByAbbreviationOrLabel,
    getValue: getSegment,
    getLabel: getSegmentLabel,
  } = useDimensionWithAbbreviations(segmentDimension, {
    observations,
    field: segment,
  });

  return {
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
  };
};

export type AreaLayerVariables = {
  areaLayerDimension: GeoShapesDimension | undefined;
};

export type SymbolLayerVariables = {
  symbolLayerDimension:
    | GeoShapesDimension
    | GeoCoordinatesDimension
    | undefined;
  getSymbol: StringValueGetter;
  getSymbolLabel: (d: string) => string;
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
  /** Data to be used for interactive time range slider domain. */
  timeRangeData: Observation[];
  /** Data used to compute the axes padding. */
  paddingData: Observation[];
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
    getSegmentAbbreviationOrLabel,
  }: {
    chartConfig: ChartConfig;
    getXAsDate?: (d: Observation) => Date;
    getSegmentAbbreviationOrLabel?: (d: Observation) => string;
  }
): Omit<ChartStateData, "allData"> => {
  const { interactiveFiltersConfig } = chartConfig;
  const categories = useInteractiveFilters((d) => d.categories);
  const timeRange = useInteractiveFilters((d) => d.timeRange);
  const timeSlider = useInteractiveFilters((d) => d.timeSlider);

  // time range
  const timeRangeFilterComponentIri =
    interactiveFiltersConfig?.timeRange.componentIri ?? "";
  const interactiveTimeRange = interactiveFiltersConfig?.timeRange;
  const getTimeRangeTime = useTemporalVariable(timeRangeFilterComponentIri);
  const timeRangeFromTime = interactiveTimeRange?.presets.from
    ? parseDate(interactiveTimeRange?.presets.from).getTime()
    : undefined;
  const timeRangeToTime = interactiveTimeRange?.presets.to
    ? parseDate(interactiveTimeRange?.presets.to).getTime()
    : undefined;
  const timeRangeFilters = React.useMemo(() => {
    const timeRangeFilter: ValuePredicate | null =
      timeRangeFromTime && timeRangeToTime
        ? (d: Observation) => {
            const time = getTimeRangeTime(d).getTime();
            return time >= timeRangeFromTime && time <= timeRangeToTime;
          }
        : null;

    return timeRangeFilter ? [timeRangeFilter] : [];
  }, [timeRangeFromTime, timeRangeToTime, getTimeRangeTime]);

  // interactive time range
  const interactiveFromTime = timeRange.from?.getTime();
  const interactiveToTime = timeRange.to?.getTime();
  const interactiveTimeRangeFilters = React.useMemo(() => {
    const interactiveTimeRangeFilter: ValuePredicate | null =
      getXAsDate &&
      interactiveFromTime &&
      interactiveToTime &&
      interactiveTimeRange?.active
        ? (d: Observation) => {
            const time = getXAsDate(d).getTime();
            return time >= interactiveFromTime && time <= interactiveToTime;
          }
        : null;

    return interactiveTimeRangeFilter ? [interactiveTimeRangeFilter] : [];
  }, [
    getXAsDate,
    interactiveFromTime,
    interactiveToTime,
    interactiveTimeRange,
  ]);

  // interactive time slider
  const animationField = getAnimationField(chartConfig);
  const dynamicScales = animationField?.dynamicScales ?? true;
  const animationComponentIri = animationField?.componentIri ?? "";
  const getAnimationDate = useTemporalVariable(animationComponentIri);
  const getAnimationOrdinalDate = useStringVariable(animationComponentIri);
  const interactiveTimeSliderFilters = React.useMemo(() => {
    const interactiveTimeSliderFilter: ValuePredicate | null =
      animationField?.componentIri && timeSlider.value
        ? (d: Observation) => {
            if (timeSlider.type === "interval") {
              return (
                getAnimationDate(d).getTime() === timeSlider.value!.getTime()
              );
            }

            const ordinalDate = getAnimationOrdinalDate(d);
            return ordinalDate === timeSlider.value!;
          }
        : null;

    return interactiveTimeSliderFilter ? [interactiveTimeSliderFilter] : [];
  }, [
    animationField?.componentIri,
    timeSlider.type,
    timeSlider.value,
    getAnimationDate,
    getAnimationOrdinalDate,
  ]);

  // interactive legend
  const legend = interactiveFiltersConfig?.legend;
  const legendItems = Object.keys(categories);
  const interactiveLegendFilters = React.useMemo(() => {
    const interactiveLegendFilter: ValuePredicate | null =
      legend?.active && getSegmentAbbreviationOrLabel
        ? (d: Observation) => {
            return !legendItems.includes(getSegmentAbbreviationOrLabel(d));
          }
        : null;

    return interactiveLegendFilter ? [interactiveLegendFilter] : [];
  }, [getSegmentAbbreviationOrLabel, legend?.active, legendItems]);

  const chartData = React.useMemo(() => {
    return observations.filter(
      overEvery([
        ...interactiveLegendFilters,
        ...interactiveTimeRangeFilters,
        ...interactiveTimeSliderFilters,
      ])
    );
  }, [
    observations,
    interactiveLegendFilters,
    interactiveTimeRangeFilters,
    interactiveTimeSliderFilters,
  ]);

  const scalesData = React.useMemo(() => {
    if (dynamicScales) {
      return chartData;
    } else {
      return observations.filter(
        overEvery([...interactiveLegendFilters, ...interactiveTimeRangeFilters])
      );
    }
  }, [
    dynamicScales,
    chartData,
    observations,
    interactiveLegendFilters,
    interactiveTimeRangeFilters,
  ]);

  const segmentData = React.useMemo(() => {
    return observations.filter(overEvery(interactiveTimeRangeFilters));
  }, [observations, interactiveTimeRangeFilters]);

  const timeRangeData = React.useMemo(() => {
    return observations.filter(overEvery(timeRangeFilters));
  }, [observations, timeRangeFilters]);

  const paddingData = React.useMemo(() => {
    if (dynamicScales) {
      return chartData;
    } else {
      return observations.filter(overEvery(interactiveLegendFilters));
    }
  }, [dynamicScales, chartData, observations, interactiveLegendFilters]);

  return {
    chartData,
    scalesData,
    segmentData,
    timeRangeData,
    paddingData,
  };
};

// TODO: base this on UI encodings?
export type InteractiveXTimeRangeState = {
  xScaleTimeRange: ScaleTime<number, number>;
};
