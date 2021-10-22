import { string } from "io-ts";
import { isEqual } from "lodash";
import { ChartConfig, FilterValue } from ".";
import useChanges from "../utils/use-changes";

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

const computeFilterChanges = (
  prev: ChartConfig["filters"],
  cur: ChartConfig["filters"]
) => {
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(cur)]);
  const res = [];
  for (let key of allKeys) {
    if (!isEqualFilter(prev[key], cur[key])) {
      res.push([key, prev[key], cur[key]] as const);
    }
  }
  return res;
};

const useFilterChanges = (cur: ChartConfig["filters"]) => {
  return useChanges(cur, computeFilterChanges);
};

export default useFilterChanges;
