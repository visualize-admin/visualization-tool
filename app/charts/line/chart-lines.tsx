import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { Lines } from "@/charts/line/lines";
import { LineChart } from "@/charts/line/lines-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
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

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartLinesVisualization = (
  props: VisualizationProps<LineConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartLines} />;
};

export const ChartLines = memo((props: ChartProps<LineConfig>) => {
  const { chartConfig } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;

  return (
    <LineChart {...props}>
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
          <Lines />
          <InteractionHorizontal />
          {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
        </ChartSvg>

        <Ruler />

        <HoverDotMultiple />

        <Tooltip type={fields.segment ? "multiple" : "single"} />
      </ChartContainer>

      {fields.segment && (
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="line"
            interactive={interactiveFiltersConfig?.legend.active}
          />
        </ChartControlsContainer>
      )}
    </LineChart>
  );
});
