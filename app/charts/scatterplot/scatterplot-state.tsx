import {
  ascending,
  max,
  min,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";
import keyBy from "lodash/keyBy";
import React, { ReactNode, useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "@/charts/scatterplot/constants";
import {
  getLabelWithUnit,
  useOptionalNumericVariable,
  usePlottableData,
  usePreparedData,
  useSegment,
} from "@/charts/shared/chart-helpers";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { TooltipScatterplot } from "@/charts/shared/interaction/tooltip-content";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import { ScatterPlotFields } from "@/configurator";
import {
  getPalette,
  mkNumber,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";
import { estimateTextWidth } from "@/utils/estimate-text-width";

export interface ScatterplotState {
  chartType: string;
  data: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => number | null;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => number | null;
  yScale: ScaleLinear<number, number>;
  hasSegment: boolean;
  getSegment: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  xAxisLabel: string;
  yAxisLabel: string;
  getSegmentLabel: (s: string) => string;
  getAnnotationInfo: (d: Observation, values: Observation[]) => TooltipInfo;
}

const useScatterplotState = ({
  data,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  aspectRatio,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  fields: ScatterPlotFields;
  aspectRatio: number;
}): ScatterplotState => {
  const [interactiveFilters] = useInteractiveFilters();

  const width = useWidth();
  const formatNumber = useFormatNumber();

  const getX = useOptionalNumericVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const getSegment = useSegment(fields.segment?.componentIri);

  const sortedData = data.sort((a, b) =>
    ascending(getSegment(a), getSegment(b))
  );

  const plottableSortedData = usePlottableData({
    data: sortedData,
    plotters: [getX, getY]
  });

  // Data for chart
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    sortedData: plottableSortedData,
    interactiveFilters,
    getSegment,
  });
  const xMeasure = measures.find((d) => d.iri === fields.x.componentIri);

  if (!xMeasure) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xAxisLabel = getLabelWithUnit(xMeasure);

  const xMinValue = Math.min(mkNumber(min(preparedData, (d) => getX(d))), 0);
  const xMaxValue = max(preparedData, (d) => getX(d)) as number;
  const xDomain = [xMinValue, xMaxValue];
  const xScale = scaleLinear().domain(xDomain).nice();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const yMinValue = Math.min(mkNumber(min(preparedData, (d) => getY(d))), 0);
  const yMaxValue = max(preparedData, getY) as number;
  const yDomain = [yMinValue, yMaxValue];
  const yScale = scaleLinear().domain(yDomain).nice();

  const hasSegment = fields.segment ? true : false;
  const segments = useMemo(() => {
    return [...new Set(plottableSortedData.map(getSegment))];
  }, [getSegment, plottableSortedData]); // get *visible* segments

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();
  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  ) as $FixMe;

  const getSegmentLabel = useMemo(() => {
    const segmentValuesByValue = keyBy(segmentDimension.values, (x) => x.value);
    return (segment: string): string => {
      return segmentValuesByValue[segment]?.label || segment;
    };
  }, [segmentDimension.values]);

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
      const dvIri = segmentDimension.values.find(
        (s: $FixMe) => s.label === segment
      )?.value;

      return {
        label: segment,
        color: fields.segment!.colorMapping![dvIri] ?? "#006699",
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(segments);
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
          firstLine={fields.segment && getSegment(datum)}
          secondLine={
            xMeasure.unit
              ? `${xMeasure.label}: ${formatNumber(getX(datum))} ${
                  xMeasure.unit
                }`
              : `${xAxisLabel}: ${formatNumber(getX(datum))}`
          }
          thirdLine={
            yMeasure.unit
              ? `${yMeasure.label}: ${formatNumber(getY(datum))} ${
                  yMeasure.unit
                }`
              : `${yAxisLabel}: ${formatNumber(getY(datum))}`
          }
        />
      ),
      datum: {
        label: fields.segment && getSegment(datum),
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: undefined,
    };
  };

  return {
    chartType: "scatterplot",
    data: preparedData, // sortedData + filtered data,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    hasSegment,
    getSegment,
    colors,
    xAxisLabel,
    yAxisLabel,
    getAnnotationInfo,
    getSegmentLabel,
  };
};

const ScatterplotChartProvider = ({
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
  fields: ScatterPlotFields;
  aspectRatio: number;
}) => {
  const state = useScatterplotState({
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

export const ScatterplotChart = ({
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
  fields: ScatterPlotFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <ScatterplotChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </ScatterplotChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
