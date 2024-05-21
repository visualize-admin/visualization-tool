import { extent, groups, max, min, sum } from "d3-array";
import { scaleLinear, scaleOrdinal, scaleTime } from "d3-scale";
import { useMemo } from "react";

import { useHeight, useWidth } from "@/charts/shared/use-width";
import { Observation } from "@/domain/data";
import { useFormatNumber, useTimeFormatUnit } from "@/formatters";

type UseCommonComboStateOptions = {
  chartData: Observation[];
  timeRangeData: Observation[];
  xKey: string;
  getXAsDate: (d: Observation) => Date;
  getXAsString: (d: Observation) => string;
  yGetters: {
    label: string;
    getY: (d: Observation) => number | null;
    color: string;
  }[];
  computeTotal: boolean;
};

export const useCommonComboState = (options: UseCommonComboStateOptions) => {
  const {
    chartData,
    timeRangeData,
    xKey,
    getXAsDate,
    getXAsString,
    yGetters,
    computeTotal,
  } = options;

  const width = useWidth();
  const height = useHeight();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();

  const chartDataByX = useMemo(() => {
    return groups(chartData, getXAsString).sort();
  }, [chartData, getXAsString]);

  const chartWideData = useMemo(() => {
    const chartWideData: Observation[] = [];

    for (const [date, observations] of chartDataByX) {
      const total = computeTotal
        ? sum(observations, (o) => sum(yGetters, (d) => d.getY(o)))
        : 0;
      const observation = Object.assign(
        {
          [xKey]: date,
          [`${xKey}/__iri__`]: observations[0][`${xKey}/__iri__`],
          total,
        },
        ...observations.flatMap((o) =>
          yGetters.map((d) => ({ [d.label]: d.getY(o) }))
        )
      );

      chartWideData.push(observation);
    }

    return chartWideData;
  }, [computeTotal, chartDataByX, xKey, yGetters]);

  const xScaleTime = useMemo(() => {
    const domain = extent(chartData, getXAsDate) as [Date, Date];
    return scaleTime().domain(domain);
  }, [chartData, getXAsDate]);

  const xScaleTimeRange = useMemo(() => {
    const domain = extent(timeRangeData, getXAsDate) as [Date, Date];
    return scaleTime().domain(domain);
  }, [getXAsDate, timeRangeData]);

  const colors = useMemo(() => {
    const domain = yGetters.map((d) => d.label);
    const range = yGetters.map((d) => d.color);

    return scaleOrdinal<string, string>().domain(domain).range(range);
  }, [yGetters]);

  return {
    width,
    height,
    formatNumber,
    timeFormatUnit,
    chartWideData,
    xScaleTime,
    xScaleTimeRange,
    colors,
  };
};

type UseLeftRightYScalesOptions = {
  scalesData: Observation[];
  paddingData: Observation[];
  getY:
    | ((d: Observation) => number | null)
    | ((d: Observation) => number | null)[];
  startAtZero?: boolean;
};

export const useYScales = (options: UseLeftRightYScalesOptions) => {
  const { scalesData, paddingData, getY, startAtZero } = options;
  const getMinY = (o: Observation) => {
    return Array.isArray(getY) ? min(getY, (d) => d(o)) : getY(o);
  };
  const getMaxY = (o: Observation) => {
    return Array.isArray(getY) ? max(getY, (d) => d(o)) : getY(o);
  };

  const minValue = startAtZero ? 0 : min(scalesData, getMinY) ?? 0;
  const maxValue = max(scalesData, getMaxY) ?? 0;
  const yScale = scaleLinear().domain([minValue, maxValue]).nice();

  const paddingMinValue = startAtZero ? 0 : min(paddingData, getMinY) ?? 0;
  const paddingMaxValue = max(paddingData, getMaxY) ?? 0;
  const paddingYScale = scaleLinear()
    .domain([paddingMinValue, paddingMaxValue])
    .nice();

  return { yScale, paddingYScale };
};

type GetMarginsOptions = {
  left: number;
  top?: number;
  right?: number;
  bottom: number;
};

export const getMargins = (options: GetMarginsOptions) => {
  const { left, top = 50, right = 40, bottom } = options;
  return { top, right, bottom, left };
};

type Scale =
  | d3.ScaleTime<number, number>
  | d3.ScaleBand<string>
  | d3.ScaleLinear<number, number>;

export const adjustScales = (
  xScales: Scale[],
  yScales: Scale[],
  options: { chartWidth: number; chartHeight: number }
) => {
  const { chartWidth, chartHeight } = options;
  xScales.forEach((scale) => scale.range([0, chartWidth]));
  yScales.forEach((scale) => scale.range([chartHeight, 0]));
};
