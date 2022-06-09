import {
  ascending,
  descending,
  extent,
  max,
  min,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
  ScaleTime,
} from "d3";
import { get, keyBy, sortBy } from "lodash";
import { ReactNode, useCallback, useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
import {
  getLabelWithUnit,
  useOptionalNumericVariable,
  usePreparedData,
  useSegment,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnFields, SortingOrder, SortingType } from "@/configurator";
import {
  formatNumberWithUnit,
  getPalette,
  mkNumber,
  useErrorMeasure,
  useErrorRange,
  useErrorVariable,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { TimeUnit } from "@/graphql/query-hooks";
import { makeOrdinalDimensionSorter } from "@/utils/sorting-values";

export interface ColumnsState {
  chartType: "column";
  bounds: Bounds;
  preparedData: Observation[];
  allData: Observation[];
  getX: (d: Observation) => string;
  getXAsDate: (d: Observation) => Date;
  xIsTime: boolean;
  timeUnit: TimeUnit | undefined;
  xScale: ScaleBand<string>;
  xEntireScale: ScaleTime<number, number>;
  xScaleInteraction: ScaleBand<string>;
  getY: (d: Observation) => number | null;
  getYErrorRange: null | ((d: Observation) => [number, number]);
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (segment: string) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  getAnnotationInfo: (d: Observation) => TooltipInfo;
  showStandardError: boolean;
}

const useColumnsState = (
  chartProps: Pick<
    ChartProps,
    "data" | "measures" | "dimensions" | "interactiveFiltersConfig"
  > & {
    fields: ColumnFields;
    aspectRatio: number;
  }
): ColumnsState => {
  const {
    data,
    fields,
    measures,
    dimensions,
    interactiveFiltersConfig,
    aspectRatio,
  } = chartProps;
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const timeFormatUnit = useTimeFormatUnit();
  const [interactiveFilters] = useInteractiveFilters();

  const xDimension = dimensions.find((d) => d.iri === fields.x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xIsTime = xDimension.__typename === "TemporalDimension";

  const timeUnit =
    xDimension.__typename === "TemporalDimension"
      ? xDimension.timeUnit
      : undefined;

  const getX = useStringVariable(fields.x.componentIri);
  const getXAsDate = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const errorMeasure = useErrorMeasure(chartProps, fields.y.componentIri);
  const getYErrorRange = useErrorRange(errorMeasure, getY);
  const getYError = useErrorVariable(errorMeasure);
  const getSegment = useSegment(fields.segment?.componentIri);
  const showStandardError = get(fields, ["y", "showStandardError"], true);

  const { segmentValuesByValue } = useMemo(() => {
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    ) || { values: [] };
    return {
      segmentValuesByValue: keyBy(segmentDimension.values, (x) => x.value),
      segmentValuesByLabel: keyBy(segmentDimension.values, (x) => x.label),
    };
  }, [dimensions, fields.segment?.componentIri]);

  /** When segment values are IRIs, we need to find show the label */
  const getSegmentLabel = useCallback(
    (segment: string): string => {
      return segmentValuesByValue[segment]?.label || segment;
    },
    [segmentValuesByValue]
  );

  const sortingType = fields.x.sorting?.sortingType;
  const sortingOrder = fields.x.sorting?.sortingOrder;

  // All data
  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  // Data for chart
  const preparedData = usePreparedData({
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData,
    interactiveFilters,
    getX: getXAsDate,
  });

  // x
  const bandDomain = [...new Set(preparedData.map(getX))];
  const xScale = scaleBand()
    .domain(bandDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);
  const xScaleInteraction = scaleBand()
    .domain(bandDomain)
    .paddingInner(0)
    .paddingOuter(0);

  // x as time, needs to be memoized!
  const xEntireDomainAsTime = useMemo(
    () => extent(sortedData, (d) => getXAsDate(d)) as [Date, Date],
    [getXAsDate, sortedData]
  );
  const xEntireScale = scaleTime().domain(xEntireDomainAsTime);

  // y
  const minValue = Math.min(
    min(preparedData, (d) =>
      getYErrorRange ? getYErrorRange(d)[0] : getY(d)
    ) ?? 0,
    0
  );
  const maxValue = Math.max(
    max(preparedData, (d) =>
      getYErrorRange ? getYErrorRange(d)[1] : getY(d)
    ) ?? 0,
    0
  );

  const yScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const { left, bottom } = useChartPadding(
    yScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain
  );

  const margins = {
    top: 50,
    right: 40,
    bottom: bottom + BOTTOM_MARGIN_OFFSET,
    left: left + LEFT_MARGIN_OFFSET,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * aspectRatio;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // segments
  const segments = useMemo(() => {
    return Array.from(new Set(sortedData.map(getSegment)));
  }, [getSegment, sortedData]);
  const sortedSegments = useMemo(() => {
    const rawSegments = getPalette(fields.segment?.palette);
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    );
    const sorter =
      segmentDimension?.__typename === "OrdinalDimension"
        ? makeOrdinalDimensionSorter(segmentDimension)
        : null;
    return sorter ? sortBy(rawSegments, sorter) : rawSegments;
  }, [fields.segment?.palette, fields.segment?.componentIri, dimensions]);
  const colors = scaleOrdinal(sortedSegments).domain(segments);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(Math.max(getY(datum) ?? NaN, 0));
    const yAnchor = yRef;

    const yPlacement = "top";

    const getXPlacement = () => {
      if (xRef + xOffset * 2 > 0.75 * chartWidth) {
        return "left";
      } else if (xRef < 0.25 * chartWidth) {
        return "right";
      } else {
        return "center";
      }
    };
    const xPlacement = getXPlacement();

    const getXAnchor = () => {
      return xPlacement === "right"
        ? xRef
        : xPlacement === "center"
        ? xRef + xOffset
        : xRef + xOffset * 2;
    };
    const xAnchor = getXAnchor();

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(value, formatNumber, yMeasure.unit);

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue:
        xIsTime && timeUnit
          ? timeFormatUnit(getX(datum), timeUnit)
          : getX(datum),
      datum: {
        label: fields.segment?.componentIri && getSegment(datum),
        value: `${yValueFormatter(getY(datum))}`,
        error: getYError
          ? `${getYError(datum)}${errorMeasure?.unit ?? ""}`
          : undefined,
        color: colors(getSegment(datum)) as string,
      },
      values: undefined,
    };
  };

  return {
    chartType: "column",
    bounds,
    preparedData,
    allData: sortedData,
    getX,
    getXAsDate,
    xScale,
    xEntireScale,
    xIsTime,
    timeUnit,
    xScaleInteraction,
    getY,
    getYErrorRange,
    yScale,
    getSegment,
    getSegmentLabel,
    yAxisLabel,
    segments,
    colors,
    getAnnotationInfo,
    showStandardError,
  };
};

const ColumnChartProvider = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "measures" | "dimensions" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useColumnsState({
    data,
    fields,
    measures,
    dimensions,
    interactiveFiltersConfig,
    aspectRatio,
  });
  console.log({ state });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ColumnChart = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "measures" | "dimensions" | "interactiveFiltersConfig"
> & {
  aspectRatio: number;
  children: ReactNode;
  fields: ColumnFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <ColumnChartProvider
          data={data}
          fields={fields}
          measures={measures}
          dimensions={dimensions}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </ColumnChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getX,
  getY,
  sortingType,
  sortingOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  getY: (d: Observation) => number | null;
  sortingType?: SortingType;
  sortingOrder?: SortingOrder;
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => descending(getY(a) ?? NaN, getY(b) ?? NaN));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getY(a) ?? NaN, getY(b) ?? NaN));
  } else {
    // default to ascending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
