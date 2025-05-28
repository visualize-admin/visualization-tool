import isEqual from "lodash/isEqual";

import { Filters, FilterValue } from "@/config-types";
import { useChanges } from "@/utils/use-changes";

const isEqualFilter = (fa?: FilterValue, fb?: FilterValue) => {
  if (fa?.type === "single" && fb?.type === "single") {
    return fa.value === fb.value;
  }
  if (fa?.type === "range" && fb?.type === "range") {
    return fa.from === fb.from && fa.to === fb.to;
  }

  if (fa?.type === "multi" && fb?.type === "multi") {
    return isEqual(fa.values, fb.values);
  }

  return false;
};

const computeFilterChanges = (prev: Filters, cur: Filters) => {
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(cur)]);
  const res = [];

  for (const key of allKeys) {
    if (!isEqualFilter(prev[key], cur[key])) {
      res.push([key, prev[key], cur[key]] as const);
    }
  }

  return res;
};

export const useFilterChanges = (cur: Filters) => {
  return useChanges(cur, computeFilterChanges);
};
