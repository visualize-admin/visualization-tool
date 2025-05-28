import { useMemo } from "react";

import { useDimensionFormatters } from "@/formatters";

import { BaseChartProps } from "./chart-props";

export const useChartFormatters = (
  chartProps: Pick<BaseChartProps, "dimensions" | "measures">
) => {
  const { dimensions, measures } = chartProps;
  const components = useMemo(
    () => [...dimensions, ...measures],
    [dimensions, measures]
  );

  return useDimensionFormatters(components);
};
