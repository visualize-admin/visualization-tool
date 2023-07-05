import {
  ascending,
  extent,
  group,
  max,
  min,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
} from "d3";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "@/charts/line/constants";
import {
  getMaybeAbbreviations,
  useMaybeAbbreviations,
} from "@/charts/shared/abbreviations";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush/constants";
import {
  getLabelWithUnit,
  getWideData,
  useDataAfterInteractiveFilters,
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
import { LineConfig } from "@/configurator";
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

export interface LinesState extends CommonChartState {
  chartType: "line";
  data: Observation[];
  allData: Observation[];
  preparedData: Observation[];
  segments: string[];
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xEntireScale: ScaleTime<number, number>;
  // xUniqueValues: Date[];
  getY: (d: Observation) => number | null;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (s: string) => string;
  colors: ScaleOrdinal<string, string>;
  xAxisLabel: string;
  yAxisLabel: string;
  yAxisDimension: DimensionMetadataFragment;
  grouped: Map<string, Observation[]>;
  chartWideData: ArrayLike<Observation>;
  allDataWide: ArrayLike<Observation>;
  xKey: string;
  getAnnotationInfo: (d: Observation) => TooltipInfo;
}

const useLinesState = (
  props: ChartProps<LineConfig> & { aspectRatio: number }
): LinesState => {
  const { data, dimensions, measures, chartConfig, aspectRatio } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();

  const xKey = fields.x.componentIri;

  const xDimension = dimensions.find((d) => d.iri === xKey);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  if (!isTemporalDimension(xDimension)) {
    throw Error(`Dimension <${fields.x.componentIri}> is not temporal!`);
  }

  const getX = useTemporalVariable(xKey);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const getGroups = useStringVariable(xKey);

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
      data,
      getSegmentAbbreviationOrLabel,
      fields.segment?.componentIri
    );

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const dataGroupedByX = useMemo(
    () => group(data, getGroups),
    [data, getGroups]
  );

  const allDataWide = getWideData({
    dataGroupedByX,
    xKey,
    getY,
    getSegment,
  });

  // Data for chart
  const { preparedData, scalesData } = useDataAfterInteractiveFilters({
    observations: data,
    interactiveFiltersConfig,
    // No animation yet for lines
    animationField: undefined,
    getX,
    getSegment: getSegmentAbbreviationOrLabel,
  });

  const preparedDataGroupedBySegment = useMemo(
    () => group(preparedData, getSegment),
    [preparedData, getSegment]
  );

  const preparedDataGroupedByX = useMemo(
    () => group(preparedData, getGroups),
    [preparedData, getGroups]
  );

  const chartWideData = getWideData({
    dataGroupedByX: preparedDataGroupedByX,
    xKey,
    getY,
    getSegment,
  });

  // x
  const xDomain = extent(preparedData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xEntireDomain = useMemo(
    () => extent(data, (d) => getX(d)) as [Date, Date],
    [data, getX]
  );
  const xEntireScale = scaleTime().domain(xEntireDomain);
  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.x.componentIri;

  // y
  const minValue = Math.min(min(scalesData, getY) ?? 0, 0);
  const maxValue = max(scalesData, getY) ?? 0;
  const yDomain = [minValue, maxValue];

  const entireMaxValue = max(data, getY) as number;
  const yScale = scaleLinear().domain(yDomain).nice();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  // segments
  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension?.iri]
    : undefined;
  const segments = useMemo(() => {
    const uniqueSegments = [...new Set(data.map(getSegment))];
    const sorting = fields?.segment?.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });
    return orderBy(
      uniqueSegments,
      sorters,
      getSortingOrders(sorters, fields.segment?.sorting)
    );
  }, [
    segmentDimension,
    getSegment,
    fields.segment?.sorting,
    fields.segment?.useAbbreviations,
    data,
    segmentFilter,
  ]);

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
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
  } else {
    colors.domain(segments);
    colors.range(getPalette(fields.segment?.palette));
  }

  // Dimensions
  const left = interactiveFiltersConfig?.timeRange.active
    ? estimateTextWidth(formatNumber(entireMaxValue))
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = interactiveFiltersConfig?.timeRange.active
    ? BRUSH_BOTTOM_SPACE
    : 40;
  const margins = {
    top: 50,
    right: 40,
    bottom: bottom,
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
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const formatters = useChartFormatters(props);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xAnchor = xScale(getX(datum));
    const yAnchor = yScale(getY(datum) ?? 0);

    const tooltipValues = preparedData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortingOrder: "asc",
    });

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
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        hide: getY(td) === null,
        label: getSegmentAbbreviationOrLabel(td),
        value: yValueFormatter(getY(td)),
        color: colors(getSegment(td)) as string,
        yPos: yScale(getY(td) ?? 0),
      })),
    };
  };

  return {
    chartType: "line",
    bounds,
    data,
    allData: data,
    preparedData,
    getX,
    xScale,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    getSegmentLabel,
    xAxisLabel,
    yAxisLabel,
    yAxisDimension: yMeasure,
    segments,
    colors,
    grouped: preparedDataGroupedBySegment,
    chartWideData,
    allDataWide,
    xKey,
    getAnnotationInfo,
  };
};

export const getLinesStateMetadata = (
  chartConfig: LineConfig,
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

const LineChartProvider = ({
  chartConfig,
  data,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<LineConfig> & { aspectRatio: number }
>) => {
  const state = useLinesState({
    chartConfig,
    data,
    dimensions,
    measures,
    aspectRatio,
  });

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const LineChart = ({
  chartConfig,
  data,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<LineConfig> & { aspectRatio: number }
>) => {
  return (
    <Observer>
      <InteractionProvider>
        <LineChartProvider
          chartConfig={chartConfig}
          data={data}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </LineChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
