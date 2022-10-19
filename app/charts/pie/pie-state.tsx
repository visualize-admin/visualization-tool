import {
  arc,
  ascending,
  pie,
  Pie,
  PieArcDatum,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import React, { ReactNode, useMemo, useCallback } from "react";

import {
  useOptionalNumericVariable,
  usePlottableData,
  usePreparedData,
  useSegment,
} from "@/charts/shared/chart-helpers";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import { PieFields } from "@/configurator";
import {
  formatNumberWithUnit,
  getPalette,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import { DimensionValue, Observation } from "@/domain/data";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
export interface PieState {
  bounds: Bounds;
  data: Observation[];
  getPieData: Pie<$IntentionalAny, Observation>;
  getY: (d: Observation) => number | null;
  getX: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  getSegmentLabel: (s: string) => string;
  getAnnotationInfo: (d: PieArcDatum<Observation>) => TooltipInfo;
}

const usePieState = (
  chartProps: Pick<
    ChartProps,
    "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
  > & {
    fields: PieFields;
    aspectRatio: number;
  }
): PieState => {
  const {
    data,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
    aspectRatio,
  } = chartProps;
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const [interactiveFilters] = useInteractiveFilters();

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const getX = useSegment(fields.segment.componentIri);

  // Sort data
  const sortingOrder = fields.segment.sorting?.sortingOrder;

  // Data actually sorted in pie(),
  const plottableData = usePlottableData({
    data: data,
    plotters: [getY],
  });

  // Apply end-user-activated interactive filters to the stack
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    sortedData: data,
    interactiveFilters,
    getSegment: getX,
  });

  const { segmentValuesByValue, segmentDimension, segmentValuesByLabel } =
    useMemo(() => {
      const segmentDimension = dimensions.find(
        (d) => d.iri === fields.segment?.componentIri
      ) as $FixMe;
      return {
        segmentDimension,
        segmentValuesByValue: keyBy(
          segmentDimension.values as DimensionValue[] as DimensionValue[],
          (x) => x.value
        ),
        segmentValuesByLabel: keyBy(
          segmentDimension.values as DimensionValue[],
          (x) => x.label
        ),
      };
    }, [dimensions, fields.segment?.componentIri]);

  // Map ordered segments to colors
  const colors = useMemo(() => {
    const colors = scaleOrdinal<string, string>();
    const measureBySegment = Object.fromEntries(
      plottableData.map((d) => [getX(d), getY(d)])
    );
    const uniqueSegments = Object.entries(measureBySegment)
      .filter((x) => x[1])
      .map((x) => x[0]);

    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting: fields.segment.sorting,
      measureBySegment,
    });

    const segments = orderBy(
      uniqueSegments,
      sorters,
      sortingOrder === "desc" ? "desc" : "asc"
    );

    if (fields.segment && segmentDimension && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = segments.map((segment) => {
        const dvIri = segmentValuesByLabel[segment]?.value;

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
    // Do not let the scale be implicitly extended by children calling it
    // on unknown values
    colors.unknown(() => undefined);
    return colors;
  }, [
    fields.segment,
    getX,
    getY,
    plottableData,
    segmentDimension,
    segmentValuesByLabel,
    sortingOrder,
  ]);

  const getSegmentLabel = useCallback(
    (segment: string): string => {
      return segmentValuesByValue[segment]?.label || segment;
    },
    [segmentValuesByValue]
  );

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
        segmentIndex[getX(a)] ?? -1,
        segmentIndex[getX(b)] ?? -1
      );
    };
  }, [colors, getX]);
  const getPieData = pie<Observation>()
    .value((d) => getY(d) ?? NaN)
    .sort(pieSorter);

  const formatters = useChartFormatters(chartProps);
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
      xValue: getX(datum),
      datum: {
        value: valueFormatter(getY(datum)),
        color: colors(getX(datum)) as string,
      },
      values: undefined,
    };
  };
  return {
    bounds,
    data: preparedData,
    getPieData,
    getY,
    getX,
    colors,
    getAnnotationInfo,
    getSegmentLabel,
  };
};

const PieChartProvider = ({
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
  fields: PieFields;
  aspectRatio: number;
}) => {
  const state = usePieState({
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

export const PieChart = ({
  data,
  fields,
  measures,
  dimensions,
  aspectRatio,
  interactiveFiltersConfig,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  aspectRatio: number;
  fields: PieFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <PieChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </PieChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
