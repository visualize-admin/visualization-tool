import { max } from "d3-array";
import { ScaleLinear, scaleLinear, ScaleOrdinal, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  ScatterplotStateVariables,
  useScatterplotStateData,
  useScatterplotStateVariables,
} from "@/charts/scatterplot//scatterplot-state-props";
import {
  AxisLabelSizeVariables,
  getChartWidth,
  useAxisLabelSizeVariables,
  useChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { TooltipScatterplot } from "@/charts/shared/interaction/tooltip-content";
import { DEFAULT_MARGIN_TOP } from "@/charts/shared/margins";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { ScatterPlotConfig, SortingField } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";
import { TooltipPlacement } from "../shared/interaction/tooltip-box";

export type ScatterplotState = CommonChartState &
  ScatterplotStateVariables & {
    chartType: "scatterplot";
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    hasSegment: boolean;
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    getAnnotationInfo: (d: Observation, values: Observation[]) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    leftAxisLabelOffset: number;
    bottomAxisLabelSize: AxisLabelSizeVariables;
  };

const useScatterplotState = (
  chartProps: ChartProps<ScatterPlotConfig>,
  variables: ScatterplotStateVariables,
  data: ChartStateData
): ScatterplotState => {
  const { chartConfig } = chartProps;
  const {
    getX,
    getMinX,
    xAxisLabel,
    getY,
    getMinY,
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

  const xMinValue = getMinX(scalesData, getX);
  const xMaxValue = max(scalesData, (d) => getX(d)) ?? 0;
  const xDomain = [xMinValue, xMaxValue];
  const xScale = scaleLinear().domain(xDomain).nice();

  const yMinValue = getMinY(scalesData, getY);
  const yMaxValue = max(scalesData, getY) ?? 0;
  const yDomain = [yMinValue, yMaxValue];
  const yScale = scaleLinear().domain(yDomain).nice();

  const paddingYMinValue = getMinY(paddingData, getY);
  const paddingYMaxValue = max(paddingData, getY) ?? 0;
  const paddingYScale = scaleLinear()
    .domain([paddingYMinValue, paddingYMaxValue])
    .nice();

  const hasSegment = fields.segment ? true : false;
  const segmentFilter = segmentDimension?.id
    ? chartConfig.cubes.find((d) => d.iri === segmentDimension.cubeIri)
        ?.filters[segmentDimension.id]
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

  if (fields.segment && segmentDimension && fields.color) {
    const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
      const dvIri =
        segmentsByAbbreviationOrLabel.get(segment)?.value ||
        segmentsByValue.get(segment)?.value ||
        "";

      return {
        label: segment,
        color:
          fields.color.type === "segment"
            ? (fields.color.colorMapping![dvIri] ?? schemeCategory10[0])
            : schemeCategory10[0],
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(allSegments);
    colors.range(
      getPalette({
        paletteId: fields.color.paletteId,
        colorField: fields.color,
      })
    );
  }
  // Dimensions
  const { top, left, bottom } = useChartPadding({
    xLabelPresent: !!xAxisLabel,
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
  });
  const right = 40;
  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yAxisLabel,
    width,
  });
  const bottomAxisLabelSize = useAxisLabelSizeVariables({
    label: xAxisLabel,
    width,
  });
  const margins = {
    top: DEFAULT_MARGIN_TOP + top + leftAxisLabelSize.offset,
    right,
    bottom: bottom + bottomAxisLabelSize.offset,
    left,
  };
  const chartWidth = getChartWidth({ width, left, right });
  const bounds = useChartBounds({ width, chartWidth, height, margins });
  const { chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum) ?? NaN);
    const yRef = yScale(getY(datum) ?? NaN);
    const xAnchor = xRef;
    const yAnchor = isMobile ? 0 : yRef;

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

    const placement: TooltipPlacement = isMobile
      ? { x: "center", y: "top" }
      : { x: xPlacement, y: yPlacement };

    return {
      xAnchor,
      yAnchor,
      placement,
      value: formatNumber(getX(datum)),
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
    leftAxisLabelSize,
    leftAxisLabelOffset: top,
    bottomAxisLabelSize,
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
