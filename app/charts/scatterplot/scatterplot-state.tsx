import {
  max,
  min,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  ScatterplotStateVariables,
  useScatterplotStateData,
  useScatterplotStateVariables,
} from "@/charts/scatterplot//scatterplot-state-props";
import { LEFT_MARGIN_OFFSET } from "@/charts/scatterplot/constants";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { TooltipScatterplot } from "@/charts/shared/interaction/tooltip-content";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ScatterPlotConfig, SortingField } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import { estimateTextWidth } from "@/utils/estimate-text-width";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export type ScatterplotState = CommonChartState &
  ScatterplotStateVariables & {
    chartType: "scatterplot";
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    hasSegment: boolean;
    colors: ScaleOrdinal<string, string>;
    getAnnotationInfo: (d: Observation, values: Observation[]) => TooltipInfo;
  };

const useScatterplotState = (
  chartProps: ChartProps<ScatterPlotConfig> & { aspectRatio: number },
  variables: ScatterplotStateVariables,
  data: ChartStateData
): ScatterplotState => {
  const { chartConfig, aspectRatio } = chartProps;
  const {
    getX,
    xAxisLabel,
    getY,
    yAxisLabel,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
  } = variables;
  const { chartData, scalesData, segmentData, allData } = data;
  const { fields } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const xMinValue = Math.min(min(scalesData, (d) => getX(d)) ?? 0, 0);
  const xMaxValue = max(scalesData, (d) => getX(d)) ?? 0;
  const xDomain = [xMinValue, xMaxValue];
  const xScale = scaleLinear().domain(xDomain).nice();

  const yMinValue = Math.min(min(scalesData, (d) => getY(d)) ?? 0, 0);
  const yMaxValue = max(scalesData, getY) ?? 0;
  const yDomain = [yMinValue, yMaxValue];
  const yScale = scaleLinear().domain(yDomain).nice();

  const hasSegment = fields.segment ? true : false;
  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension.iri]
    : undefined;
  const allSegments = useMemo(() => {
    const allUniqueSegments = Array.from(new Set(segmentData.map(getSegment)));
    const sorting = {
      sortingType: "byAuto",
      sortingOrder: "asc",
    } as SortingField["sorting"];
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });

    return orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, sorting)
    );
  }, [
    fields.segment?.useAbbreviations,
    getSegment,
    segmentData,
    segmentDimension,
    segmentFilter,
  ]);

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
      const dvIri =
        segmentsByAbbreviationOrLabel.get(segment)?.value ||
        segmentsByValue.get(segment)?.value ||
        "";

      return {
        label: segment,
        color: fields.segment!.colorMapping![dvIri] ?? "#006699",
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(allSegments);
    colors.range(getPalette(fields.segment?.palette));
  }
  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatNumber(yScale.domain()[0])),
    estimateTextWidth(formatNumber(yScale.domain()[1]))
  );
  const margins = {
    top: 50,
    right: 40,
    bottom: 50,
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
  yScale.range([chartHeight, 0]);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum) ?? NaN);
    const yRef = yScale(getY(datum) ?? NaN);
    const xAnchor = xRef;
    const yAnchor = yRef;

    const xPlacement =
      xAnchor < chartWidth * 0.33
        ? "right"
        : xAnchor > chartWidth * 0.66
        ? "left"
        : "center";

    const yPlacement =
      yAnchor > chartHeight * 0.33
        ? "top"
        : yAnchor < chartHeight * 0.66
        ? "bottom"
        : "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: formatNumber(getX(datum)),
      tooltipContent: (
        <TooltipScatterplot
          firstLine={fields.segment && getSegmentAbbreviationOrLabel(datum)}
          secondLine={`${xAxisLabel}: ${formatNumber(getX(datum))}`}
          thirdLine={`${yAxisLabel}: ${formatNumber(getY(datum))}`}
        />
      ),
      datum: {
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: undefined,
    };
  };

  return {
    chartType: "scatterplot",
    bounds,
    chartData,
    allData,
    xScale,
    yScale,
    hasSegment,
    colors,
    getAnnotationInfo,
    ...variables,
  };
};

const ScatterplotChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ScatterPlotConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useScatterplotStateVariables(chartProps);
  const data = useScatterplotStateData(chartProps, variables);
  const state = useScatterplotState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ScatterplotChart = (
  props: React.PropsWithChildren<
    ChartProps<ScatterPlotConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ScatterplotChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
