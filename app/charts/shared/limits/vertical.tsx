import { useMemo } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { createLimitsComponent } from "@/charts/shared/limits/create-component";
import { useLimits } from "@/config-utils";

export type VerticalChartState = AreasState | ColumnsState | LinesState;

export const VerticalLimits = (props: ReturnType<typeof useLimits>) => {
  const chartState = useChartState() as VerticalChartState;
  const LimitsComponent = useMemo(() => {
    return createLimitsComponent({
      isHorizontal: false,
      getChartState: () => chartState,
    });
  }, [chartState]);

  return <LimitsComponent {...props} />;
};
VerticalLimits.displayName = "VerticalLimits";
