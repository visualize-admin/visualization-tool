import { memo, useCallback } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { ComboLineSingle } from "@/charts/combo/combo-line-single";
import { ComboLineSingleChart } from "@/charts/combo/combo-line-single-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { ComboLineSingleConfig } from "@/config-types";
import { useDashboardInteractiveFilters } from "@/stores/interactive-filters";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartComboLineSingleVisualization = (
  props: VisualizationProps<ComboLineSingleConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartComboLineSingle} />;
};

const ChartComboLineSingle = memo(
  (props: ChartProps<ComboLineSingleConfig>) => {
    const { chartConfig, measures } = props;
    const { interactiveFiltersConfig } = chartConfig;
    const { sharedFilters } = useDashboardInteractiveFilters();

    const getLegendItemDimension = useCallback(
      (label: string) => {
        return measures.find((measure) => measure.label === label);
      },
      [measures]
    );

    return (
      <ComboLineSingleChart {...props}>
        <ChartContainer type="comboLineSingle">
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <ComboLineSingle />
            <InteractionHorizontal />
            {shouldShowBrush(interactiveFiltersConfig, sharedFilters) && (
              <BrushTime />
            )}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler />
          <Tooltip type="multiple" />
        </ChartContainer>
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="line"
            getLegendItemDimension={getLegendItemDimension}
          />
        </ChartControlsContainer>
      </ComboLineSingleChart>
    );
  }
);
