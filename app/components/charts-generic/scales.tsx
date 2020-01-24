import { useChartState } from "./chart-state";
import { schemeSet3 } from "d3-scale-chromatic";

import { scaleOrdinal } from "d3-scale";
import { Observation } from "../../domain";

export const useColorScale = ({
  data,
  field
}: {
  data: Observation[];
  field: string;
}) => {
  // @ts-ignore
  const [state, dispatch] = useChartState();

  return scaleOrdinal(schemeSet3).domain(data.map(d => d[field] as string));
};
