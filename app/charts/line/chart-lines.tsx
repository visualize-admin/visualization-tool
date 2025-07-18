import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { ErrorWhiskers, Lines } from "@/charts/line/lines";
import { LineChart } from "@/charts/line/lines-state";
import { useIsEditingAnnotation } from "@/charts/shared/annotation-utils";
import { Annotations } from "@/charts/shared/annotations";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisHideXOverflowRect } from "@/charts/shared/axis-hide-overflow-rect";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { HoverAnnotationDot } from "@/charts/shared/interaction/hover-annotation-dot";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { VerticalLimits } from "@/charts/shared/limits/vertical";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import { LineConfig } from "@/config-types";
import { useLimits } from "@/config-utils";
import {
  hasChartConfigs,
  useConfiguratorState,
} from "@/configurator/configurator-state";

import { ChartProps, VisualizationProps } from "../shared/chart-props";

export const ChartLinesVisualization = (
  props: VisualizationProps<LineConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartLines} />;
};

const ChartLines = memo((props: ChartProps<LineConfig>) => {
  const { chartConfig, dimensions, measures, dimensionsById } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  const limits = useLimits({
    chartConfig,
    dimensions,
    measures,
  });
  const isEditingAnnotation = useIsEditingAnnotation();

  return (
    <LineChart {...props} limits={limits}>
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear />
          <Lines
            dotSize={
              "showDots" in chartConfig.fields.y &&
              "showDotsSize" in chartConfig.fields.y &&
              chartConfig.fields.y.showDots
                ? chartConfig.fields.y.showDotsSize
                : undefined
            }
          />
          <AxisHideXOverflowRect />
          <AxisTime />
          <AxisTimeDomain />
          <ErrorWhiskers />
          <VerticalLimits {...limits} />
          {isEditingAnnotation ? (
            <InteractionVoronoi />
          ) : (
            <InteractionHorizontal />
          )}
          {shouldShowBrush(
            interactiveFiltersConfig,
            dashboardFilters?.timeRange
          ) && <BrushTime />}
        </ChartSvg>
        <Ruler />
        {isEditingAnnotation ? <HoverAnnotationDot /> : <HoverDotMultiple />}
        <Tooltip type={fields.segment ? "multiple" : "single"} />
      </ChartContainer>
      <Annotations />
      {(fields.segment || limits.limits.length > 0) && (
        <ChartControlsContainer>
          <LegendColor
            dimensionsById={dimensionsById}
            chartConfig={chartConfig}
            symbol="line"
            interactive={interactiveFiltersConfig?.legend.active}
            showTitle={fields.segment?.showTitle}
            limits={limits}
          />
        </ChartControlsContainer>
      )}
    </LineChart>
  );
});
