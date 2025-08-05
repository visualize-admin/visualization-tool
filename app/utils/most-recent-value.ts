import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import { Dimension, DimensionValue } from "@/domain/data";
import { VISUALIZE_MOST_RECENT_VALUE } from "@/domain/most-recent-value";
import { makeDimensionValueSorters } from "@/utils/sorting-values";

export const resolveMostRecentValue = (
  value: DimensionValue["value"] | null | undefined,
  dimension: Dimension | undefined
) => {
  if (value === VISUALIZE_MOST_RECENT_VALUE && dimension?.values.length) {
    const sorters = makeDimensionValueSorters(dimension);
    const sortedValues = orderBy(
      dimension.values,
      sorters.map((s) => (dv) => s(dv.label))
    );
    return sortedValues[sortedValues.length - 1]?.value;
  }
  return value;
};

export const useResolveMostRecentValue = (
  value: DimensionValue["value"] | null | undefined,
  dimension: Dimension | undefined
) => {
  return useMemo(() => {
    return resolveMostRecentValue(value, dimension);
  }, [value, dimension]);
};
