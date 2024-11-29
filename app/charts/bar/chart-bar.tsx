import { memo } from "react";

import { Bars, ErrorWhiskers } from "@/charts/bar/bars";
import {
  BarsGrouped,
  ErrorWhiskers as ErrorWhiskersGrouped,
} from "@/charts/bar/bars-grouped";
import { GroupedBarChart } from "@/charts/bar/bars-grouped-state";
import { BarsStacked } from "@/charts/bar/bars-stacked";
import { StackedBarsChart } from "@/charts/bar/bars-stacked-state";
import { BarChart } from "@/charts/bar/bars-state";
import { InteractionBars } from "@/charts/bar/overlay-bars";
import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "@/charts/shared/axis-width-band-vertical";
import { AxisWidthLinear } from "@/charts/shared/axis-width-linear";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { BarConfig, useChartConfigFilters } from "@/config-types";
import { hasChartConfigs } from "@/configurator";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { useConfiguratorState } from "@/src";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartBarsVisualization = (
  props: VisualizationProps<BarConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartBars} />;
};

const ChartBars = memo((props: ChartProps<BarConfig>) => {
  const { chartConfig, dimensions } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const filters = useChartConfigFilters(chartConfig);
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  const showTimeBrush = shouldShowBrush(
    interactiveFiltersConfig,
    dashboardFilters?.timeRange
  );

  return (
    <>
      {fields.segment?.componentId && fields.segment.type === "stacked" ? (
        <StackedBarsChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisWidthLinear />
              <AxisWidthBand />
              <BarsStacked />
              <AxisWidthBandDomain />
              <InteractionBars />
              {showTimeBrush && <BrushTime />}
            </ChartSvg>
            <Tooltip type="multiple" />
          </ChartContainer>
          <ChartControlsContainer>
            {fields.animation && (
              <TimeSlider
                filters={filters}
                dimensions={dimensions}
                {...fields.animation}
              />
            )}
            <LegendColor
              chartConfig={chartConfig}
              symbol="square"
              interactive={
                fields.segment && interactiveFiltersConfig?.legend.active
              }
            />
          </ChartControlsContainer>
        </StackedBarsChart>
      ) : fields.segment?.componentId && fields.segment.type === "grouped" ? (
        <GroupedBarChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisWidthLinear />
              <AxisWidthBand />
              <BarsGrouped />
              <ErrorWhiskersGrouped />
              <AxisWidthBandDomain />
              <InteractionBars />
              {showTimeBrush && <BrushTime />}
            </ChartSvg>
            <Tooltip type="multiple" />
          </ChartContainer>
          <ChartControlsContainer>
            {fields.animation && (
              <TimeSlider
                filters={filters}
                dimensions={dimensions}
                {...fields.animation}
              />
            )}
            <LegendColor
              chartConfig={chartConfig}
              symbol="square"
              interactive={
                fields.segment && interactiveFiltersConfig?.legend.active
              }
            />
          </ChartControlsContainer>
        </GroupedBarChart>
      ) : (
        <BarChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisWidthLinear />
              <AxisWidthBand />
              <Bars />
              <ErrorWhiskers />
              <AxisWidthBandDomain />
              <InteractionBars />
              {showTimeBrush && <BrushTime />}
            </ChartSvg>
            <Tooltip type="single" />
          </ChartContainer>
          {fields.animation && (
            <ChartControlsContainer>
              <TimeSlider
                filters={filters}
                dimensions={dimensions}
                {...fields.animation}
              />
            </ChartControlsContainer>
          )}
        </BarChart>
      )}
    </>
  );
});
