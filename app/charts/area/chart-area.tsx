import { memo } from "react";

import { Areas } from "@/charts/area/areas";
import { AreaChart } from "@/charts/area/areas-state";
import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { useIsEditingAnnotation } from "@/charts/shared/annotation-utils";
import { Annotations } from "@/charts/shared/annotations";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisHideXOverflowRect } from "@/charts/shared/axis-hide-overflow-rect";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { HoverAnnotationDot } from "@/charts/shared/interaction/hover-annotation-dot";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { VerticalLimits } from "@/charts/shared/limits/vertical";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import { AreaConfig } from "@/config-types";
import { useLimits } from "@/config-utils";

import { ChartProps, VisualizationProps } from "../shared/chart-props";

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
  const isEditingAnnotation = useIsEditingAnnotation();

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
          {isEditingAnnotation ? (
            <InteractionVoronoi />
          ) : (
            <InteractionHorizontal />
          )}
          {interactiveFiltersConfig?.timeRange.active === true && <BrushTime />}
        </ChartSvg>
        {isEditingAnnotation ? (
          <HoverAnnotationDot />
        ) : (
          <Tooltip type={fields.segment ? "multiple" : "single"} />
        )}
        <Ruler />
      </ChartContainer>
      <Annotations />
      {(fields.segment || limits.limits.length > 0) && (
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="square"
            interactive={interactiveFiltersConfig?.legend.active}
            showTitle={fields.segment?.showTitle}
            dimensionsById={dimensionsById}
            limits={limits}
          />
        </ChartControlsContainer>
      )}
    </AreaChart>
  );
});
