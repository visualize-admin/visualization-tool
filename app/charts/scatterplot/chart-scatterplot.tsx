import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { Scatterplot } from "@/charts/scatterplot/scatterplot";
import { ScatterplotChart } from "@/charts/scatterplot/scatterplot-state";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "@/charts/shared/axis-height-linear";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "@/charts/shared/axis-width-linear";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import { ScatterPlotConfig } from "@/config-types";
import { useChartConfigFilters } from "@/config-utils";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";
import { Ruler } from "../shared/interaction/ruler";

export const ChartScatterplotVisualization = (
  props: VisualizationProps<ScatterPlotConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartScatterplot} />;
};

const ChartScatterplot = memo((props: ChartProps<ScatterPlotConfig>) => {
  const { chartConfig, dimensions, dimensionsById, embedParams } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const filters = useChartConfigFilters(chartConfig);

  return (
    <ScatterplotChart {...props}>
      <ChartContainer>
        <ChartSvg>
          <AxisWidthLinear />
          <AxisHeightLinear />
          <AxisWidthLinearDomain />
          <AxisHeightLinearDomain />
          <Scatterplot />
          <InteractionVoronoi />
        </ChartSvg>
        <Ruler />
        <Tooltip type="single" />
      </ChartContainer>
      {(fields.animation || fields.segment) && (
        <ChartControlsContainer>
          {fields.animation && (
            <TimeSlider
              filters={filters}
              dimensions={dimensions}
              {...fields.animation}
            />
          )}
          {fields.segment && !embedParams?.removeLegend && (
            <LegendColor
              dimensionsById={dimensionsById}
              chartConfig={chartConfig}
              symbol="circle"
              interactive={interactiveFiltersConfig?.legend.active}
              showTitle={fields.segment.showTitle}
            />
          )}
        </ChartControlsContainer>
      )}
    </ScatterplotChart>
  );
});
