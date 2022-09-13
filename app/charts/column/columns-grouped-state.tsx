import {
  ascending,
  descending,
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
  ScaleTime,
  sum,
} from "d3";
import { get, keyBy, sortBy } from "lodash";
import React, { ReactNode, useCallback, useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN,
} from "@/charts/column/constants";
import {
  getLabelWithUnit,
  useOptionalNumericVariable,
  usePlottableData,
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
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { useLocale } from "@/locales/use-locale";
import { sortByIndex } from "@/utils/array";
import { makeOrdinalDimensionSorter } from "@/utils/sorting-values";

import useChartFormatters from "../shared/use-chart-formatters";

export interface GroupedColumnsState {
  chartType: "column";
  preparedData: Observation[];
  allData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => string;
  getXAsDate: (d: Observation) => Date;
  xIsTime: boolean;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  xScaleIn: ScaleBand<string>;
  xEntireScale: ScaleTime<number, number>;
  getY: (d: Observation) => number | null;
  getYErrorRange: ((d: Observation) => [number, number]) | null;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (s: string) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  grouped: [string, Observation[]][];
  getAnnotationInfo: (d: Observation) => TooltipInfo;
  showStandardError: boolean;
}

const useGroupedColumnsState = (
  chartProps: Pick<
    ChartProps,
    "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
  > & {
    fields: ColumnFields;
    aspectRatio: number;
  }
): GroupedColumnsState => {
  const {
    data,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
    aspectRatio,
  } = chartProps;
  const locale = useLocale();
  const width = useWidth();
  const formatNumber = useFormatNumber();

  const [interactiveFilters] = useInteractiveFilters();

  const xDimension = dimensions.find((d) => d.iri === fields.x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xIsTime = xDimension.__typename === "TemporalDimension";

  const getX = useStringVariable(fields.x.componentIri);
  const getXAsDate = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const errorMeasure = useErrorMeasure(chartProps, fields.y.componentIri);
  const getYErrorRange = useErrorRange(errorMeasure, getY);
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

  // Sort
  const xSortingType = fields.x.sorting?.sortingType;
  const xSortingOrder = fields.x.sorting?.sortingOrder;

  // All data
  const sortedData = useMemo(() => {
    const xOrder = [
      ...rollup(
        data,
        (v) => sum(v, (x) => getY(x)),
        (x) => getX(x)
      ),
    ]
      .sort((a, b) => ascending(a[1], b[1]))
      .map((d) => d[0]);
    return sortData({
      data,
      getX,
      xSortingType,
      xSortingOrder,
      xOrder,
    });
  }, [data, getX, xSortingType, xSortingOrder, getY]);

  const plottableSortedData = usePlottableData({
    data: sortedData,
    plotters: [getXAsDate, getY],
  });

  // Data for chart
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData: plottableSortedData,
    interactiveFilters,
    getX: getXAsDate,
    getSegment,
  });

  // segments
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const segments = useMemo(() => {
    const getSegmentsOrderedByName = () =>
      Array.from(new Set(plottableSortedData.map((d) => getSegment(d)))).sort(
        (a, b) =>
          segmentSortingOrder === "asc"
            ? a.localeCompare(b, locale)
            : b.localeCompare(a, locale)
      );

    const dimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    );

    const getSegmentsOrderedByPosition = () => {
      const segments = Array.from(
        new Set(plottableSortedData.map((d) => getSegment(d)))
      );
      if (!dimension) {
        return segments;
      }
      const sorter = makeOrdinalDimensionSorter(dimension);
      return sortBy(segments, sorter);
    };

    const getSegmentsOrderedByTotalValue = () =>
      [
        ...rollup(
          plottableSortedData,
          (v) => sum(v, (x) => getY(x)),
          (x) => getSegment(x)
        ),
      ]
        .sort((a, b) =>
          segmentSortingOrder === "asc"
            ? ascending(a[1], b[1])
            : descending(a[1], b[1])
        )
        .map((d) => d[0]);
    if (dimension?.__typename === "OrdinalDimension") {
      return getSegmentsOrderedByPosition();
    }
    return segmentSortingType === "byDimensionLabel"
      ? getSegmentsOrderedByName()
      : getSegmentsOrderedByTotalValue();
  }, [
    dimensions,
    fields.segment?.componentIri,
    getSegment,
    getY,
    locale,
    segmentSortingOrder,
    segmentSortingType,
    plottableSortedData,
  ]);

  /* Scales */
  const {
    bandDomain,
    colors,
    yScale,
    xEntireScale,
    xScale,
    xScaleIn,
    xScaleInteraction,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    );

    if (fields.segment && segmentDimension && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = segments.map((segment) => {
        const dvIri = segmentDimension.values.find(
          (s: { label: string; value: string }) =>
            s.label === segment || s.value === segment
        ).value;

        return {
          label: segment,
          color: fields.segment?.colorMapping![dvIri] || "#006699",
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
    } else {
      colors.domain(segments);
      colors.range(getPalette(fields.segment?.palette));
    }

    const bandDomain = [...new Set(preparedData.map((d) => getX(d) as string))];
    const xScale = scaleBand()
      .domain(bandDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(bandDomain)
      .paddingInner(0)
      .paddingOuter(0);
    const xScaleIn = scaleBand().domain(segments).padding(PADDING_WITHIN);

    // x as time, needs to be memoized!
    const xEntireDomainAsTime = extent(plottableSortedData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];
    const xEntireScale = scaleTime().domain(xEntireDomainAsTime);

    // y
    const minValue = Math.min(
      mkNumber(
        min(preparedData, (d) =>
          getYErrorRange ? getYErrorRange(d)[0] : getY(d) || 0
        )
      ),
      0
    );
    const maxValue = Math.max(
      max(preparedData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d) || 0
      ) as number,
      0
    );

    const yScale = scaleLinear()
      .domain([mkNumber(minValue), mkNumber(maxValue)])
      .nice();

    return {
      colors,
      yScale,
      xEntireScale,
      xScale,
      xScaleIn,
      xScaleInteraction,
      bandDomain,
    };
  }, [
    dimensions,
    fields.segment,
    getX,
    getXAsDate,
    getY,
    getYErrorRange,
    plottableSortedData,
    preparedData,
    segments,
  ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  // Group
  const grouped = useMemo(() => {
    const groupedMap = group(preparedData, getX);
    const grouped = [...groupedMap];

    // sort by segments
    grouped.forEach((group) => {
      return [
        group[0],
        sortByIndex({
          data: group[1],
          order: segments,
          getCategory: getSegment,
          sortOrder: segmentSortingOrder,
        }),
      ];
    });

    return grouped;
  }, [getSegment, getX, preparedData, segmentSortingOrder, segments]);

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

  // Adjust of scales based on chart dimensions
  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xScaleIn.range([0, xScale.bandwidth()]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const formatters = useChartFormatters(chartProps);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(getY(datum) ?? NaN);
    const yAnchor = yRef;

    const tooltipValues = preparedData.filter((j) => getX(j) === getX(datum));
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      // Always ascending to match visual order of colors of the stack
      sortOrder: "asc",
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
      xValue: getX(datum),
      datum: {
        label: fields.segment && getSegment(datum),
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        label: getSegment(td),
        value: yMeasure.unit
          ? `${formatNumber(getY(td))} ${yMeasure.unit}`
          : formatNumber(getY(td)),
        color: colors(getSegment(td)) as string,
      })),
    };
  };

  return {
    chartType: "column",
    preparedData,
    allData: plottableSortedData,
    bounds,
    getX,
    getXAsDate,
    xScale,
    xScaleInteraction,
    xScaleIn,
    xEntireScale,
    getY,
    getYErrorRange,
    yScale,
    getSegment,
    getSegmentLabel,
    yAxisLabel,
    segments,
    colors,
    grouped,
    getAnnotationInfo,
    xIsTime,
    showStandardError,
  };
};

const GroupedColumnChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useGroupedColumnsState({
    data,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedColumnChart = ({
  data,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  aspectRatio: number;
  children: ReactNode;
  fields: ColumnFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <GroupedColumnChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </GroupedColumnChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getX,
  xSortingType,
  xSortingOrder,
  xOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  xSortingType: SortingType | undefined;
  xSortingOrder: SortingOrder | undefined;
  xOrder: string[];
}) => {
  if (xSortingOrder === "desc" && xSortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (xSortingOrder === "asc" && xSortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (xSortingType === "byMeasure") {
    const sd = sortByIndex({
      data,
      order: xOrder,
      getCategory: getX,
      sortOrder: xSortingOrder,
    });
    return sd;
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
