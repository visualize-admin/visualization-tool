import { ascending } from "d3";

import { TemporalValueGetter } from "@/charts/shared/chart-state";
import { Observation } from "@/domain/data";

export type BaseYGetter = {
  iri: string;
  label: string;
  getY: (d: Observation) => number | null;
};

export const sortData = (
  data: Observation[],
  { getX }: { getX: TemporalValueGetter }
): Observation[] => {
  return [...data].sort((a, b) => {
    return ascending(getX(a), getX(b));
  });
};
