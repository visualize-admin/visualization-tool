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
import { get, sortBy } from "lodash";
import React, { ReactNode, useMemo } from "react";
import { ColumnFields, SortingOrder, SortingType } from "../../configurator";
import {
  getPalette,
  mkNumber,
  useErrorMeasure,
  useErrorRange,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { Observation } from "../../domain/data";
import { sortByIndex } from "../../lib/array";
import { useLocale } from "../../locales/use-locale";
import { makeOrdinalDimensionSorter } from "../../utils/sorting-values";
import {
  getLabelWithUnit,
  useOptionalNumericVariable,
  usePreparedData,
  useSegment,
  useStringVariable,
  useTemporalVariable,
} from "../shared/chart-helpers";
import { TooltipInfo } from "../shared/interaction/tooltip";
import { useChartPadding } from "../shared/padding";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { useInteractiveFilters } from "../shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN,
} from "./constants";

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

  // Sort
  const xSortingType = fields.x.sorting?.sortingType;
  const xSortingOrder = fields.x.sorting?.sortingOrder;

  const xOrder = [
    ...rollup(
      data,
      (v) => sum(v, (x) => getY(x)),
      (x) => getX(x)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);

  // All data
  const sortedData = useMemo(
    () =>
      sortData({
        data,
        getX,
        xSortingType,
        xSortingOrder,
        xOrder,
      }),
    [data, getX, xSortingType, xSortingOrder, xOrder]
  );

  // Data for chart
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData,
    interactiveFilters,
    getX: getXAsDate,
    getSegment,
  });

  // segments
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const segments = useMemo(() => {
    const getSegmentsOrderedByName = () =>
      Array.from(new Set(sortedData.map((d) => getSegment(d)))).sort((a, b) =>
        segmentSortingOrder === "asc"
          ? a.localeCompare(b, locale)
          : b.localeCompare(a, locale)
      );

    const dimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    );

    const getSegmentsOrderedByPosition = () => {
      const segments = Array.from(
        new Set(sortedData.map((d) => getSegment(d)))
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
          sortedData,
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
    sortedData,
  ]);

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();
  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  ) as $FixMe;

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
      const dvIri = segmentDimension.values.find(
        (s: $FixMe) => s.label === segment
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
  const xScaleIn = scaleBand().domain(segments).padding(PADDING_WITHIN);

  // x as time, needs to be memoized!
  const xEntireDomainAsTime = useMemo(
    () => extent(sortedData, (d) => getXAsDate(d)) as [Date, Date],
    [getXAsDate, sortedData]
  );
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

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  // Group
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
  xScaleIn.range([0, xScale.bandwidth()]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

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
    const xAnchor = getXAnchor();

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: getX(datum),
      datum: {
        label: fields.segment && getSegment(datum),
        value: yMeasure.unit
          ? `${formatNumber(getY(datum))} ${yMeasure.unit}`
          : formatNumber(getY(datum)),
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
    allData: sortedData,
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
