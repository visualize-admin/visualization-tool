import {
  ascending,
  extent,
  group,
  max,
  min,
  rollup,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
  stack,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
  sum,
} from "d3";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "@/charts/area/constants";
import {
  getMaybeAbbreviations,
  useMaybeAbbreviations,
} from "@/charts/shared/abbreviations";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush/constants";
import {
  getLabelWithUnit,
  getWideData,
  stackOffsetDivergingPositiveZeros,
  useOptionalNumericVariable,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import {
  ChartStateMetadata,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import {
  getObservationLabels,
  useObservationLabels,
} from "@/charts/shared/observation-labels";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { AreaConfig } from "@/configurator";
import { parseDate } from "@/configurator/components/ui-helpers";
import { isTemporalDimension, Observation } from "@/domain/data";
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import { estimateTextWidth } from "@/utils/estimate-text-width";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export interface AreasState extends CommonChartState {
  chartType: "area";
  chartData: Observation[];
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xEntireScale: ScaleTime<number, number>;
  getY: (d: Observation) => number | null;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (s: string) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  yAxisDimension: DimensionMetadataFragment;
  chartWideData: ArrayLike<Observation>;
  allDataWide: ArrayLike<Observation>;
  series: $FixMe[];
  getAnnotationInfo: (d: Observation) => TooltipInfo;
}

const useAreasState = (
  props: ChartProps<AreaConfig> & { aspectRatio: number }
): AreasState => {
  const {
    chartData,
    scalesData,
    segmentData,
    allData,
    dimensions,
    measures,
    chartConfig,
    aspectRatio,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const estimateNumberWidth = (d: number) => estimateTextWidth(formatNumber(d));
  const timeFormatUnit = useTimeFormatUnit();

  const xDimension = dimensions.find((d) => d.iri === fields.x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }
  if (!isTemporalDimension(xDimension)) {
    throw Error(`Dimension <${fields.x.componentIri}> is not temporal!`);
  }

  const getX = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const getGroups = useStringVariable(fields.x.componentIri);

  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  );

  const {
    getAbbreviationOrLabelByValue: getSegmentAbbreviationOrLabel,
    abbreviationOrLabelLookup: segmentsByAbbreviationOrLabel,
  } = useMaybeAbbreviations({
    useAbbreviations: fields.segment?.useAbbreviations,
    dimensionIri: segmentDimension?.iri,
    dimensionValues: segmentDimension?.values,
  });

  const { getValue: getSegment, getLabel: getSegmentLabel } =
    useObservationLabels(
      scalesData,
      getSegmentAbbreviationOrLabel,
      fields.segment?.componentIri
    );

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const hasSegment = fields.segment;

  /** Ordered segments */
  const segmentSorting = fields.segment?.sorting;
  const segmentSortingType = segmentSorting?.sortingType;
  const segmentSortingOrder = segmentSorting?.sortingOrder;

  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension?.iri]
    : undefined;

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries([
      ...rollup(
        segmentData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      ),
    ]);
  }, [segmentData, getY, getSegment]);

  const { allSegments, segments } = useMemo(() => {
    const allUniqueSegments = Array.from(
      new Set(segmentData.map((d) => getSegment(d)))
    );
    const uniqueSegments = Array.from(
      new Set(scalesData.map((d) => getSegment(d)))
    );
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting: segmentSorting,
      sumsBySegment,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });
    const allSegments = orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, segmentSorting)
    );

    return {
      allSegments,
      segments: allSegments.filter((d) => uniqueSegments.includes(d)),
    };
  }, [
    segmentData,
    scalesData,
    sumsBySegment,
    segmentDimension,
    segmentSorting,
    segmentFilter,
    getSegment,
    fields.segment?.useAbbreviations,
  ]);

  const xKey = fields.x.componentIri;

  const dataGroupedByX = useMemo(
    () => group(chartData, getGroups),
    [chartData, getGroups]
  );

  const allDataWide = useMemo(
    () =>
      getWideData({
        dataGroupedByX,
        xKey,
        getY,
        getSegment,
      }),
    [dataGroupedByX, xKey, getY, getSegment]
  );

  const chartWideData = useMemo(() => {
    const preparedDataGroupedByX = group(chartData, getGroups);

    return getWideData({
      dataGroupedByX: preparedDataGroupedByX,
      xKey,
      getY,
      allSegments,
      getSegment,
      imputationType: fields.y.imputationType,
    });
  }, [
    chartData,
    getGroups,
    xKey,
    getY,
    allSegments,
    getSegment,
    fields.y.imputationType,
  ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  /** Transform data  */
  const series = useMemo(() => {
    const stackOrder =
      segmentSortingType === "byTotalSize" && segmentSortingOrder === "asc"
        ? stackOrderAscending
        : segmentSortingType === "byTotalSize" && segmentSortingOrder === "desc"
        ? stackOrderDescending
        : stackOrderReverse;
    const stacked = stack()
      .order(stackOrder)
      .offset(stackOffsetDivergingPositiveZeros)
      .keys(segments);

    return stacked(chartWideData as { [key: string]: number }[]);
  }, [chartWideData, segmentSortingOrder, segmentSortingType, segments]);

  /** Scales */
  const entireMaxTotalValue = max<$FixMe>(
    allDataWide,
    (d) => d.total ?? 0
  ) as unknown as number;

  const { colors, xScale, yScale, xEntireScale } = useMemo(() => {
    const minTotal = min(series, (d) => min(d, (d) => d[0])) ?? 0;
    const maxTotal = max(series, (d) => max(d, (d) => d[1])) ?? NaN;
    const yDomain = [minTotal, maxTotal];
    const xDomain = extent(scalesData, (d) => getX(d)) as [Date, Date];
    const xScale = scaleTime().domain(xDomain);

    const xEntireDomain = extent(chartData, (d) => getX(d)) as [Date, Date];
    const xEntireScale = scaleTime().domain(xEntireDomain);
    const yScale = scaleLinear().domain(yDomain).nice();
    const colors = scaleOrdinal<string, string>();
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    ) as $FixMe;

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
    return { colors, xScale, yScale, xEntireScale };
  }, [
    dimensions,
    fields.segment,
    getX,
    chartData,
    scalesData,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    allSegments,
    series,
  ]);

  /** Dimensions */
  const [yMin, yMax] = yScale.domain();
  const left = interactiveFiltersConfig?.timeRange.active
    ? estimateNumberWidth(entireMaxTotalValue)
    : Math.max(estimateNumberWidth(yMin), estimateNumberWidth(yMax));
  const bottom = interactiveFiltersConfig?.timeRange.active
    ? BRUSH_BOTTOM_SPACE
    : 40;

  const margins = {
    top: 50,
    right: 40,
    bottom,
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

  /** Adjust scales according to dimensions */
  xScale.range([0, chartWidth]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const formatters = useChartFormatters(props);

  /** Tooltip */
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xAnchor = xScale(getX(datum));

    const tooltipValues = chartData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortingOrder: "asc",
    });

    const yAnchor = 0;
    const xPlacement = "center";
    const yPlacement = "top";
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
      xValue: timeFormatUnit(getX(datum), xDimension.timeUnit),
      datum: {
        label: hasSegment && getSegmentAbbreviationOrLabel(datum),
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: hasSegment
        ? sortedTooltipValues.map((td) => ({
            label: getSegmentAbbreviationOrLabel(td),
            value: yValueFormatter(getY(td)),
            color: colors(getSegment(td)) as string,
          }))
        : undefined,
    };
  };

  return {
    chartType: "area",
    bounds,
    chartData,
    allData,
    getX,
    xScale,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
    yAxisDimension: yMeasure,
    segments,
    colors,
    chartWideData,
    allDataWide,
    series,
    getAnnotationInfo,
    getSegmentLabel,
  };
};

export const getAreasStateMetadata = (
  chartConfig: AreaConfig,
  observations: Observation[],
  dimensions: DimensionMetadataFragment[]
): ChartStateMetadata => {
  const { fields } = chartConfig;
  const x = fields.x.componentIri;
  const getXDate = (d: Observation) => {
    return parseDate(`${d[x]}`);
  };

  const y = fields.y.componentIri;
  const getY = (d: Observation) => {
    return d[y] !== null ? Number(d[y]) : null;
  };

  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  );

  const { getAbbreviationOrLabelByValue: getSegmentAbbreviationOrLabel } =
    getMaybeAbbreviations({
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionIri: segmentDimension?.iri,
      dimensionValues: segmentDimension?.values,
    });

  const { getValue: getSegment } = getObservationLabels(
    observations,
    getSegmentAbbreviationOrLabel,
    fields.segment?.componentIri
  );

  return {
    assureDefined: {
      getX: getXDate,
      getY,
    },
    getXDate,
    getSegment,
    sortData: (data) => {
      return [...data].sort((a, b) => {
        return ascending(getXDate(a), getXDate(b));
      });
    },
  };
};

const AreaChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<AreaConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...rest } = props;
  const state = useAreasState(rest);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const AreaChart = (
  props: React.PropsWithChildren<
    ChartProps<AreaConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <AreaChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
