import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { ComboLineSingle } from "@/charts/combo/combo-line-single";
import { ComboLineSingleChart } from "@/charts/combo/combo-line-single-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { ComboLineSingleConfig } from "@/config-types";
import { hasChartConfigs } from "@/configurator";
import { useConfiguratorState } from "@/src";

import { ChartProps, VisualizationProps } from "../shared/chart-props";

export const ChartComboLineSingleVisualization = (
  props: VisualizationProps<ComboLineSingleConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartComboLineSingle} />;
};

const ChartComboLineSingle = memo(
  (props: ChartProps<ComboLineSingleConfig>) => {
    const { chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;
    const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
    return (
      <ComboLineSingleChart {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <ComboLineSingle />
            <InteractionHorizontal />
            {shouldShowBrush(
              interactiveFiltersConfig,
              dashboardFilters?.timeRange
            ) && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler />
          <Tooltip type="multiple" />
        </ChartContainer>
      </ComboLineSingleChart>
    );
  }
);
