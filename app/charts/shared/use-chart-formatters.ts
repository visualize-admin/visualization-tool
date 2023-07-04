import { useMemo } from "react";

import { useDimensionFormatters } from "@/formatters";

import { BaseChartProps } from "./ChartProps";

const useChartFormatters = (
  chartProps: Pick<BaseChartProps, "dimensions" | "measures">
) => {
  const { dimensions, measures } = chartProps;
  const components = useMemo(
    () => [...dimensions, ...measures],
    [dimensions, measures]
  );
  const formatters = useDimensionFormatters(components);

  return formatters;
};

export default useChartFormatters;
