import { ascending, max, min, descending } from "d3";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";

import { ReactNode, useMemo, useCallback, useEffect } from "react";
import { ColumnFields, SortingOrder, SortingType } from "../../configurator";
import {
  getPalette,
  mkNumber,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { TooltipInfo } from "../shared/interaction/tooltip";
import { PADDING_INNER, PADDING_OUTER } from "./constants";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { BOTTOM_MARGIN_OFFSET, LEFT_MARGIN_OFFSET } from "./constants";
import { Observation } from "../../domain/data";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "../shared/use-interactive-filters";
const WITH_TIME_BRUSH = true;
const BRUSH_SPACE = 100;
export interface ColumnsState {
  bounds: Bounds;
  sortedData: Observation[];
  getX: (d: Observation) => string;
  xScale: ScaleBand<string>;
  xEntireScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  getY: (d: Observation) => number;
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
  aspectRatio,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: ColumnFields;
  aspectRatio: number;
}): ColumnsState => {
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const [
    interactiveFilters,
    dispatchInteractiveFilters,
  ] = useInteractiveFilters();

  const getX = useCallback(
    (d: Observation): string => d[fields.x.componentIri] as string,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation): number => +d[fields.y.componentIri],
    [fields.y.componentIri]
  );
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );

  // Sort data
  const sortingType = fields.x.sorting?.sortingType;
  const sortingOrder = fields.x.sorting?.sortingOrder;

  /** Data: *all* observations, used for brushing
   */
  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  /** Prepare Data for use in chart
   * !== data used in some other components like Brush
   * based on *all* data observations.
   */
  const { from, to } = interactiveFilters.time;
  console.log("from to in column state", from, to);
  const preparedData = useMemo(() => {
    const prepData =
      (from || from === 0) && to ? sortedData.slice(from, to + 1) : sortedData;
    return prepData;
  }, [from, to, sortedData]);
  console.log("preparedData", preparedData);

  // x
  const bandDomain = [...new Set(preparedData.map((d) => getX(d) as string))];
  const xScale = scaleBand()
    .domain(bandDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);
  const xScaleInteraction = scaleBand()
    .domain(bandDomain)
    .paddingInner(0)
    .paddingOuter(0);

  const bandEntireDomain = useMemo(
    () => [...new Set(sortedData.map((d) => getX(d) as string))],
    [getX, sortedData]
  );
  const xEntireScale = scaleBand()
    .domain(bandEntireDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);

  // This effect initiates the interactive time filter
  // and resets interactive categories filtering
  // FIXME: use presets
  useEffect(() => {
    dispatchInteractiveFilters({
      type: "ADD_TIME_FILTER",
      value: [0, bandEntireDomain.length - 1],
    });
  }, [dispatchInteractiveFilters, bandEntireDomain]);

  // y
  const minValue = Math.min(mkNumber(min(preparedData, (d) => getY(d))), 0);
  const maxValue = max(preparedData, (d) => getY(d)) as number;
  const entireMaxValue = max(sortedData, getY) as number;

  const yScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();
  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  // Dimensions
  const left = WITH_TIME_BRUSH
    ? Math.max(
        estimateTextWidth(formatNumber(entireMaxValue)),
        // Account for width of time slider selection
        estimateTextWidth(xEntireScale.domain()[0], 12) * 2 + 20
      )
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = max(bandDomain, (d) => estimateTextWidth(d)) || 70;
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
    height: chartHeight + margins.top + margins.bottom + BRUSH_SPACE,
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
    const yRef = yScale(Math.max(getY(datum), 0));
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
      xValue: getX(datum),
      datum: {
        label: fields.segment?.componentIri && getSegment(datum),
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: undefined,
    };
  };

  return {
    bounds,
    sortedData,
    getX,
    xScale,
    xEntireScale,
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
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useColumnsState({
    data,
    fields,
    measures,
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
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  aspectRatio: number;
  children: ReactNode;
  fields: ColumnFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <InteractiveFiltersProvider>
          <ColumnChartProvider
            data={data}
            fields={fields}
            measures={measures}
            aspectRatio={aspectRatio}
          >
            {children}
          </ColumnChartProvider>
        </InteractiveFiltersProvider>
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
  getY: (d: Observation) => number;
  sortingType?: SortingType;
  sortingOrder?: SortingOrder;
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else {
    // default to ascending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
