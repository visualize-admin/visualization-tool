import { ascending, sum } from "d3-array";
import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { Pie, pie } from "d3-shape";
import orderBy from "lodash/orderBy";
import { PropsWithChildren, useMemo } from "react";

import {
  PieStateVariables,
  usePieStateData,
  usePieStateVariables,
} from "@/charts/pie/pie-state-props";
import {
  ShowPieValueLabelsVariables,
  useShowPieValueLabelsVariables,
} from "@/charts/pie/show-values-utils";
import {
  AxisLabelSizeVariables,
  getChartWidth,
  useAxisLabelSizeVariables,
  useChartBounds,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartFormatters } from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { PieConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { getPalette } from "@/palettes";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/chart-props";

export type PieState = CommonChartState &
  PieStateVariables &
  ShowPieValueLabelsVariables & {
    chartType: "pie";
    getPieData: Pie<$IntentionalAny, Observation>;
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    getTooltipInfo: (d: Observation) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    leftAxisLabelOffsetTop: number;
  };

const usePieState = (
  chartProps: ChartProps<PieConfig>,
  variables: PieStateVariables,
  data: ChartStateData
): PieState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const {
    yMeasure,
    getY,
    segmentDimension: _segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
    yAxisLabel,
  } = variables;
  // Segment dimension is guaranteed to be present, because it is required.
  const segmentDimension = _segmentDimension!;
  const { chartData, segmentData, allData } = data;
  const { fields } = chartConfig;
  const { y } = fields;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber();
  const formatters = useChartFormatters(chartProps);

  const segmentsByValue = useMemo(() => {
    return new Map(segmentDimension.values.map((d) => [d.value, d]));
  }, [segmentDimension.values]);

  // Map ordered segments to colors
  const segmentFilter = chartConfig.cubes.find(
    (d) => d.iri === segmentDimension.cubeIri
  )?.filters[segmentDimension.id];
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
    fields.color,
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
  const showValuesVariables = useShowPieValueLabelsVariables(y, {
    dimensions,
    measures,
  });
  const left = 40;
  const right = left;
  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yAxisLabel,
    width,
  });
  const baseYMargin = showValuesVariables.showValues ? 90 : 50;
  const margins = {
    top: baseYMargin + leftAxisLabelSize.offset,
    right,
    bottom: baseYMargin,
    left,
  };
  const chartWidth = getChartWidth({ width, left, right });
  const bounds = useChartBounds({ width, chartWidth, height, margins });

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

    const formattedValue = formatNumberWithUnit(
      value,
      formatters[yMeasure.id] ?? formatNumber,
      yMeasure.unit
    );
    const percentage = value / ySum;
    const rounded = Math.round(percentage * 100);

    return `${rounded}% (${formattedValue})`;
  };

  const getTooltipInfo = (datum: Observation): TooltipInfo => {
    const xAnchor = chartWidth / 2;
    const yAnchor = -4;

    const xPlacement = "center";
    const yPlacement = "top";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      value: getSegmentAbbreviationOrLabel(datum),
      datum: {
        value: valueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: undefined,
      withTriangle: false,
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
            [segmentDimension!.id]: d,
            [yMeasure.id]: 0,
          } as Observation;
        })
    );
  }, [chartData, allSegments, segmentDimension, segments, yMeasure.id]);

  return {
    chartType: "pie",
    bounds,
    chartData: chartDataWithMissingSegments,
    allData,
    getPieData,
    colors,
    getColorLabel: getSegmentLabel,
    getTooltipInfo,
    leftAxisLabelSize,
    leftAxisLabelOffsetTop: 0,
    ...showValuesVariables,
    ...variables,
  };
};

const PieChartProvider = (props: PropsWithChildren<ChartProps<PieConfig>>) => {
  const { children, ...chartProps } = props;
  const variables = usePieStateVariables(chartProps);
  const data = usePieStateData(chartProps, variables);
  const state = usePieState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const PieChart = (props: PropsWithChildren<ChartProps<PieConfig>>) => {
  return (
    <InteractionProvider>
      <PieChartProvider {...props} />
    </InteractionProvider>
  );
};
