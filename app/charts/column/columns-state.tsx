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
import { ReactNode, useCallback, useMemo } from "react";
import { ColumnFields, SortingOrder, SortingType } from "../../configurator";
import {
  getPalette,
  mkNumber,
  parseDate,
  useFormatNumber,
  useTimeFormatUnit,
} from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { TimeUnit } from "../../graphql/query-hooks";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { BRUSH_BOTTOM_SPACE } from "../shared/brush";
import { getLabelWithUnit, usePreparedData } from "../shared/chart-helpers";
import { TooltipInfo } from "../shared/interaction/tooltip";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { useInteractiveFilters } from "../shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "./constants";

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
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  getAnnotationInfo: (d: Observation) => TooltipInfo;
}

const useColumnsState = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
}: Pick<
  ChartProps,
  "data" | "measures" | "dimensions" | "interactiveFiltersConfig"
> & {
  fields: ColumnFields;
  aspectRatio: number;
}): ColumnsState => {
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

  const getX = useCallback(
    (d: Observation): string => `${d[fields.x.componentIri]}`,
    [fields.x.componentIri]
  );
  const getXAsDate = useCallback(
    (d: Observation): Date => parseDate(`${d[fields.x.componentIri]}`),
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation): number | null => {
      const v = d[fields.y.componentIri];
      return v !== null ? +v : null;
    },
    [fields.y.componentIri]
  );
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment && fields.segment.componentIri
        ? `${d[fields.segment.componentIri]}`
        : "segment",
    [fields.segment]
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
  const minValue = Math.min(min(preparedData, (d) => getY(d)) ?? 0, 0);
  const maxValue = max(preparedData, (d) => getY(d)) ?? 0;
  const entireMaxValue = max(sortedData, getY) as number;

  const yScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  // Dimensions
  const left = interactiveFiltersConfig?.time.active
    ? estimateTextWidth(formatNumber(entireMaxValue))
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );

  const bottom = interactiveFiltersConfig?.time.active
    ? (max(bandDomain, (d) => estimateTextWidth(d)) || 70) + BRUSH_BOTTOM_SPACE
    : max(bandDomain, (d) => estimateTextWidth(d)) || 70;
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
  const segments = Array.from(new Set(sortedData.map((d) => getSegment(d))));
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(Math.max(getY(datum) ?? NaN, 0));
    const yAnchor = yRef;

    const yPlacement = yAnchor < chartHeight * 0.33 ? "middle" : "top";

    const getXPlacement = () => {
      if (yPlacement === "top") {
        return xRef < chartWidth * 0.33
          ? "right"
          : xRef > chartWidth * 0.66
          ? "left"
          : "center";
      } else {
        // yPlacement === "middle"
        return xRef < chartWidth * 0.5 ? "right" : "left";
      }
    };
    const xPlacement = getXPlacement();

    const getXAnchor = () => {
      if (yPlacement === "top") {
        return xPlacement === "right"
          ? xRef
          : xPlacement === "center"
          ? xRef + xOffset
          : xRef + xOffset * 2;
      } else {
        // yPlacement === "middle"
        return xPlacement === "right" ? xRef + xOffset * 2 : xRef;
      }
    };
    const xAnchor = getXAnchor();

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
        value: yMeasure.unit
          ? `${formatNumber(getY(datum))} ${yMeasure.unit}`
          : formatNumber(getY(datum)),
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
    yScale,
    getSegment,
    yAxisLabel,
    segments,
    colors,
    getAnnotationInfo,
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
