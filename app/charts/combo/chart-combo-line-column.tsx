import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { AxisHeightLinearDual } from "@/charts/combo/axis-height-linear-dual";
import { ComboLineColumn } from "@/charts/combo/combo-line-column";
import { ComboLineColumnChart } from "@/charts/combo/combo-line-column-state";
import { InteractionTemporalColumns } from "@/charts/combo/overlay-temporal-columns";
import { AxisWidthBand } from "@/charts/shared/axis-width-band";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { ComboLineColumnConfig } from "@/config-types";
import { hasChartConfigs } from "@/configurator";
import { useConfiguratorState } from "@/src";

import { ChartProps, VisualizationProps } from "../shared/chart-props";

export const ChartComboLineColumnVisualization = (
  props: VisualizationProps<ComboLineColumnConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartComboLineColumn} />;
};

const ChartComboLineColumn = memo(
  (props: ChartProps<ComboLineColumnConfig>) => {
    const { chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;
    const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
    return (
      <ComboLineColumnChart {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinearDual orientation="left" />
            <AxisHeightLinearDual orientation="right" />
            <AxisWidthBand />
            <ComboLineColumn />
            <InteractionTemporalColumns />
            {shouldShowBrush(
              interactiveFiltersConfig,
              dashboardFilters?.timeRange
            ) && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler rotate />
          <Tooltip type="multiple" />
        </ChartContainer>
      </ComboLineColumnChart>
    );
  }
);
