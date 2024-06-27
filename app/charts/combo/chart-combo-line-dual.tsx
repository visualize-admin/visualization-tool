import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { AxisHeightLinearDual } from "@/charts/combo/axis-height-linear-dual";
import { ComboLineDual } from "@/charts/combo/combo-line-dual";
import { ComboLineDualChart } from "@/charts/combo/combo-line-dual-state";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { ComboLineDualConfig } from "@/config-types";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartComboLineDualVisualization = (
  props: VisualizationProps<ComboLineDualConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartComboLineDual} />;
};

const ChartComboLineDual = memo((props: ChartProps<ComboLineDualConfig>) => {
  const { chartConfig } = props;
  const { interactiveFiltersConfig } = chartConfig;
  const { sharedTimeRangeFilters } = useDashboardInteractiveFilters();

  return (
    <ComboLineDualChart {...props}>
      <ChartContainer type="comboLineDual">
        <ChartSvg>
          <AxisHeightLinearDual orientation="left" />
          <AxisHeightLinearDual orientation="right" /> <AxisTime />
          <AxisTimeDomain />
          <ComboLineDual />
          <InteractionHorizontal />
          {shouldShowBrush(
            interactiveFiltersConfig,
            sharedTimeRangeFilters
          ) && <BrushTime />}
        </ChartSvg>
        <HoverDotMultiple />
        <Ruler />
        <Tooltip type="multiple" />
      </ChartContainer>
    </ComboLineDualChart>
  );
});
