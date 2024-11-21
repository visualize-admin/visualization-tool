import { ascending } from "d3-array";

import { TemporalValueGetter } from "@/charts/shared/chart-state";
import { Measure, Observation } from "@/domain/data";

export type BaseYGetter = {
  dimension: Measure;
  id: string;
  label: string;
  color: string;
  getY: (d: Observation) => number | null;
  getMinY: (data: Observation[]) => number;
};

export const sortComboData = (
  data: Observation[],
  { getX }: { getX: TemporalValueGetter }
): Observation[] => {
  return [...data].sort((a, b) => {
    return ascending(getX(a), getX(b));
  });
};
