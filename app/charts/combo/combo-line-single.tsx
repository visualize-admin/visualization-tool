import { ComboLineSingleState } from "@/charts/combo/combo-line-single-state";
import { useChartState } from "@/charts/shared/chart-state";

export const ComboLineSingle = () => {
  const state = useChartState() as ComboLineSingleState;
  console.log(state);

  return null;
};
