import { max, min } from "d3-array";
import { ScaleTime } from "d3-scale";
import get from "lodash/get";
import overEvery from "lodash/overEvery";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { createContext, useCallback, useContext, useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
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
import {
  getLabelWithUnit,
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  useStringVariable,
  useTemporalEntityVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { DimensionsById, MeasuresById } from "@/charts/shared/ChartProps";
import { Bounds } from "@/charts/shared/use-size";
import { TableChartState } from "@/charts/table/table-state";
import { useLimits } from "@/config-utils";
import {
  AreaFields,
  BarFields,
  ChartConfig,
  ChartSegmentField,
  ChartType,
  ColumnFields,
  GenericField,
  getAnimationField,
  hasChartConfigs,
  InteractiveFiltersConfig,
  LineFields,
  PieFields,
  ScatterPlotFields,
  useConfiguratorState,
} from "@/configurator";
import {
  parseDate,
  useErrorMeasure,
  useErrorRange,
  useErrorVariable,
} from "@/configurator/components/ui-helpers";
import {
  Dimension,
  DimensionValue,
  GeoCoordinatesDimension,
  GeoShapesDimension,
  isNumericalMeasure,
  isTemporalDimension,
  isTemporalEntityDimension,
  Measure,
  NumericalMeasure,
  Observation,
  TemporalDimension,
  TemporalEntityDimension,
} from "@/domain/data";
import { Has } from "@/domain/types";
import { RelatedDimensionType } from "@/graphql/query-hooks";
import { ScaleType, TimeUnit } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import { Limit } from "@/rdf/limits";
import {
  useChartInteractiveFilters,
  useDashboardInteractiveFilters,
} from "@/stores/interactive-filters";

export type ChartState =
  | AreasState
  | ColumnsState
  | StackedColumnsState
  | GroupedColumnsState
  | BarsState
  | StackedBarsState
  | GroupedBarsState
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
export const ChartContext = createContext<ChartState>(undefined);

export const useChartState = () => {
  const ctx = useContext(ChartContext);
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
  | LinesState
  | ComboLineSingleState
  | ComboLineColumnState
  | ComboLineDualState;

export type ChartWithInteractiveYTimeRangeState = BarsState;

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

/** Generally, each chart should use sorted data, according to its own needs.
 * Usually it means sorting by X axis.
 */
export type SortingVariables<T = undefined> = T extends undefined
  ? {
      sortData: (data: Observation[]) => Observation[];
    }
  : {
      sortData: (data: Observation[], options: T) => Observation[];
    };

export type BaseVariables = {
  interactiveFiltersConfig: InteractiveFiltersConfig;
};

export const useBaseVariables = (chartConfig: ChartConfig): BaseVariables => {
  return {
    interactiveFiltersConfig: chartConfig.interactiveFiltersConfig,
  };
};

export type BandYVariables = {
  yAxisLabel: string;
  yDimension: Dimension;
  getY: StringValueGetter;
  getYLabel: (d: string) => string;
  getYAbbreviationOrLabel: (d: Observation) => string;
  yTimeUnit: TimeUnit | undefined;
  getYAsDate: TemporalValueGetter;
};

export type BandXVariables = {
  xAxisLabel: string;
  xDimension: Dimension;
  getX: StringValueGetter;
  getXLabel: (d: string) => string;
  getXAbbreviationOrLabel: (d: Observation) => string;
  xTimeUnit: TimeUnit | undefined;
  getXAsDate: TemporalValueGetter;
};

export const useBandYVariables = (
  y: GenericField,
  {
    dimensionsById,
    observations,
  }: {
    dimensionsById: DimensionsById;
    observations: Observation[];
  }
): BandYVariables => {
  const yDimension = dimensionsById[y.componentId];
  if (!yDimension) {
    throw Error(`No dimension <${y.componentId}> in cube! (useBandXVariables)`);
  }

  const yTimeUnit = isTemporalDimension(yDimension)
    ? yDimension.timeUnit
    : undefined;

  const {
    getAbbreviationOrLabelByValue: getYAbbreviationOrLabel,
    getValue: getY,
    getLabel: getYLabel,
  } = useDimensionWithAbbreviations(yDimension, {
    observations,
    field: y,
  });

  const getYAsDate = useTemporalVariable(y.componentId);
  const getYTemporalEntity = useTemporalEntityVariable(
    dimensionsById[y.componentId].values
  )(y.componentId);

  const yAxisLabel = getLabelWithUnit(yDimension);

  return {
    yAxisLabel,
    yDimension,
    getY,
    getYLabel,
    getYAbbreviationOrLabel,
    yTimeUnit,
    getYAsDate: isTemporalEntityDimension(yDimension)
      ? getYTemporalEntity
      : getYAsDate,
  };
};

export const useBandXVariables = (
  x: GenericField,
  {
    dimensionsById,
    observations,
  }: {
    dimensionsById: DimensionsById;
    observations: Observation[];
  }
): BandXVariables => {
  const xDimension = dimensionsById[x.componentId];
  if (!xDimension) {
    throw Error(`No dimension <${x.componentId}> in cube! (useBandXVariables)`);
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

  const getXAsDate = useTemporalVariable(x.componentId);
  const getXTemporalEntity = useTemporalEntityVariable(
    dimensionsById[x.componentId].values
  )(x.componentId);

  const xAxisLabel = getLabelWithUnit(xDimension);

  return {
    xAxisLabel,
    xDimension,
    getX,
    getXLabel,
    getXAbbreviationOrLabel,
    xTimeUnit,
    getXAsDate: isTemporalEntityDimension(xDimension)
      ? getXTemporalEntity
      : getXAsDate,
  };
};

export type TemporalXVariables = {
  xDimension: TemporalDimension | TemporalEntityDimension;
  getX: TemporalValueGetter;
  getXAsString: StringValueGetter;
  xAxisLabel: string;
};

export const useTemporalXVariables = (
  x: GenericField,
  { dimensionsById }: { dimensionsById: DimensionsById }
): TemporalXVariables => {
  const xDimension = dimensionsById[x.componentId];
  if (!xDimension) {
    throw Error(
      `No dimension <${x.componentId}> in cube! (useTemporalXVariables)`
    );
  }

  if (
    !isTemporalDimension(xDimension) &&
    !isTemporalEntityDimension(xDimension)
  ) {
    throw Error(`Dimension <${x.componentId}> is not temporal!`);
  }

  const getXTemporal = useTemporalVariable(x.componentId);
  const dimensionValues = dimensionsById[x.componentId].values;
  const relatedLimitValues = dimensionsById[x.componentId].relatedLimitValues;
  const values = uniqBy(
    [...dimensionValues, ...relatedLimitValues],
    (d) => d.value
  );
  const getXTemporalEntity = useTemporalEntityVariable(values)(x.componentId);
  const getXAsString = useStringVariable(x.componentId);

  const xAxisLabel = getLabelWithUnit(xDimension);

  return {
    xAxisLabel,
    xDimension,
    getX: isTemporalDimension(xDimension) ? getXTemporal : getXTemporalEntity,
    getXAsString,
  };
};

export const shouldUseDynamicMinScaleValue = (scaleType?: ScaleType) => {
  return scaleType === ScaleType.Interval;
};

export type NumericalXVariables = {
  xMeasure: NumericalMeasure;
  getX: NumericalValueGetter;
  xAxisLabel: string;
  /** Depending on xMeasure's scale type, it can either be 0 or dynamically
   * based on available data. */
  getMinX: (data: Observation[], getX: NumericalValueGetter) => number;
};

export const useNumericalXVariables = (
  chartType: "scatterplot" | "bar",
  x: ScatterPlotFields["x"] | BarFields["x"],
  { measuresById }: { measuresById: MeasuresById }
): NumericalXVariables => {
  const locale = useLocale();
  const xMeasure = measuresById[x.componentId];
  if (!xMeasure) {
    throw Error(
      `No dimension <${x.componentId}> in cube! (useNumericalXVariables)`
    );
  }

  if (!isNumericalMeasure(xMeasure)) {
    throw Error(`Measure <${x.componentId}> is not numerical!`);
  }

  const getRawX = useOptionalNumericVariable(x.componentId);
  const getX = useCallback(
    (d: Observation) => {
      const rawX = getRawX(d);

      if (rawX === null) {
        return null;
      }

      return rawX * (x.unitConversion?.factor ?? 1);
    },
    [getRawX, x.unitConversion?.factor]
  );

  const xAxisLabel = getLabelWithUnit(xMeasure, {
    unitOverride: x.unitConversion?.labels[locale],
  });
  const getMinX = useCallback(
    (data: Observation[], _getX: NumericalValueGetter) => {
      switch (chartType) {
        case "bar":
          return Math.min(0, min(data, _getX) ?? 0);
        case "scatterplot":
          return shouldUseDynamicMinScaleValue(xMeasure.scaleType)
            ? (min(data, _getX) ?? 0)
            : Math.min(0, min(data, _getX) ?? 0);
        default:
          const _exhaustiveCheck: never = chartType;
          return _exhaustiveCheck;
      }
    },
    [chartType, xMeasure.scaleType]
  );

  return {
    xMeasure,
    getX,
    xAxisLabel,
    getMinX,
  };
};

export type NumericalYVariables = {
  yMeasure: NumericalMeasure;
  getY: NumericalValueGetter;
  yAxisLabel: string;
  /** Depending on yMeasure's scale type, it can either be 0 or dynamically
   * based on available data. */
  getMinY: (data: Observation[], getY: NumericalValueGetter) => number;
};

export const useNumericalYVariables = (
  // Combo charts have their own logic for y scales.
  chartType: "area" | "column" | "line" | "pie" | "scatterplot",
  y:
    | AreaFields["y"]
    | ColumnFields["y"]
    | LineFields["y"]
    | PieFields["y"]
    | ScatterPlotFields["y"],
  { measuresById }: { measuresById: MeasuresById }
): NumericalYVariables => {
  const locale = useLocale();
  const yMeasure = measuresById[y.componentId];

  if (!yMeasure) {
    throw Error(
      `No dimension <${y.componentId}> in cube! (useNumericalYVariables)`
    );
  }

  if (!isNumericalMeasure(yMeasure)) {
    throw Error(`Measure <${y.componentId}> is not numerical!`);
  }

  const getRawY = useOptionalNumericVariable(y.componentId);
  const getY = useCallback(
    (d: Observation) => {
      const rawY = getRawY(d);

      if (rawY === null) {
        return null;
      }

      return rawY * (y.unitConversion?.factor ?? 1);
    },
    [getRawY, y.unitConversion?.factor]
  );

  const yAxisLabel = getLabelWithUnit(yMeasure, {
    unitOverride: y.unitConversion?.labels[locale],
  });
  const getMinY = useCallback(
    (data: Observation[], _getY: NumericalValueGetter) => {
      switch (chartType) {
        case "area":
        case "column":
        case "pie":
          return Math.min(0, min(data, _getY) ?? 0);
        case "line":
        case "scatterplot":
          return shouldUseDynamicMinScaleValue(yMeasure.scaleType)
            ? (min(data, _getY) ?? 0)
            : Math.min(0, min(data, _getY) ?? 0);
        default:
          const _exhaustiveCheck: never = chartType;
          return _exhaustiveCheck;
      }
    },
    [chartType, yMeasure.scaleType]
  );

  return {
    yMeasure,
    getY,
    yAxisLabel,
    getMinY,
  };
};

export type NumericalYErrorVariables = {
  showYUncertainty: boolean;
  getYErrorPresent: (d: Observation) => boolean;
  getYErrorRange: null | ((d: Observation) => [number, number]);
  getFormattedYUncertainty: (d: Observation) => string | undefined;
};

export type NumericalXErrorVariables = {
  showXUncertainty: boolean;
  getXErrorPresent: (d: Observation) => boolean;
  getXErrorRange: null | ((d: Observation) => [number, number]);
  getFormattedXUncertainty: (d: Observation) => string | undefined;
};

export const useNumericalYErrorVariables = (
  y: GenericField,
  {
    getValue,
    dimensions,
    measures,
  }: {
    getValue: NumericalYVariables["getY"];
    dimensions: Dimension[];
    measures: Measure[];
  }
): NumericalYErrorVariables => {
  const showYStandardError = get(y, ["showStandardError"], true);
  const yStandardErrorMeasure = useErrorMeasure(y.componentId, {
    dimensions,
    measures,
    type: RelatedDimensionType.StandardError,
  });
  const getYStandardError = useErrorVariable(yStandardErrorMeasure);

  const showYConfidenceInterval = get(y, ["showConfidenceInterval"], true);
  const yConfidenceIntervalUpperMeasure = useErrorMeasure(y.componentId, {
    dimensions,
    measures,
    type: RelatedDimensionType.ConfidenceUpperBound,
  });
  const getYConfidenceIntervalUpper = useErrorVariable(
    yConfidenceIntervalUpperMeasure
  );
  const yConfidenceIntervalLowerMeasure = useErrorMeasure(y.componentId, {
    dimensions,
    measures,
    type: RelatedDimensionType.ConfidenceLowerBound,
  });
  const getYConfidenceIntervalLower = useErrorVariable(
    yConfidenceIntervalLowerMeasure
  );

  const getYErrorPresent = useCallback(
    (d: Observation) => {
      return (
        (showYStandardError && getYStandardError?.(d) !== null) ||
        (showYConfidenceInterval &&
          getYConfidenceIntervalUpper?.(d) !== null &&
          getYConfidenceIntervalLower?.(d) !== null)
      );
    },
    [
      showYStandardError,
      getYStandardError,
      showYConfidenceInterval,
      getYConfidenceIntervalUpper,
      getYConfidenceIntervalLower,
    ]
  );
  const getYErrorRange = useErrorRange(
    showYStandardError && yStandardErrorMeasure
      ? yStandardErrorMeasure
      : yConfidenceIntervalUpperMeasure,
    showYStandardError && yStandardErrorMeasure
      ? yStandardErrorMeasure
      : yConfidenceIntervalLowerMeasure,
    getValue
  );
  const getFormattedYUncertainty = useCallback(
    (d: Observation) => {
      if (
        showYStandardError &&
        getYStandardError &&
        getYStandardError(d) !== null
      ) {
        const sd = getYStandardError(d);
        const unit = yStandardErrorMeasure?.unit ?? "";
        return ` ± ${sd}${unit}`;
      }

      if (
        showYConfidenceInterval &&
        getYConfidenceIntervalUpper &&
        getYConfidenceIntervalLower &&
        getYConfidenceIntervalUpper(d) !== null &&
        getYConfidenceIntervalLower(d) !== null
      ) {
        const cil = getYConfidenceIntervalLower(d);
        const ciu = getYConfidenceIntervalUpper(d);
        const unit = yConfidenceIntervalUpperMeasure?.unit ?? "";
        return `, [-${cil}${unit}, +${ciu}${unit}]`;
      }
    },
    [
      showYStandardError,
      getYStandardError,
      showYConfidenceInterval,
      getYConfidenceIntervalUpper,
      getYConfidenceIntervalLower,
      yStandardErrorMeasure?.unit,
      yConfidenceIntervalUpperMeasure?.unit,
    ]
  );

  return {
    showYUncertainty:
      (showYStandardError && !!yStandardErrorMeasure) ||
      (showYConfidenceInterval &&
        !!yConfidenceIntervalUpperMeasure &&
        !!yConfidenceIntervalLowerMeasure),
    getYErrorPresent,
    getYErrorRange,
    getFormattedYUncertainty,
  };
};

export const useNumericalXErrorVariables = (
  x: GenericField,
  {
    getValue,
    dimensions,
    measures,
  }: {
    getValue: NumericalXVariables["getX"];
    dimensions: Dimension[];
    measures: Measure[];
  }
): NumericalXErrorVariables => {
  const showXStandardError = get(x, ["showStandardError"], true);
  const xStandardErrorMeasure = useErrorMeasure(x.componentId, {
    dimensions,
    measures,
    type: RelatedDimensionType.StandardError,
  });
  const getXStandardError = useErrorVariable(xStandardErrorMeasure);

  const showXConfidenceInterval = get(x, ["showConfidenceInterval"], true);
  const xConfidenceIntervalUpperMeasure = useErrorMeasure(x.componentId, {
    dimensions,
    measures,
    type: RelatedDimensionType.ConfidenceUpperBound,
  });
  const getXConfidenceIntervalUpper = useErrorVariable(
    xConfidenceIntervalUpperMeasure
  );
  const xConfidenceIntervalLowerMeasure = useErrorMeasure(x.componentId, {
    dimensions,
    measures,
    type: RelatedDimensionType.ConfidenceLowerBound,
  });
  const getXConfidenceIntervalLower = useErrorVariable(
    xConfidenceIntervalLowerMeasure
  );

  const getXErrorPresent = useCallback(
    (d: Observation) => {
      return (
        (showXStandardError && getXStandardError?.(d) !== null) ||
        (showXConfidenceInterval &&
          getXConfidenceIntervalUpper?.(d) !== null &&
          getXConfidenceIntervalLower?.(d) !== null)
      );
    },
    [
      showXStandardError,
      getXStandardError,
      showXConfidenceInterval,
      getXConfidenceIntervalUpper,
      getXConfidenceIntervalLower,
    ]
  );
  const getXErrorRange = useErrorRange(
    showXStandardError && xStandardErrorMeasure
      ? xStandardErrorMeasure
      : xConfidenceIntervalUpperMeasure,
    showXStandardError && xStandardErrorMeasure
      ? xStandardErrorMeasure
      : xConfidenceIntervalLowerMeasure,
    getValue
  );
  const getFormattedXUncertainty = useCallback(
    (d: Observation) => {
      if (
        showXStandardError &&
        getXStandardError &&
        getXStandardError(d) !== null
      ) {
        const sd = getXStandardError(d);
        const unit = xStandardErrorMeasure?.unit ?? "";
        return ` ± ${sd}${unit}`;
      }

      if (
        showXConfidenceInterval &&
        getXConfidenceIntervalUpper &&
        getXConfidenceIntervalLower &&
        getXConfidenceIntervalUpper(d) !== null &&
        getXConfidenceIntervalLower(d) !== null
      ) {
        const cil = getXConfidenceIntervalLower(d);
        const ciu = getXConfidenceIntervalUpper(d);
        const unit = xConfidenceIntervalUpperMeasure?.unit ?? "";
        return `, [-${cil}${unit}, +${ciu}${unit}]`;
      }
    },
    [
      showXStandardError,
      getXStandardError,
      showXConfidenceInterval,
      getXConfidenceIntervalUpper,
      getXConfidenceIntervalLower,
      xStandardErrorMeasure?.unit,
      xConfidenceIntervalUpperMeasure?.unit,
    ]
  );

  return {
    showXUncertainty:
      (showXStandardError && !!xStandardErrorMeasure) ||
      (showXConfidenceInterval &&
        !!xConfidenceIntervalUpperMeasure &&
        !!xConfidenceIntervalLowerMeasure),
    getXErrorPresent,
    getXErrorRange,
    getFormattedXUncertainty,
  };
};

export type SegmentVariables = {
  segmentDimension: Dimension | undefined;
  segmentsByAbbreviationOrLabel: Map<string, DimensionValue>;
  getSegment: StringValueGetter;
  getSegmentAbbreviationOrLabel: StringValueGetter;
  getSegmentLabel: (d: string) => string;
  showValuesBySegmentMapping: ChartSegmentField["showValuesMapping"];
};

export const useSegmentVariables = (
  segment: ChartSegmentField | undefined,
  {
    dimensionsById,
    observations,
  }: {
    dimensionsById: DimensionsById;
    observations: Observation[];
  }
): SegmentVariables => {
  const segmentDimension = dimensionsById[segment?.componentId ?? ""];
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
    showValuesBySegmentMapping: segment?.showValuesMapping ?? {},
  };
};

export type InteractiveFiltersVariables = {
  getTimeRangeDate: (d: Observation) => Date;
};

export const useInteractiveFiltersVariables = (
  interactiveFiltersConfig: ChartConfig["interactiveFiltersConfig"],
  { dimensionsById }: { dimensionsById: DimensionsById }
): InteractiveFiltersVariables => {
  const id = interactiveFiltersConfig?.timeRange.componentId ?? "";
  const dimension = dimensionsById[id];
  const getTimeRangeDate = useTemporalVariable(id);
  const dimensionValues = dimension?.values ?? [];
  const relatedLimitValues = dimension?.relatedLimitValues ?? [];
  const values = uniqBy(
    [...dimensionValues, ...relatedLimitValues],
    (d) => d.value
  );
  const getTimeRangeEntityDate = useTemporalEntityVariable(values)(id);

  return {
    getTimeRangeDate: isTemporalDimension(dimension)
      ? getTimeRangeDate
      : getTimeRangeEntityDate,
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

export type LimitsVariables = {
  minLimitValue: number | undefined;
  maxLimitValue: number | undefined;
};

export const useLimitsVariables = (limits: ReturnType<typeof useLimits>) => {
  const values = limits.limits.flatMap((d) => {
    switch (d.measureLimit.type) {
      case "single":
        return d.measureLimit.value;
      case "range":
        return [d.measureLimit.from, d.measureLimit.to];
      default:
        const _exhaustiveCheck: never = d.measureLimit;
        return _exhaustiveCheck;
    }
  });

  return {
    minLimitValue: min(values),
    maxLimitValue: max(values),
  };
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
    sortData,
    chartConfig,
    timeRangeDimensionId,
    axisDimensionId,
    limits,
    getAxisValueAsDate,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  }: {
    sortData?: (data: Observation[]) => Observation[];
    chartConfig: ChartConfig;
    timeRangeDimensionId: string | undefined;
    axisDimensionId?: string;
    limits?: Limit[];
    getAxisValueAsDate?: (d: Observation) => Date;
    getSegmentAbbreviationOrLabel?: (d: Observation) => string;
    getTimeRangeDate?: (d: Observation) => Date;
  }
): ChartStateData => {
  const { interactiveFiltersConfig } = chartConfig;
  const allData = useMemo(() => {
    let allData = observations;

    if (axisDimensionId && limits) {
      const dimensionValuesObservations = limits
        .flatMap((limit) => limit.related)
        .filter((limit) => limit.dimensionId === axisDimensionId)
        .map((d) => ({
          [axisDimensionId]: d.label,
        }));
      const axisObservationValues = uniq(
        observations.map((o) => o[axisDimensionId])
      );
      allData = [
        ...observations,
        ...dimensionValuesObservations.filter(
          (d) => !axisObservationValues.includes(d[axisDimensionId])
        ),
      ];
    }

    return sortData ? sortData(allData) : observations;
  }, [axisDimensionId, limits, observations, sortData]);

  const categories = useChartInteractiveFilters((d) => d.categories);
  const timeRange = useChartInteractiveFilters((d) => d.timeRange);
  const timeSlider = useChartInteractiveFilters((d) => d.timeSlider);

  // time range
  const interactiveTimeRange = interactiveFiltersConfig?.timeRange;
  const timeRangeFromTime = interactiveTimeRange?.presets.from
    ? parseDate(interactiveTimeRange?.presets.from).getTime()
    : undefined;
  const timeRangeToTime = interactiveTimeRange?.presets.to
    ? parseDate(interactiveTimeRange?.presets.to).getTime()
    : undefined;
  const timeRangeFilters = useMemo(() => {
    const timeRangeFilter: ValuePredicate | null =
      getTimeRangeDate && timeRangeFromTime && timeRangeToTime
        ? (d: Observation) => {
            const time = getTimeRangeDate(d).getTime();
            return time >= timeRangeFromTime && time <= timeRangeToTime;
          }
        : null;

    return timeRangeFilter ? [timeRangeFilter] : [];
  }, [timeRangeFromTime, timeRangeToTime, getTimeRangeDate]);

  // interactive time range
  const interactiveFromTime = timeRange.from?.getTime();
  const interactiveToTime = timeRange.to?.getTime();
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  const { potentialTimeRangeFilterIds } = useDashboardInteractiveFilters();
  const interactiveTimeRangeFilters = useMemo(() => {
    const interactiveTimeRangeFilter: ValuePredicate | null =
      getAxisValueAsDate &&
      interactiveFromTime &&
      interactiveToTime &&
      (interactiveTimeRange?.active ||
        (dashboardFilters?.timeRange.active &&
          timeRangeDimensionId &&
          potentialTimeRangeFilterIds.includes(timeRangeDimensionId)))
        ? (d: Observation) => {
            const time = getAxisValueAsDate(d).getTime();
            return time >= interactiveFromTime && time <= interactiveToTime;
          }
        : null;

    return interactiveTimeRangeFilter ? [interactiveTimeRangeFilter] : [];
  }, [
    getAxisValueAsDate,
    interactiveFromTime,
    interactiveToTime,
    interactiveTimeRange?.active,
    dashboardFilters?.timeRange.active,
    timeRangeDimensionId,
    potentialTimeRangeFilterIds,
  ]);

  // interactive time slider
  const animationField = getAnimationField(chartConfig);
  const dynamicScales = animationField?.dynamicScales ?? true;
  const animationComponentId = animationField?.componentId ?? "";
  const getAnimationDate = useTemporalVariable(animationComponentId);
  const getAnimationOrdinalDate = useStringVariable(animationComponentId);
  const interactiveTimeSliderFilters = useMemo(() => {
    const interactiveTimeSliderFilter: ValuePredicate | null =
      animationField?.componentId && timeSlider.value
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
    animationField?.componentId,
    timeSlider.type,
    timeSlider.value,
    getAnimationDate,
    getAnimationOrdinalDate,
  ]);

  // interactive legend
  const interactiveLegendFilters = useMemo(() => {
    const legendItems = Object.keys(categories);
    const interactiveLegendFilter: ValuePredicate | null =
      interactiveFiltersConfig?.legend?.active && getSegmentAbbreviationOrLabel
        ? (d: Observation) => {
            return !legendItems.includes(getSegmentAbbreviationOrLabel(d));
          }
        : null;

    return interactiveLegendFilter ? [interactiveLegendFilter] : [];
  }, [
    categories,
    getSegmentAbbreviationOrLabel,
    interactiveFiltersConfig?.legend?.active,
  ]);

  const chartData = useMemo(() => {
    return allData.filter(
      overEvery([
        ...interactiveLegendFilters,
        ...interactiveTimeRangeFilters,
        ...interactiveTimeSliderFilters,
      ])
    );
  }, [
    allData,
    interactiveLegendFilters,
    interactiveTimeRangeFilters,
    interactiveTimeSliderFilters,
  ]);

  const scalesData = useMemo(() => {
    if (dynamicScales) {
      return chartData;
    } else {
      return allData.filter(
        overEvery([...interactiveLegendFilters, ...interactiveTimeRangeFilters])
      );
    }
  }, [
    dynamicScales,
    chartData,
    allData,
    interactiveLegendFilters,
    interactiveTimeRangeFilters,
  ]);

  const segmentData = useMemo(() => {
    return allData.filter(overEvery(interactiveTimeRangeFilters));
  }, [allData, interactiveTimeRangeFilters]);

  const timeRangeData = useMemo(() => {
    return allData.filter(overEvery(timeRangeFilters));
  }, [allData, timeRangeFilters]);

  const paddingData = useMemo(() => {
    if (dynamicScales) {
      return chartData;
    } else {
      return allData.filter(overEvery(interactiveLegendFilters));
    }
  }, [dynamicScales, chartData, allData, interactiveLegendFilters]);

  return {
    allData,
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

export type InteractiveYTimeRangeState = {
  yScaleTimeRange: ScaleTime<number, number>;
};
