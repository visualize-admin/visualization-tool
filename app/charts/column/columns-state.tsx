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
import get from "lodash/get";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import { ReactNode, useCallback, useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
import {
  getLabelWithUnit,
  useDataAfterInteractiveFilters,
  useOptionalNumericVariable,
  usePlottableData,
  useSegment,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { CommonChartState } from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import { useMaybeAbbreviations } from "@/charts/shared/use-abbreviations";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnConfig, SortingOrder, SortingType } from "@/configurator";
import {
  useErrorMeasure,
  useErrorRange,
  useErrorVariable,
} from "@/configurator/components/ui-helpers";
import { isTemporalDimension, Observation } from "@/domain/data";
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import {
  DimensionMetadataFragment,
  TemporalDimension,
  TimeUnit,
} from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

export interface ColumnsState extends CommonChartState {
  chartType: "column";
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
  yAxisDimension: DimensionMetadataFragment;
  getAnnotationInfo: (d: Observation) => TooltipInfo;
  showStandardError: boolean;
}

const useColumnsState = (
  chartProps: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
    chartConfig: ColumnConfig;
    aspectRatio: number;
  }
): ColumnsState => {
  const { data, measures, dimensions, aspectRatio, chartConfig } = chartProps;
  const { interactiveFiltersConfig, fields } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();

  const dimensionsByIri = useMemo(
    () => Object.fromEntries(dimensions.map((d) => [d.iri, d])),
    [dimensions]
  );
  const xDimension = dimensionsByIri[fields.x.componentIri];
  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xIsTime = isTemporalDimension(xDimension);
  const timeUnit = xIsTime
    ? (xDimension as TemporalDimension).timeUnit
    : undefined;

  const { getAbbreviationOrLabelByValue: getX } = useMaybeAbbreviations({
    useAbbreviations: fields.x.useAbbreviations ?? false,
    dimension: xDimension,
  });

  const getXAsDate = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const errorMeasure = useErrorMeasure(chartProps, fields.y.componentIri);
  const getYErrorRange = useErrorRange(errorMeasure, getY);
  const getYError = useErrorVariable(errorMeasure);
  const getSegment = useSegment(fields.segment?.componentIri);
  const showStandardError = get(fields, ["y", "showStandardError"], true);

  const sortingType = fields.x.sorting?.sortingType;
  const sortingOrder = fields.x.sorting?.sortingOrder;

  // All data
  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  // Data
  const plottableSortedData = usePlottableData({
    data: sortedData,
    plotters: [getXAsDate, getY],
  });

  // Data for chart
  const { preparedData, scalesData } = useDataAfterInteractiveFilters({
    sortedData: plottableSortedData,
    interactiveFiltersConfig,
    getX: getXAsDate,
  });

  // Scales
  const { xScale, yScale, xEntireScale, xScaleInteraction, bandDomain } =
    useMemo(() => {
      // x
      const sorters = makeDimensionValueSorters(xDimension, {
        sorting: fields.x.sorting,
        useAbbreviations: fields.x.useAbbreviations,
        dimensionFilter: xDimension?.iri
          ? chartConfig.filters[xDimension?.iri]
          : undefined,
      });
      const sortingOrders = getSortingOrders(sorters, fields.x.sorting);
      const bandDomain = orderBy(
        [...new Set(scalesData.map(getX))],
        sorters,
        sortingOrders
      );
      const xScale = scaleBand()
        .domain(bandDomain)
        .paddingInner(PADDING_INNER)
        .paddingOuter(PADDING_OUTER);
      const xScaleInteraction = scaleBand()
        .domain(bandDomain)
        .paddingInner(0)
        .paddingOuter(0);

      // x as time, needs to be memoized!
      const xEntireDomainAsTime = extent(plottableSortedData, (d) =>
        getXAsDate(d)
      ) as [Date, Date];

      const xEntireScale = scaleTime().domain(xEntireDomainAsTime);

      // y
      const minValue = Math.min(
        min(scalesData, (d) =>
          getYErrorRange ? getYErrorRange(d)[0] : getY(d)
        ) ?? 0,
        0
      );
      const maxValue = Math.max(
        max(scalesData, (d) =>
          getYErrorRange ? getYErrorRange(d)[1] : getY(d)
        ) ?? 0,
        0
      );

      const yScale = scaleLinear().domain([minValue, maxValue]).nice();
      return { xScale, yScale, xEntireScale, xScaleInteraction, bandDomain };
    }, [
      getX,
      getXAsDate,
      getY,
      getYErrorRange,
      plottableSortedData,
      scalesData,
      fields.x.sorting,
      fields.x.useAbbreviations,
      xDimension,
      chartConfig.filters,
    ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);
  const formatters = useChartFormatters(chartProps);

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
  const { segments, colors, getSegmentLabel } = useMemo(() => {
    const segments: string[] = [];
    const colors = scaleOrdinal(segments).domain(segments);
    const getSegmentLabel = (segment: string) => segment;

    return { segments, colors, getSegmentLabel };
  }, []);

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
      formatNumberWithUnit(
        value,
        formatters[yMeasure.iri] || formatNumber,
        yMeasure.unit
      );

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
    allData: plottableSortedData,
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
    yAxisDimension: yMeasure,
    segments,
    colors,
    getAnnotationInfo,
    showStandardError,
  };
};

const ColumnChartProvider = ({
  data,
  measures,
  dimensions,
  aspectRatio,
  children,
  chartConfig,
}: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
  children: ReactNode;
  aspectRatio: number;
  chartConfig: ColumnConfig;
}) => {
  const state = useColumnsState({
    data,
    measures,
    dimensions,
    aspectRatio,
    chartConfig,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ColumnChart = ({
  data,
  measures,
  dimensions,
  chartConfig,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "measures" | "dimensions"> & {
  aspectRatio: number;
  children: ReactNode;
  chartConfig: ColumnConfig;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <ColumnChartProvider
          data={data}
          measures={measures}
          dimensions={dimensions}
          aspectRatio={aspectRatio}
          chartConfig={chartConfig}
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
    return [...data].sort((a, b) => descending(getY(a) ?? -1, getY(b) ?? -1));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getY(a) ?? -1, getY(b) ?? -1));
  } else {
    // default to ascending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
