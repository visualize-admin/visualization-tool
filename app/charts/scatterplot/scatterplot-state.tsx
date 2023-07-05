import {
  max,
  min,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";
import { useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "@/charts/scatterplot/constants";
import {
  getMaybeAbbreviations,
  useMaybeAbbreviations,
} from "@/charts/shared/abbreviations";
import {
  getLabelWithUnit,
  useDataAfterInteractiveFilters,
  useOptionalNumericVariable,
} from "@/charts/shared/chart-helpers";
import {
  ChartStateMetadata,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { TooltipScatterplot } from "@/charts/shared/interaction/tooltip-content";
import {
  getObservationLabels,
  useObservationLabels,
} from "@/charts/shared/observation-labels";
import { ChartContext } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ScatterPlotConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import { estimateTextWidth } from "@/utils/estimate-text-width";

import { ChartProps } from "../shared/ChartProps";

export interface ScatterplotState extends CommonChartState {
  chartType: "scatterplot";
  allData: Observation[];
  preparedData: Observation[];
  getX: (d: Observation) => number | null;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => number | null;
  yScale: ScaleLinear<number, number>;
  hasSegment: boolean;
  getSegment: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  xAxisLabel: string;
  xAxisDimension: DimensionMetadataFragment;
  yAxisLabel: string;
  yAxisDimension: DimensionMetadataFragment;
  getSegmentLabel: (s: string) => string;
  getAnnotationInfo: (d: Observation, values: Observation[]) => TooltipInfo;
}

const useScatterplotState = (
  props: ChartProps<ScatterPlotConfig> & { aspectRatio: number }
): ScatterplotState => {
  const width = useWidth();
  const { chartConfig, data, dimensions, measures, aspectRatio } = props;
  const { fields } = chartConfig;
  const formatNumber = useFormatNumber({ decimals: "auto" });

  const getX = useOptionalNumericVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);

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

  // Data for chart
  const { interactiveFiltersConfig } = chartConfig;
  const { preparedData, scalesData } = useDataAfterInteractiveFilters({
    observations: data,
    interactiveFiltersConfig,
    // No animation yet for scatterplot
    animationField: undefined,
    getSegment: getSegmentAbbreviationOrLabel,
  });
  const xMeasure = measures.find((d) => d.iri === fields.x.componentIri);

  if (!xMeasure) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xAxisLabel = getLabelWithUnit(xMeasure);

  const xMinValue = Math.min(min(scalesData, (d) => getX(d)) ?? 0, 0);
  const xMaxValue = max(scalesData, (d) => getX(d)) ?? 0;
  const xDomain = [xMinValue, xMaxValue];
  const xScale = scaleLinear().domain(xDomain).nice();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const yMinValue = Math.min(min(scalesData, (d) => getY(d)) ?? 0, 0);
  const yMaxValue = max(scalesData, getY) ?? 0;
  const yDomain = [yMinValue, yMaxValue];
  const yScale = scaleLinear().domain(yDomain).nice();

  const hasSegment = fields.segment ? true : false;
  const segments = useMemo(() => {
    return [...new Set(data.map(getSegment))];
  }, [getSegment, data]);

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
          firstLine={fields.segment && getSegmentAbbreviationOrLabel(datum)}
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
    allData: data,
    preparedData,
    getX,
    xScale,
    getY,
    yScale,
    hasSegment,
    getSegment,
    colors,
    xAxisLabel,
    xAxisDimension: xMeasure,
    yAxisLabel,
    yAxisDimension: yMeasure,
    getAnnotationInfo,
    getSegmentLabel,
  };
};

export const getScatterplotStateMetadata = (
  chartConfig: ScatterPlotConfig,
  observations: Observation[],
  dimensions: DimensionMetadataFragment[]
): ChartStateMetadata => {
  const { fields } = chartConfig;

  const x = fields.x.componentIri;
  const getX = (d: Observation) => {
    return d[x] !== null ? Number(d[x]) : null;
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
      getX,
      getY,
    },
    getSegment,
    sortData: (data) => {
      return data;
    },
  };
};

const ScatterplotChartProvider = ({
  data,
  dimensions,
  measures,
  chartConfig,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<ScatterPlotConfig> & { aspectRatio: number }
>) => {
  const state = useScatterplotState({
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

export const ScatterplotChart = ({
  chartConfig,
  data,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<ScatterPlotConfig> & { aspectRatio: number }
>) => {
  return (
    <Observer>
      <InteractionProvider>
        <ScatterplotChartProvider
          data={data}
          dimensions={dimensions}
          measures={measures}
          chartConfig={chartConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </ScatterplotChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
