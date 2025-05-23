import { useMemo } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { useChartState } from "@/charts/shared/chart-state";
import { createLimitsComponent } from "@/charts/shared/limits/create-component";
import { useLimits } from "@/config-utils";

export type HorizontalChartState = BarsState;

export const HorizontalLimits = (props: ReturnType<typeof useLimits>) => {
  const chartState = useChartState() as HorizontalChartState;
  const LimitsComponent = useMemo(() => {
    return createLimitsComponent({
      isHorizontal: true,
      getChartState: () => chartState,
    });
  }, [chartState]);

  return <LimitsComponent {...props} />;
};
HorizontalLimits.displayName = "HorizontalLimits";
