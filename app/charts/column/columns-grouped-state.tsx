import {
  extent,
  group,
  max,
  min,
  rollup,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
  sum,
} from "d3";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  ColumnsGroupedStateVariables,
  useColumnsGroupedStateData,
  useColumnsGroupedStateVariables,
} from "@/charts/column/columns-grouped-state-props";
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN,
} from "@/charts/column/constants";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveXTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export type GroupedColumnsState = CommonChartState &
  ColumnsGroupedStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "column";
    xScale: ScaleBand<string>;
    xScaleInteraction: ScaleBand<string>;
    xScaleIn: ScaleBand<string>;
    yScale: ScaleLinear<number, number>;
    segments: string[];
    colors: ScaleOrdinal<string, string>;
    grouped: [string, Observation[]][];
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useColumnsGroupedState = (
  chartProps: ChartProps<ColumnConfig> & { aspectRatio: number },
  variables: ColumnsGroupedStateVariables,
  data: ChartStateData
): GroupedColumnsState => {
  const { aspectRatio, chartConfig } = chartProps;
  const {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    yMeasure,
    getY,
    getYErrorRange,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
  } = variables;
  const { chartData, scalesData, segmentData, timeRangeData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  // segments
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries(
      rollup(
        segmentData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      )
    );
  }, [segmentData, getY, getSegment]);

  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension.iri]
    : undefined;
  const { allSegments, segments } = useMemo(() => {
    const allUniqueSegments = Array.from(
      new Set(segmentData.map((d) => getSegment(d)))
    );
    const uniqueSegments = Array.from(
      new Set(scalesData.map((d) => getSegment(d)))
    );
    const sorting = fields?.segment?.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      sumsBySegment,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });
    const allSegments = orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, sorting)
    );

    return {
      allSegments,
      segments: allSegments.filter((d) => uniqueSegments.includes(d)),
    };
  }, [
    scalesData,
    segmentData,
    segmentDimension,
    fields.segment?.sorting,
    fields.segment?.useAbbreviations,
    sumsBySegment,
    segmentFilter,
    getSegment,
  ]);

  /* Scales */
  const xFilter = chartConfig.filters[fields.x.componentIri];
  const sumsByX = useMemo(() => {
    // TODO: change to chartData to animate groups by measure. Maybe there should be a new
    // animation field config option?
    return Object.fromEntries(
      rollup(
        scalesData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getX(x)
      )
    );
  }, [scalesData, getX, getY]);

  const {
    xDomainLabels,
    colors,
    yScale,
    interactiveXTimeRangeScale,
    xScale,
    xScaleIn,
    xScaleInteraction,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    if (fields.segment && segmentDimension && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
        const dvIri =
          segmentsByAbbreviationOrLabel.get(segment)?.value ||
          segmentsByValue.get(segment)?.value ||
          "";

        return {
          label: segment,
          color: fields.segment?.colorMapping![dvIri] || "#006699",
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
      colors.unknown(() => undefined);
    } else {
      colors.domain(allSegments);
      colors.range(getPalette(fields.segment?.palette));
      colors.unknown(() => undefined);
    }

    const xValues = [...new Set(scalesData.map(getX))];
    const xSorting = fields.x?.sorting;
    const xSorters = makeDimensionValueSorters(xDimension, {
      sorting: xSorting,
      useAbbreviations: fields.x?.useAbbreviations,
      measureBySegment: sumsByX,
      dimensionFilter: xFilter,
    });
    const xDomain = orderBy(
      xValues,
      xSorters,
      getSortingOrders(xSorters, xSorting)
    );
    const xDomainLabels = xDomain.map(getXLabel);
    const xScale = scaleBand()
      .domain(xDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(xDomain)
      .paddingInner(0)
      .paddingOuter(0);
    const xScaleIn = scaleBand().domain(segments).padding(PADDING_WITHIN);

    const interactiveXTimeRangeDomain = extent(timeRangeData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];
    const interactiveXTimeRangeScale = scaleTime().domain(
      interactiveXTimeRangeDomain
    );

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

    return {
      colors,
      yScale,
      interactiveXTimeRangeScale,
      xScale,
      xScaleIn,
      xScaleInteraction,
      xDomainLabels,
    };
  }, [
    fields.segment,
    xFilter,
    fields.x.sorting,
    fields.x.useAbbreviations,
    sumsByX,
    xDimension,
    allSegments,
    segments,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    timeRangeData,
    scalesData,
    getX,
    getXLabel,
    getXAsDate,
    getYErrorRange,
    getY,
    segmentDimension,
  ]);

  // Group
  const grouped: [string, Observation[]][] = useMemo(() => {
    const xKeys = xScale.domain();
    const groupedMap = group(chartData, getX);
    const grouped: [string, Observation[]][] =
      groupedMap.size < xKeys.length
        ? xKeys.map((d) => {
            if (groupedMap.has(d)) {
              return [d, groupedMap.get(d) as Observation[]];
            } else {
              return [d, []];
            }
          })
        : [...groupedMap];

    return grouped.map(([key, data]) => {
      return [
        key,
        sortByIndex({
          data,
          order: segments,
          getCategory: getSegment,
          sortingOrder: segmentSortingOrder,
        }),
      ];
    });
  }, [getSegment, getX, chartData, segmentSortingOrder, segments, xScale]);

  const { left, bottom } = useChartPadding(
    yScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    xDomainLabels
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

  // Adjust of scales based on chart dimensions
  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xScaleIn.range([0, xScale.bandwidth()]);
  interactiveXTimeRangeScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(getY(datum) ?? NaN);
    const yAnchor = yRef;

    const tooltipValues = chartData.filter((j) => getX(j) === getX(datum));
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      // Always ascending to match visual order of colors of the stack
      sortingOrder: "asc",
    });

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

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.iri] || formatNumber,
        yMeasure.unit
      );

    const xAnchor = getXAnchor();

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: getXAbbreviationOrLabel(datum),
      datum: {
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        label: getSegmentAbbreviationOrLabel(td),
        value: yMeasure.unit
          ? `${formatNumber(getY(td))} ${yMeasure.unit}`
          : formatNumber(getY(td)),
        color: colors(getSegment(td)) as string,
      })),
    };
  };

  return {
    chartType: "column",
    bounds,
    chartData,
    allData,
    xScale,
    xScaleInteraction,
    xScaleIn,
    interactiveXTimeRangeScale,
    yScale,
    segments,
    colors,
    grouped,
    getAnnotationInfo,
    ...variables,
  };
};

const GroupedColumnChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useColumnsGroupedStateVariables(chartProps);
  const data = useColumnsGroupedStateData(chartProps, variables);
  const state = useColumnsGroupedState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedColumnChart = (
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <GroupedColumnChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
