import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { ErrorWhiskers, Lines, Points } from "@/charts/line/lines";
import { LineChart } from "@/charts/line/lines-state";
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
import { LineConfig } from "@/config-types";
import { hasChartConfigs, useConfiguratorState } from "@/configurator";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartLinesVisualization = (
  props: VisualizationProps<LineConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartLines} />;
};

const ChartLines = memo((props: ChartProps<LineConfig>) => {
  const { chartConfig, dimensionsById } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  return (
    <LineChart {...props}>
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
          <Lines />
          {"showDots" in chartConfig.fields.y &&
          "showDotsSize" in chartConfig.fields.y &&
          chartConfig.fields.y.showDots ? (
            <Points dotSize={chartConfig.fields.y.showDotsSize} />
          ) : null}
          <ErrorWhiskers />
          <InteractionHorizontal />
          {shouldShowBrush(
            interactiveFiltersConfig,
            dashboardFilters?.timeRange
          ) && <BrushTime />}
        </ChartSvg>

        <Ruler />

        <HoverDotMultiple />

        <Tooltip type={fields.segment ? "multiple" : "single"} />
      </ChartContainer>

      {fields.segment && (
        <ChartControlsContainer>
          <LegendColor
            dimensionsById={dimensionsById}
            chartConfig={chartConfig}
            symbol="line"
            interactive={interactiveFiltersConfig?.legend.active}
            showTitle={fields.segment && fields.segment.showTitle}
          />
        </ChartControlsContainer>
      )}
    </LineChart>
  );
});
