import {
  ascending,
  descending,
  extent,
  max,
  min,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
  ScaleTime,
} from "d3";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
import {
  getMaybeAbbreviations,
  useMaybeAbbreviations,
} from "@/charts/shared/abbreviations";
import {
  getLabelWithUnit,
  getMaybeTemporalDimensionValues,
  useOptionalNumericVariable,
  useSegment,
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
  useErrorVariable,
} from "@/configurator/components/ui-helpers";
import { isTemporalDimension, Observation } from "@/domain/data";
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import {
  DimensionMetadataFragment,
  TemporalDimension,
  TimeUnit,
} from "@/graphql/query-hooks";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export interface ColumnsState extends CommonChartState {
  chartType: "column";
  chartData: Observation[];
  getX: (d: Observation) => string;
  getXLabel: (d: string) => string;
  getXAsDate: (d: Observation) => Date;
  xIsTime: boolean;
  timeUnit: TimeUnit | undefined;
  xScale: ScaleBand<string>;
  xEntireScale: ScaleTime<number, number>;
  xScaleInteraction: ScaleBand<string>;
  getY: (d: Observation) => number | null;
  getYErrorRange: null | ((d: Observation) => [number, number]);
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  getSegmentLabel: (segment: string) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  yAxisDimension: DimensionMetadataFragment;
  getAnnotationInfo: (d: Observation) => TooltipInfo;
  showStandardError: boolean;
}

const useColumnsState = (
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
): ColumnsState => {
  const {
    chartData,
    scalesData,
    allData,
    measures,
    dimensions,
    aspectRatio,
    chartConfig,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();

  const dimensionsByIri = useMemo(
    () => Object.fromEntries(dimensions.map((d) => [d.iri, d])),
    [dimensions]
  );
  const xDimension = dimensionsByIri[fields.x.componentIri];
  if (!xDimension) {
    throw Error(`No dimension <${fields.x.componentIri}> in cube!`);
  }

  const xIsTime = isTemporalDimension(xDimension);
  const timeUnit = xIsTime
    ? (xDimension as TemporalDimension).timeUnit
    : undefined;
  const xDimensionValues = useMemo(() => {
    return getMaybeTemporalDimensionValues(xDimension, chartData);
  }, [xDimension, chartData]);

  const { getAbbreviationOrLabelByValue: getXAbbreviationOrLabel } =
    useMaybeAbbreviations({
      useAbbreviations: fields.x.useAbbreviations,
      dimensionIri: xDimension.iri,
      dimensionValues: xDimensionValues,
    });

  const { getValue: getX, getLabel: getXLabel } = useObservationLabels(
    chartData,
    getXAbbreviationOrLabel,
    fields.x.componentIri
  );

  const getXAsDate = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const errorMeasure = useErrorMeasure(props, fields.y.componentIri);
  const getYErrorRange = useErrorRange(errorMeasure, getY);
  const getYError = useErrorVariable(errorMeasure);
  const getSegment = useSegment(fields.segment?.componentIri);
  const showStandardError = get(fields, ["y", "showStandardError"], true);

  // Scales
  const { xScale, yScale, xEntireScale, xScaleInteraction, bandDomainLabels } =
    useMemo(() => {
      // x
      const sorters = makeDimensionValueSorters(xDimension, {
        sorting: fields.x.sorting,
        useAbbreviations: fields.x.useAbbreviations,
        dimensionFilter: xDimension?.iri
          ? chartConfig.filters[xDimension.iri]
          : undefined,
      });
      const sortingOrders = getSortingOrders(sorters, fields.x.sorting);
      const bandDomain = orderBy(
        [...new Set(scalesData.map(getX))],
        sorters,
        sortingOrders
      );
      const bandDomainLabels = bandDomain.map(getXLabel);
      const xScale = scaleBand()
        .domain(bandDomain)
        .paddingInner(PADDING_INNER)
        .paddingOuter(PADDING_OUTER);
      const xScaleInteraction = scaleBand()
        .domain(bandDomain)
        .paddingInner(0)
        .paddingOuter(0);

      // x as time, needs to be memoized!
      const xEntireDomainAsTime = extent(scalesData, (d) => getXAsDate(d)) as [
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
        xScale,
        yScale,
        xEntireScale,
        xScaleInteraction,
        bandDomainLabels,
      };
    }, [
      getX,
      getXLabel,
      getXAsDate,
      getY,
      getYErrorRange,
      scalesData,
      fields.x.sorting,
      fields.x.useAbbreviations,
      xDimension,
      chartConfig.filters,
    ]);

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);
  const formatters = useChartFormatters(props);

  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const { left, bottom } = useChartPadding(
    yScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    bandDomainLabels
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

  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // segments
  const { segments, colors, getSegmentLabel } = useMemo(() => {
    const segments: string[] = [];
    const colors = scaleOrdinal(segments).domain(segments);
    const getSegmentLabel = (segment: string) => segment;

    return { segments, colors, getSegmentLabel };
  }, []);

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const xRef = xScale(getX(d)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(Math.max(getY(d) ?? NaN, 0));
    const yAnchor = yRef;

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
    const xAnchor = getXAnchor();
    const xLabel = getXAbbreviationOrLabel(d);

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.iri] || formatNumber,
        yMeasure.unit
      );

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: xIsTime && timeUnit ? timeFormatUnit(xLabel, timeUnit) : xLabel,
      datum: {
        label: undefined,
        value: `${yValueFormatter(getY(d))}`,
        error: getYError
          ? `${getYError(d)}${errorMeasure?.unit ?? ""}`
          : undefined,
        color: colors(getSegment(d)) as string,
      },
      values: undefined,
    };
  };

  return {
    chartType: "column",
    bounds,
    chartData,
    allData,
    getX,
    getXLabel,
    getXAsDate,
    xScale,
    xEntireScale,
    xIsTime,
    timeUnit,
    xScaleInteraction,
    getY,
    getYErrorRange,
    yScale,
    getSegment,
    getSegmentLabel,
    yAxisLabel,
    yAxisDimension: yMeasure,
    segments,
    colors,
    getAnnotationInfo,
    showStandardError,
  };
};

export const getColumnsStateMetadata = (
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

  const sortingType = fields.x.sorting?.sortingType;
  const sortingOrder = fields.x.sorting?.sortingOrder;

  return {
    assureDefined: {
      getY,
    },
    sortData: (data) => {
      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => descending(getX(a), getX(b)));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => ascending(getX(a), getX(b)));
      } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
        return [...data].sort((a, b) =>
          descending(getY(a) ?? -1, getY(b) ?? -1)
        );
      } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
        return [...data].sort((a, b) =>
          ascending(getY(a) ?? -1, getY(b) ?? -1)
        );
      } else {
        return [...data].sort((a, b) => ascending(getX(a), getX(b)));
      }
    },
  };
};

const ColumnChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...rest } = props;
  const state = useColumnsState(rest);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ColumnChart = (
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ColumnChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
