import {
  arc,
  ascending,
  descending,
  pie,
  Pie,
  PieArcDatum,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3";
import { keyBy } from "lodash";
import React, { ReactNode, useMemo, useCallback } from "react";

import {
  useOptionalNumericVariable,
  usePreparedData,
  useSegment,
} from "@/charts/shared/chart-helpers";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { ChartContext, ChartProps } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useInteractiveFilters } from "@/charts/shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "@/charts/shared/use-width";
import { PieFields, SortingOrder, SortingType } from "@/configurator";
import {
  getPalette,
  useFormatNumber,
} from "@/configurator/components/ui-helpers";
import { Observation } from "@/domain/data";

const sortData = ({
  data,
  getX,
  getY,
  sortingType,
  sortingOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  getY: (d: Observation) => number | null;
  sortingType?: SortingType;
  sortingOrder?: SortingOrder;
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => descending(getY(a) ?? NaN, getY(b) ?? NaN));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getY(a) ?? NaN, getY(b) ?? NaN));
  } else {
    // default to ascending byDimensionLabel
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};

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

const usePieState = ({
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
  fields: PieFields;
  aspectRatio: number;
}): PieState => {
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
  const sortingType = fields.segment.sorting?.sortingType;
  const sortingOrder = fields.segment.sorting?.sortingOrder;

  // Data actually sorted in pie(),
  // Sorting here only useful to legend items.
  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  // Apply end-user-activated interactive filters to the stack
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    sortedData,
    interactiveFilters,
    getSegment: getX,
  });

  // Map ordered segments to colors
  const segments = Array.from(new Set(sortedData.map((d) => getX(d))));
  const colors = scaleOrdinal<string, string>();
  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  ) as $FixMe;

  const { segmentValuesByValue } = useMemo(() => {
    return {
      segmentValuesByValue: keyBy(segmentDimension.values, (x) => x.value),
      segmentValuesByLabel: keyBy(segmentDimension.values, (x) => x.label),
    };
  }, [segmentDimension.values]);

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
      const dvIri = segmentDimension.values.find(
        (s: $FixMe) => s.label === segment
      ).value;

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
  const getPieData = pie<Observation>()
    .value((d) => getY(d) ?? NaN)
    .sort((a, b) => {
      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return descending(getX(a), getX(b));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return ascending(getX(a), getX(b));
      } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
        return descending(getY(a) ?? NaN, getY(b) ?? NaN);
      } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
        return ascending(getY(a) ?? NaN, getY(b) ?? NaN);
      } else {
        // default to ascending byDimensionLabel
        return ascending(getX(a), getX(b));
      }
    });

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
        value: yMeasure.unit
          ? `${formatNumber(getY(datum))} ${yMeasure.unit}`
          : formatNumber(getY(datum)),
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
