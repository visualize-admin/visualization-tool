import {
  arc,
  ascending,
  pie,
  Pie,
  PieArcDatum,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  getMaybeAbbreviations,
  useMaybeAbbreviations,
} from "@/charts/shared/abbreviations";
import { useOptionalNumericVariable } from "@/charts/shared/chart-helpers";
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
import { PieConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export interface PieState extends CommonChartState {
  chartType: "pie";
  chartData: Observation[];
  getPieData: Pie<$IntentionalAny, Observation>;
  getY: (d: Observation) => number | null;
  getX: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  getSegmentLabel: (s: string) => string;
  getAnnotationInfo: (d: PieArcDatum<Observation>) => TooltipInfo;
}

const usePieState = (
  props: ChartProps<PieConfig> & { aspectRatio: number }
): PieState => {
  const {
    chartData,
    scalesData,
    allData,
    dimensions,
    measures,
    chartConfig,
    aspectRatio,
  } = props;
  const { fields } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

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
      scalesData,
      getSegmentAbbreviationOrLabel,
      fields.segment?.componentIri
    );

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  // Map ordered segments to colors
  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension.iri]
    : undefined;
  const colors = useMemo(() => {
    const colors = scaleOrdinal<string, string>();
    const measureBySegment = Object.fromEntries(
      scalesData.map((d) => [getSegment(d), getY(d)])
    );
    const allUniqueSegments = Object.entries(measureBySegment)
      .filter((x) => typeof x[1] === "number")
      .map((x) => x[0]);

    const sorting = fields.segment.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting: sorting,
      measureBySegment,
      useAbbreviations: fields.segment.useAbbreviations,
      dimensionFilter: segmentFilter,
    });

    const allSegments = orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, sorting)
    );

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
    } else {
      colors.domain(allSegments);
      colors.range(getPalette(fields.segment?.palette));
    }
    // Do not let the scale be implicitly extended by children calling it
    // on unknown values
    colors.unknown(() => undefined);

    return colors;
  }, [
    fields.segment,
    getSegment,
    getY,
    scalesData,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    segmentFilter,
  ]);

  // Dimensions
  const margins = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
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
    .value((d) => getY(d) ?? NaN)
    .sort(pieSorter);

  const formatters = useChartFormatters(props);
  const valueFormatter = (value: number | null) =>
    formatNumberWithUnit(
      value,
      formatters[yMeasure.iri] || formatNumber,
      yMeasure.unit
    );

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

  return {
    chartType: "pie",
    bounds,
    chartData,
    allData,
    getPieData,
    getY,
    getX: getSegment,
    colors,
    getAnnotationInfo,
    getSegmentLabel,
  };
};

export const getPieStateMetadata = (
  chartConfig: PieConfig,
  observations: Observation[],
  dimensions: DimensionMetadataFragment[]
): ChartStateMetadata => {
  const { fields } = chartConfig;

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
    getSegment,
    sortData: (data) => {
      return data;
    },
  };
};

const PieChartProvider = ({
  chartConfig,
  chartData,
  scalesData,
  allData,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<PieConfig> & { aspectRatio: number }
>) => {
  const state = usePieState({
    chartConfig,
    chartData,
    scalesData,
    allData,
    dimensions,
    measures,
    aspectRatio,
  });

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const PieChart = ({
  chartConfig,
  chartData,
  scalesData,
  allData,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<PieConfig> & { aspectRatio: number }
>) => {
  return (
    <Observer>
      <InteractionProvider>
        <PieChartProvider
          chartConfig={chartConfig}
          chartData={chartData}
          scalesData={scalesData}
          allData={allData}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </PieChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
