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
import keyBy from "lodash/keyBy";
import sortBy from "lodash/sortBy"
import { ReactNode, useCallback, useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "@/charts/line/constants";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush";
import {
  getLabelWithUnit,
  getWideData,
  useOptionalNumericVariable,
  usePlottableData,
  usePreparedData,
  useSegment,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import { LineFields } from "@/configurator";
import {
  formatNumberWithUnit,
  getPalette,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { useTheme } from "@/themes";
import { sortByIndex } from "@/utils/array";
import { estimateTextWidth } from "@/utils/estimate-text-width";
import { makeOrdinalDimensionSorter } from "@/utils/sorting-values";

export interface LinesState {
  chartType: "line";
  data: Observation[];
  bounds: Bounds;
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
  grouped: Map<string, Observation[]>;
  chartWideData: ArrayLike<Observation>;
  allDataWide: ArrayLike<Observation>;
  xKey: string;
  getAnnotationInfo: (d: Observation) => TooltipInfo;
}

const useLinesState = (
  chartProps: Pick<
    ChartProps,
    "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
  > & {
    fields: LineFields;
    aspectRatio: number;
  }
): LinesState => {
  const {
    data,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
    aspectRatio,
  } = chartProps;
  const theme = useTheme();
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const timeFormatUnit = useTimeFormatUnit();
  const [interactiveFilters] = useInteractiveFilters();

  const xDimension = dimensions.find((d) => d.iri === fields.x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }
  if (xDimension.__typename !== "TemporalDimension") {
    throw Error(`Dimension <${fields.x.componentIri}> is not temporal!`);
  }

  const getX = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const getGroups = useStringVariable(fields.x.componentIri);
  const getSegment = useSegment(fields.segment?.componentIri);

  const xKey = fields.x.componentIri;

  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(getX(a), getX(b))),
    [data, getX]
  );

  const plottableSortedData = usePlottableData({
    data: sortedData,
    plotters: [getX, getY],
  });

  const dataGroupedByX = useMemo(
    () => group(plottableSortedData, getGroups),
    [plottableSortedData, getGroups]
  );

  const allDataWide = getWideData({
    dataGroupedByX,
    xKey,
    getY,
    getSegment,
  });

  // All Data
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData: plottableSortedData,
    interactiveFilters,
    getX,
    getSegment,
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
    () => extent(plottableSortedData, (d) => getX(d)) as [Date, Date],
    [plottableSortedData, getX]
  );
  const xEntireScale = scaleTime().domain(xEntireDomain);

  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.x.componentIri;
  // y
  const minValue = min(preparedData, getY)
    ? Math.min(min(preparedData, getY) ?? 0, 0)
    : 0;
  const maxValue = max(preparedData, getY) as number;
  const yDomain = [minValue, maxValue];

  const entireMaxValue = max(plottableSortedData, getY) as number;
  const yScale = scaleLinear().domain(yDomain).nice();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const segmentDimension = useMemo(() => {
    return (
      dimensions.find((d) => d.iri === fields.segment?.componentIri) || {
        values: [],
      }
    );
  }, [dimensions, fields.segment?.componentIri]);

  const { segmentValuesByLabel, segmentValuesByValue } = useMemo(() => {
    return {
      segmentValuesByValue: keyBy(segmentDimension.values, (x) => x.value),
      segmentValuesByLabel: keyBy(segmentDimension.values, (x) => x.label),
    };
  }, [segmentDimension]);

  const getSegmentLabel = useCallback(
    (segment: string): string => {
      return segmentValuesByValue[segment]?.label || segment;
    },
    [segmentValuesByValue]
  );

  // segments
  const segments = useMemo(() => {
    const segments = [...new Set(plottableSortedData.map(getSegment))].sort(
      (a, b) => ascending(a, b)
    );
    const dimension = dimensions.find(
      (d) => d.iri === fields?.segment?.componentIri
    );
    if (dimension?.__typename === "OrdinalDimension") {
      const sorter = makeOrdinalDimensionSorter(dimension);
      return sortBy(segments, sorter);
    }
    return segments;
  }, [
    dimensions,
    fields?.segment?.componentIri,
    getSegment,
    plottableSortedData,
  ]);

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
      const dvIri =
        segmentValuesByLabel[segment]?.value ||
        segmentValuesByValue[segment]?.value;

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
  const left = interactiveFiltersConfig?.time.active
    ? estimateTextWidth(formatNumber(entireMaxValue))
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = interactiveFiltersConfig?.time.active
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

  const formatters = useChartFormatters(chartProps);

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
      sortOrder: "asc",
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
        label: fields.segment && getSegment(datum),
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        hide: getY(td) === null,
        label: getSegment(td),
        value: yValueFormatter(getY(td)),
        color:
          segments.length > 1
            ? (colors(getSegment(td)) as string)
            : theme.palette.primary.main,
        yPos: yScale(getY(td) ?? 0),
      })),
    };
  };
  return {
    chartType: "line",
    data,
    bounds,
    getX,
    xScale,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    getSegmentLabel,
    xAxisLabel,
    yAxisLabel,
    segments,
    colors,
    grouped: preparedDataGroupedBySegment,
    chartWideData,
    allDataWide,
    xKey,
    getAnnotationInfo,
  };
};

const LineChartProvider = ({
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
  fields: LineFields;
  aspectRatio: number;
}) => {
  const state = useLinesState({
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

export const LineChart = ({
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
  fields: LineFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <LineChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </LineChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
