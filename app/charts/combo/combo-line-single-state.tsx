import { ScaleLinear, ScaleOrdinal, ScaleTime } from "d3";

import {
  ComboLineSingleStateVariables,
  useComboLineSingleStateData,
  useComboLineSingleStateVariables,
} from "@/charts/combo/combo-line-single-state-props";
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

export type ComboLineSingleState = CommonChartState &
  ComboLineSingleStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "combo";
    xKey: string;
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useComboLineSingleState = (
  chartProps: ChartProps<ComboConfig> & { aspectRatio: number },
  variables: ComboLineSingleStateVariables,
  data: ChartStateData
): ComboLineSingleState => {
  return {} as unknown as ComboLineSingleState;
};

const ComboLineSingleChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineSingleStateVariables(chartProps);
  const data = useComboLineSingleStateData(chartProps, variables);
  const state = useComboLineSingleState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineSingleChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineSingleChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
