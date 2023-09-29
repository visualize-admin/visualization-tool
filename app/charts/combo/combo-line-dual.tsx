import { ComboLineDualState } from "@/charts/combo/combo-line-dual-state";
import { useChartState } from "@/charts/shared/chart-state";

export const ComboLineDual = () => {
  const state = useChartState() as ComboLineDualState;
  console.log(state);

  return null;
};
