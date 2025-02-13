import { memo } from "react";

import { Areas } from "@/charts/area/areas";
import { AreaChart } from "@/charts/area/areas-state";
import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
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
import { VerticalLimits } from "@/charts/shared/limits";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { AreaConfig } from "@/config-types";
import { getLimitMeasure, getRelatedLimitDimension } from "@/config-utils";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartAreasVisualization = (
  props: VisualizationProps<AreaConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartAreas} />;
};

const ChartAreas = memo((props: ChartProps<AreaConfig>) => {
  const { chartConfig, dimensions, measures } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const limitMeasure = getLimitMeasure({ chartConfig, measures });
  const relatedLimitDimension = getRelatedLimitDimension({
    chartConfig,
    dimensions,
  });

  return (
    <AreaChart {...props}>
      <ChartContainer>
        <ChartSvg>
          <AxisTime /> <AxisHeightLinear />
          <Areas /> <AxisTimeDomain />
          {limitMeasure && relatedLimitDimension ? (
            <VerticalLimits
              chartConfig={chartConfig}
              measure={limitMeasure}
              relatedDimension={relatedLimitDimension}
            />
          ) : null}
          <InteractionHorizontal />
          {interactiveFiltersConfig?.timeRange.active === true && <BrushTime />}
        </ChartSvg>
        <Tooltip type={fields.segment ? "multiple" : "single"} />
        <Ruler />
      </ChartContainer>
      {fields.segment && (
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="square"
            interactive={interactiveFiltersConfig?.legend.active}
          />
        </ChartControlsContainer>
      )}
    </AreaChart>
  );
});
