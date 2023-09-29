import { ComboLineState } from "@/charts/combo/combo-line-state";
import { useChartState } from "@/charts/shared/chart-state";

export const ComboLine = () => {
  const state = useChartState() as ComboLineState;
  console.log(state);

  return null;
};
