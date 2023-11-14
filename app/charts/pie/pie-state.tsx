import {
  arc,
  ascending,
  pie,
  Pie,
  PieArcDatum,
  ScaleOrdinal,
  scaleOrdinal,
  schemeCategory10,
  sum,
} from "d3";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  PieStateVariables,
  usePieStateData,
  usePieStateVariables,
} from "@/charts/pie/pie-state-props";
import { getChartBounds } from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { PieConfig } from "@/configurator";
import { Dimension, Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export type PieState = CommonChartState &
  PieStateVariables & {
    chartType: "pie";
    getPieData: Pie<$IntentionalAny, Observation>;
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    getAnnotationInfo: (d: PieArcDatum<Observation>) => TooltipInfo;
  };

const usePieState = (
  chartProps: ChartProps<PieConfig> & { aspectRatio: number },
  variables: PieStateVariables,
  data: ChartStateData
): PieState => {
  const { chartConfig, aspectRatio } = chartProps;
  const {
    yMeasure,
    getY,
    segmentDimension: _segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
  } = variables;
  // Segment dimension is guaranteed to be present, because it is required.
  const segmentDimension = _segmentDimension as Dimension;
  const { chartData, segmentData, allData } = data;
  const { fields } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber();
  const formatters = useChartFormatters(chartProps);

  const segmentsByValue = useMemo(() => {
    return new Map(segmentDimension.values.map((d) => [d.value, d]));
  }, [segmentDimension.values]);

  // Map ordered segments to colors
  const segmentFilter = chartConfig.filters[segmentDimension.iri];
  const { colors, allSegments, segments, ySum } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();
    const measureBySegment = Object.fromEntries(
      segmentData.map((d) => [getSegment(d), getY(d)])
    );
    const allUniqueSegments = Object.entries(measureBySegment)
      .filter((x) => typeof x[1] === "number")
      .map((x) => x[0]);
    const uniqueSegments = Array.from(new Set(chartData.map(getSegment)));

    const sorting = fields.segment.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      measureBySegment,
      useAbbreviations: fields.segment.useAbbreviations,
      dimensionFilter: segmentFilter,
    });

    const allSegments = orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, sorting)
    );
    const segments = allSegments.filter((d) => uniqueSegments.includes(d));

    if (fields.segment && segmentDimension && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
        const dvIri =
          segmentsByAbbreviationOrLabel.get(segment)?.value ||
          segmentsByValue.get(segment)?.value ||
          "";

        return {
          label: segment,
          color: fields.segment?.colorMapping![dvIri] ?? schemeCategory10[0],
        };
      });

      colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
      colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
    } else {
      colors.domain(allSegments);
      colors.range(getPalette(fields.segment?.palette));
    }
    // Do not let the scale be implicitly extended by children calling it
    // on unknown values
    colors.unknown(() => undefined);

    const ySum = sum(chartData, getY);

    return {
      colors,
      allSegments,
      segments,
      ySum,
    };
  }, [
    fields.segment,
    getSegment,
    getY,
    segmentData,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    segmentFilter,
    chartData,
  ]);

  // Dimensions
  const margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  };
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;

  // Pie values
  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = Math.min(maxSide, 100);

  const arcGenerator = arc<Observation, PieArcDatum<Observation>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  // Pie data
  // Sort the pie according to the segments
  const pieSorter = useMemo(() => {
    const segments = colors.domain();
    const segmentIndex = Object.fromEntries(segments.map((s, i) => [s, i]));
    return (a: Observation, b: Observation) => {
      // We do not actually use segment sort order here, because the ascending/descending
      // has already been done when segments where sorted
      return ascending(
        segmentIndex[getSegment(a)] ?? -1,
        segmentIndex[getSegment(b)] ?? -1
      );
    };
  }, [colors, getSegment]);

  const getPieData = pie<Observation>()
    .value((d) => getY(d) ?? 0)
    .sort(pieSorter);

  const valueFormatter = (value: number | null) => {
    if (value === null) {
      return "-";
    }

    const fValue = formatNumberWithUnit(
      value,
      formatters[yMeasure.iri] ?? formatNumber,
      yMeasure.unit
    );
    const percentage = value / ySum;
    const rounded = Math.round(percentage * 100);

    return `${rounded}% (${fValue})`;
  };

  // Tooltip
  const getAnnotationInfo = (
    arcDatum: PieArcDatum<Observation>
  ): TooltipInfo => {
    const [x, y] = arcGenerator.centroid(arcDatum);
    const datum = arcDatum.data;

    const xTranslate = chartWidth / 2;
    const yTranslate = chartHeight / 2;

    const xAnchor = x + xTranslate;
    const yAnchor = y + yTranslate;

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement =
      yAnchor > chartHeight * 0.2
        ? "top"
        : yAnchor < chartHeight * 0.8
        ? "bottom"
        : "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: getSegmentAbbreviationOrLabel(datum),
      datum: {
        value: valueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: undefined,
    };
  };

  /** To correctly animate entering / exiting pie slices during the animation,
   * there is a need to artificially keep all segments in the data, even if they
   * are not present in the current data. This is done by adding a slice with
   * value 0 for each missing segment.
   */
  const chartDataWithMissingSegments = useMemo(() => {
    return chartData.concat(
      allSegments
        .filter((d) => !segments.includes(d))
        .map((d) => {
          return {
            [segmentDimension!.iri]: d,
            [yMeasure.iri]: 0,
          } as Observation;
        })
    );
  }, [chartData, allSegments, segmentDimension, segments, yMeasure.iri]);

  return {
    chartType: "pie",
    bounds,
    chartData: chartDataWithMissingSegments,
    allData,
    getPieData,
    colors,
    getColorLabel: getSegmentLabel,
    getAnnotationInfo,
    ...variables,
  };
};

const PieChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<PieConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = usePieStateVariables(chartProps);
  const data = usePieStateData(chartProps, variables);
  const state = usePieState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const PieChart = (
  props: React.PropsWithChildren<
    ChartProps<PieConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <PieChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
