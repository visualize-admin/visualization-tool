import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { InteractionColumns } from "@/charts/column/overlay-columns";
import { AxisHeightLinearDual } from "@/charts/combo/axis-height-linear-dual";
import { ComboLineColumn } from "@/charts/combo/combo-line-column";
import { ComboLineColumnChart } from "@/charts/combo/combo-line-column-state";
import { AxisWidthBand } from "@/charts/shared/axis-width-band";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { ComboLineColumnConfig } from "@/config-types";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartComboLineColumnVisualization = (
  props: VisualizationProps<ComboLineColumnConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartComboLineColumn} />;
};

const ChartComboLineColumn = memo(
  (props: ChartProps<ComboLineColumnConfig>) => {
    const { chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;
    const { sharedFilters } = useDashboardInteractiveFilters();

    return (
      <ComboLineColumnChart {...props}>
        <ChartContainer type="comboLineColumn">
          <ChartSvg>
            <AxisHeightLinearDual orientation="left" />
            <AxisHeightLinearDual orientation="right" />
            <AxisWidthBand />
            <ComboLineColumn />
            <InteractionColumns />
            {shouldShowBrush(interactiveFiltersConfig, sharedFilters) && (
              <BrushTime />
            )}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler rotate />
          <Tooltip type="multiple" />
        </ChartContainer>
      </ComboLineColumnChart>
    );
  }
);
