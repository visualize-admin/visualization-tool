import { useMemo } from "react";

import { useDimensionFormatters } from "@/formatters";

import { ChartProps } from "./ChartProps";

const useChartFormatters = (
  chartProps: Pick<ChartProps, "measures" | "dimensions">
) => {
  const { measures, dimensions } = chartProps;
  const allDimensions = useMemo(
    () => [...measures, ...dimensions],
    [measures, dimensions]
  );
  const formatters = useDimensionFormatters(allDimensions);
  return formatters;
};

export default useChartFormatters;
