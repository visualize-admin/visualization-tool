import { memo } from "react";

import { Areas } from "@/charts/area/areas";
import { AreaChart } from "@/charts/area/areas-state";
import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisHideXOverflowRect } from "@/charts/shared/axis-hide-overflow-rect";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { VerticalLimits } from "@/charts/shared/limits/vertical";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { AreaConfig } from "@/config-types";
import { useLimits } from "@/config-utils";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartAreasVisualization = (
  props: VisualizationProps<AreaConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartAreas} />;
};

const ChartAreas = memo((props: ChartProps<AreaConfig>) => {
  const { chartConfig, dimensions, measures, dimensionsById } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const limits = useLimits({
    chartConfig,
    dimensions,
    measures,
  });

  return (
    <AreaChart {...props} limits={limits}>
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear />
          <Areas />
          <AxisHideXOverflowRect />
          <AxisTime />
          <AxisTimeDomain />
          <VerticalLimits {...limits} />
          <InteractionHorizontal />
          {interactiveFiltersConfig.timeRange.active && <BrushTime />}
        </ChartSvg>
        <Tooltip type={fields.segment ? "multiple" : "single"} />
        <Ruler />
      </ChartContainer>
      {(fields.segment || limits.limits.length > 0) && (
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="square"
            interactive={interactiveFiltersConfig.legend.active}
            showTitle={fields.segment?.showTitle}
            dimensionsById={dimensionsById}
            limits={limits}
          />
        </ChartControlsContainer>
      )}
    </AreaChart>
  );
});
