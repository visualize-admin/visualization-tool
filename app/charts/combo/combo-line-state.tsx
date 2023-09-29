import { ScaleLinear, ScaleOrdinal, ScaleTime } from "d3";

import {
  ComboLineStateVariables,
  useComboLineStateData,
  useComboLineStateVariables,
} from "@/charts/combo/combo-line-state-props";
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

export type ComboLineState = CommonChartState &
  ComboLineStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "combo";
    xKey: string;
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useComboLineState = (
  chartProps: ChartProps<ComboConfig> & { aspectRatio: number },
  variables: ComboLineStateVariables,
  data: ChartStateData
): ComboLineState => {
  return {} as unknown as ComboLineState;
};

const ComboLineChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineStateVariables(chartProps);
  const data = useComboLineStateData(chartProps, variables);
  const state = useComboLineState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
