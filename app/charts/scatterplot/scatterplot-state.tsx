import { max, min } from "d3-array";
import { ScaleLinear, ScaleOrdinal, scaleLinear, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  ScatterplotStateVariables,
  useScatterplotStateData,
  useScatterplotStateVariables,
} from "@/charts/scatterplot//scatterplot-state-props";
import {
  getChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { TooltipScatterplot } from "@/charts/shared/interaction/tooltip-content";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-width";
import { ScatterPlotConfig, SortingField } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
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
    getColorLabel: (segment: string) => string;
    getAnnotationInfo: (d: Observation, values: Observation[]) => TooltipInfo;
  };

const useScatterplotState = (
  chartProps: ChartProps<ScatterPlotConfig>,
  variables: ScatterplotStateVariables,
  data: ChartStateData
): ScatterplotState => {
  const { chartConfig } = chartProps;
  const {
    getX,
    xAxisLabel,
    getY,
    yAxisLabel,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
  } = variables;
  const { chartData, scalesData, segmentData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const { width, height } = useSize();
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

  const paddingYMinValue = Math.min(min(paddingData, (d) => getY(d)) ?? 0, 0);
  const paddingYMaxValue = max(paddingData, getY) ?? 0;
  const paddingYScale = scaleLinear()
    .domain([paddingYMinValue, paddingYMaxValue])
    .nice();

  const hasSegment = fields.segment ? true : false;
  const segmentFilter = segmentDimension?.iri
    ? chartConfig.cubes.find((d) => d.iri === segmentDimension.cubeIri)
        ?.filters[segmentDimension.iri]
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
        color: fields.segment!.colorMapping![dvIri] ?? schemeCategory10[0],
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(allSegments);
    colors.range(getPalette(fields.segment?.palette));
  }
  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent: !!fields.animation,
    formatNumber,
  });
  const margins = {
    top: 50,
    right: 40,
    bottom,
    left,
  };
  const bounds = getChartBounds(width, margins, height);
  const { chartWidth, chartHeight } = bounds;

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
    getColorLabel: getSegmentLabel,
    getAnnotationInfo,
    ...variables,
  };
};

const ScatterplotChartProvider = (
  props: React.PropsWithChildren<ChartProps<ScatterPlotConfig>>
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
  props: React.PropsWithChildren<ChartProps<ScatterPlotConfig>>
) => {
  return (
    <InteractionProvider>
      <ScatterplotChartProvider {...props} />
    </InteractionProvider>
  );
};
