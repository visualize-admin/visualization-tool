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
import { ScatterPlotConfig, useChartConfigFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartScatterplotVisualization = (
  props: VisualizationProps<ScatterPlotConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartScatterplot} />;
};

const ChartScatterplot = memo((props: ChartProps<ScatterPlotConfig>) => {
  const { chartConfig, dimensions } = props;
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
          {fields.segment && (
            <LegendColor
              chartConfig={chartConfig}
              symbol="circle"
              interactive={interactiveFiltersConfig?.legend.active}
            />
          )}
        </ChartControlsContainer>
      )}
    </ScatterplotChart>
  );
});
