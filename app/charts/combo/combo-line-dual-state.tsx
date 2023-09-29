import { ScaleLinear, ScaleOrdinal, ScaleTime } from "d3";

import {
  ComboLineDualStateVariables,
  useComboLineDualStateData,
  useComboLineDualStateVariables,
} from "@/charts/combo/combo-line-dual-state-props";
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

export type ComboLineDualState = CommonChartState &
  ComboLineDualStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "combo";
    xKey: string;
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useComboLineDualState = (
  chartProps: ChartProps<ComboConfig> & { aspectRatio: number },
  variables: ComboLineDualStateVariables,
  data: ChartStateData
): ComboLineDualState => {
  return {} as unknown as ComboLineDualState;
};

const ComboLineDualChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineDualStateVariables(chartProps);
  const data = useComboLineDualStateData(chartProps, variables);
  const state = useComboLineDualState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineDualChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineDualChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
