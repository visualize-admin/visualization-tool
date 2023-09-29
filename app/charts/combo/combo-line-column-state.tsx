import { ScaleLinear, ScaleOrdinal, ScaleTime } from "d3";

import {
  ComboLineColumnStateVariables,
  useComboLineColumnStateData,
  useComboLineColumnStateVariables,
} from "@/charts/combo/combo-line-column-state-props";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveXTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer } from "@/charts/shared/use-width";
import { ComboConfig } from "@/configurator";
import { Observation } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineColumnState = CommonChartState &
  ComboLineColumnStateVariables &
  InteractiveXTimeRangeState & {
    xKey: string;
    chartType: "combo";
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useComboLineColumnState = (
  chartProps: ChartProps<ComboConfig> & { aspectRatio: number },
  variables: ComboLineColumnStateVariables,
  data: ChartStateData
): ComboLineColumnState => {
  return {} as unknown as ComboLineColumnState;
};

const ComboLineColumnChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineColumnStateVariables(chartProps);
  const data = useComboLineColumnStateData(chartProps, variables);
  const state = useComboLineColumnState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineColumnChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineColumnChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
