import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { useChartState } from "@/charts/shared/chart-state";

export const ComboLineColumn = () => {
  const state = useChartState() as ComboLineColumnState;
  console.log(state);

  return null;
};
