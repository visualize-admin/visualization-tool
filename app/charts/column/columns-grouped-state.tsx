import {
  ascending,
  extent,
  group,
  max,
  min,
  rollup,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
  ScaleTime,
  sum,
} from "d3";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN,
} from "@/charts/column/constants";
import {
  getMaybeAbbreviations,
  useMaybeAbbreviations,
} from "@/charts/shared/abbreviations";
import {
  getLabelWithUnit,
  getMaybeTemporalDimensionValues,
  useDataAfterInteractiveFilters,
  useOptionalNumericVariable,
  usePlottableData,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import {
  ChartStateMetadata,
  CommonChartState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import {
  getObservationLabels,
  useObservationLabels,
} from "@/charts/shared/observation-labels";
import { useChartPadding } from "@/charts/shared/padding";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { ColumnConfig } from "@/configurator";
import {
  useErrorMeasure,
  useErrorRange,
} from "@/configurator/components/ui-helpers";
import { isTemporalDimension, Observation } from "@/domain/data";
import { formatNumberWithUnit, useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export interface GroupedColumnsState extends CommonChartState {
  chartType: "column";
  preparedData: Observation[];
  allData: Observation[];
  getX: (d: Observation) => string;
  getXLabel: (d: string) => string;
  getXAsDate: (d: Observation) => Date;
  xIsTime: boolean;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  xScaleIn: ScaleBand<string>;
  xEntireScale: ScaleTime<number, number>;
  getY: (d: Observation) => number | null;
  getYErrorRange: ((d: Observation) => [number, number]) | null;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (s: string) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  yAxisDimension: DimensionMetadataFragment;
  grouped: [string, Observation[]][];
  getAnnotationInfo: (d: Observation) => TooltipInfo;
  showStandardError: boolean;
}

const useGroupedColumnsState = (
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
): GroupedColumnsState => {
  const { data, dimensions, measures, chartConfig, aspectRatio } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });

  const xDimension = dimensions.find((d) => d.iri === fields.x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xIsTime = isTemporalDimension(xDimension);
  const xDimensionValues = useMemo(() => {
    return getMaybeTemporalDimensionValues(xDimension, data);
  }, [xDimension, data]);

  const { getAbbreviationOrLabelByValue: getXAbbreviationOrLabel } =
    useMaybeAbbreviations({
      useAbbreviations: fields.x.useAbbreviations,
      dimensionIri: xDimension.iri,
      dimensionValues: xDimensionValues,
    });

  const { getValue: getX, getLabel: getXLabel } = useObservationLabels(
    data,
    getXAbbreviationOrLabel,
    fields.x.componentIri
  );

  const getXAsDate = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const errorMeasure = useErrorMeasure(props, fields.y.componentIri);
  const getYErrorRange = useErrorRange(errorMeasure, getY);

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

  const showStandardError = get(fields, ["y", "showStandardError"], true);

  const plottableData = usePlottableData({
    data,
    plotters: [getXAsDate, getY],
  });

  // Data for chart
  const { preparedData, scalesData } = useDataAfterInteractiveFilters({
    observations: plottableData,
    interactiveFiltersConfig,
    animationField: fields.animation,
    getX: getXAsDate,
    getSegment: getSegmentAbbreviationOrLabel,
  });

  // segments
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const sumsBySegment = useMemo(() => {
    return Object.fromEntries([
      ...rollup(
        plottableData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getSegment(x)
      ),
    ]);
  }, [plottableData, getY, getSegment]);

  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension.iri]
    : undefined;
  const segments = useMemo(() => {
    const uniqueSegments = Array.from(
      new Set(plottableData.map((d) => getSegment(d)))
    );

    const sorting = fields?.segment?.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      sumsBySegment,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });

    return orderBy(uniqueSegments, sorters, getSortingOrders(sorters, sorting));
  }, [
    plottableData,
    segmentDimension,
    fields.segment?.sorting,
    fields.segment?.useAbbreviations,
    sumsBySegment,
    segmentFilter,
    getSegment,
  ]);

  /* Scales */
  const xFilter = chartConfig.filters[fields.x.componentIri];
  const sumsByX = useMemo(() => {
    return Object.fromEntries([
      ...rollup(
        plottableData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getX(x)
      ),
    ]);
  }, [plottableData, getX, getY]);
  const {
    xDomainLabels,
    colors,
    yScale,
    xEntireScale,
    xScale,
    xScaleIn,
    xScaleInteraction,
  } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();
    const segmentDimension = dimensions.find(
      (d) => d.iri === fields.segment?.componentIri
    );

    if (fields.segment && segmentDimension && fields.segment.colorMapping) {
      const orderedSegmentLabelsAndColors = segments.map((segment) => {
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
      colors.unknown(() => undefined);
    } else {
      colors.domain(segments);
      colors.range(getPalette(fields.segment?.palette));
      colors.unknown(() => undefined);
    }

    const xValues = [...new Set(scalesData.map(getX))];
    const xSorting = fields.x?.sorting;
    const xSorters = makeDimensionValueSorters(xDimension, {
      sorting: xSorting,
      useAbbreviations: fields.x?.useAbbreviations,
      measureBySegment: sumsByX,
      dimensionFilter: xFilter,
    });
    const xDomain = orderBy(
      xValues,
      xSorters,
      getSortingOrders(xSorters, xSorting)
    );
    const xDomainLabels = xDomain.map(getXLabel);
    const xScale = scaleBand()
      .domain(xDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(xDomain)
      .paddingInner(0)
      .paddingOuter(0);
    const xScaleIn = scaleBand().domain(segments).padding(PADDING_WITHIN);

    // x as time, needs to be memoized!
    const xEntireDomainAsTime = extent(plottableData, (d) => getXAsDate(d)) as [
      Date,
      Date
    ];
    const xEntireScale = scaleTime().domain(xEntireDomainAsTime);

    // y
    const minValue = Math.min(
      min(scalesData, (d) =>
        getYErrorRange ? getYErrorRange(d)[0] : getY(d)
      ) ?? 0,
      0
    );
    const maxValue = Math.max(
      max(scalesData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d)
      ) ?? 0,
      0
    );

    const yScale = scaleLinear().domain([minValue, maxValue]).nice();

    return {
      colors,
      yScale,
      xEntireScale,
      xScale,
      xScaleIn,
      xScaleInteraction,
      xDomainLabels,
    };
  }, [
    dimensions,
    fields.segment,
    xFilter,
    fields.x.sorting,
    fields.x.useAbbreviations,
    sumsByX,
    xDimension,
    segments,
    segmentsByAbbreviationOrLabel,
    segmentsByValue,
    scalesData,
    plottableData,
    getX,
    getXLabel,
    getXAsDate,
    getYErrorRange,
    getY,
  ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  // Group
  const grouped = useMemo(() => {
    const groupedMap = group(preparedData, getX);
    const grouped = [...groupedMap];

    // sort by segments
    grouped.forEach((group) => {
      return [
        group[0],
        sortByIndex({
          data: group[1],
          order: segments,
          getCategory: getSegment,
          sortingOrder: segmentSortingOrder,
        }),
      ];
    });

    return grouped;
  }, [getSegment, getX, preparedData, segmentSortingOrder, segments]);

  const { left, bottom } = useChartPadding(
    yScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    xDomainLabels
  );

  const margins = {
    top: 50,
    right: 40,
    bottom: bottom + BOTTOM_MARGIN_OFFSET,
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

  // Adjust of scales based on chart dimensions
  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xScaleIn.range([0, xScale.bandwidth()]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const formatters = useChartFormatters(props);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(getY(datum) ?? NaN);
    const yAnchor = yRef;

    const tooltipValues = preparedData.filter((j) => getX(j) === getX(datum));
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      // Always ascending to match visual order of colors of the stack
      sortingOrder: "asc",
    });

    const yPlacement = "top";

    const getXPlacement = () => {
      if (xRef + xOffset * 2 > 0.75 * chartWidth) {
        return "left";
      } else if (xRef < 0.25 * chartWidth) {
        return "right";
      } else {
        return "center";
      }
    };
    const xPlacement = getXPlacement();

    const getXAnchor = () => {
      return xPlacement === "right"
        ? xRef
        : xPlacement === "center"
        ? xRef + xOffset
        : xRef + xOffset * 2;
    };

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.iri] || formatNumber,
        yMeasure.unit
      );

    const xAnchor = getXAnchor();

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: getXAbbreviationOrLabel(datum),
      datum: {
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        label: getSegmentAbbreviationOrLabel(td),
        value: yMeasure.unit
          ? `${formatNumber(getY(td))} ${yMeasure.unit}`
          : formatNumber(getY(td)),
        color: colors(getSegment(td)) as string,
      })),
    };
  };

  return {
    chartType: "column",
    bounds,
    preparedData,
    allData: plottableData,
    getX,
    getXLabel,
    getXAsDate,
    xScale,
    xScaleInteraction,
    xScaleIn,
    xEntireScale,
    getY,
    getYErrorRange,
    yScale,
    getSegment,
    getSegmentLabel,
    yAxisLabel,
    yAxisDimension: yMeasure,
    segments,
    colors,
    grouped,
    getAnnotationInfo,
    xIsTime,
    showStandardError,
  };
};

export const getColumnsGroupedStateMetadata = (
  chartConfig: ColumnConfig,
  observations: Observation[],
  dimensions: DimensionMetadataFragment[]
): ChartStateMetadata => {
  const { fields } = chartConfig;
  const x = fields.x.componentIri;
  const xDimension = dimensions.find((d) => d.iri === x);

  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xDimensionValues = getMaybeTemporalDimensionValues(
    xDimension,
    observations
  );

  const { getAbbreviationOrLabelByValue: getXAbbreviationOrLabel } =
    getMaybeAbbreviations({
      useAbbreviations: fields.x.useAbbreviations,
      dimensionIri: xDimension.iri,
      dimensionValues: xDimensionValues,
    });

  const { getValue: getX } = getObservationLabels(
    observations,
    getXAbbreviationOrLabel,
    fields.x.componentIri
  );

  const y = fields.y.componentIri;
  const getY = (d: Observation) => {
    return d[y] !== null ? Number(d[y]) : null;
  };

  const { sortingOrder, sortingType } = fields.x.sorting ?? {};

  return {
    sortData: (data) => {
      const order = [
        ...rollup(
          data,
          (v) => sum(v, (d) => getY(d)),
          (d) => getX(d)
        ),
      ]
        .sort((a, b) => ascending(a[1], b[1]))
        .map((d) => d[0]);

      if (sortingType === "byDimensionLabel") {
        return orderBy(data, getX, sortingOrder);
      } else if (sortingType === "byMeasure") {
        return sortByIndex({ data, order, getCategory: getX, sortingOrder });
      } else {
        return orderBy(data, getX, "asc");
      }
    },
  };
};

const GroupedColumnChartProvider = ({
  chartConfig,
  data,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<ColumnConfig> & {
    aspectRatio: number;
  }
>) => {
  const state = useGroupedColumnsState({
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

export const GroupedColumnChart = ({
  chartConfig,
  data,
  dimensions,
  measures,
  aspectRatio,
  children,
}: React.PropsWithChildren<
  ChartProps<ColumnConfig> & { aspectRatio: number }
>) => {
  return (
    <Observer>
      <InteractionProvider>
        <GroupedColumnChartProvider
          chartConfig={chartConfig}
          data={data}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </GroupedColumnChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
