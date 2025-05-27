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
  AxisHeightBand,
  AxisHeightBandDomain,
} from "@/charts/shared/axis-height-band";
import { AxisHideYOverflowRect } from "@/charts/shared/axis-hide-overflow-rect";
import { AxisWidthLinear } from "@/charts/shared/axis-width-linear";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { HorizontalLimits } from "@/charts/shared/limits/horizontal";
import { BarConfig } from "@/config-types";
import { useChartConfigFilters, useLimits } from "@/config-utils";
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
  const { chartConfig, dimensions, dimensionsById, measures } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const filters = useChartConfigFilters(chartConfig);
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  const showTimeBrush = shouldShowBrush(
    interactiveFiltersConfig,
    dashboardFilters?.timeRange
  );
  const limits = useLimits({
    chartConfig,
    dimensions,
    measures,
  });

  return (
    <>
      {fields.segment?.componentId && fields.segment.type === "stacked" ? (
        <StackedBarsChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisWidthLinear />
              <BarsStacked />
              <AxisHideYOverflowRect />
              <AxisHeightBand />
              <AxisHeightBandDomain />
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
              dimensionsById={dimensionsById}
              chartConfig={chartConfig}
              symbol="square"
              interactive={interactiveFiltersConfig.legend.active}
              showTitle={fields.segment.showTitle}
            />
          </ChartControlsContainer>
        </StackedBarsChart>
      ) : fields.segment?.componentId && fields.segment.type === "grouped" ? (
        <GroupedBarChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisWidthLinear />
              <BarsGrouped />
              <AxisHideYOverflowRect />
              <AxisHeightBand />
              <AxisHeightBandDomain />
              <ErrorWhiskersGrouped />
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
              dimensionsById={dimensionsById}
              chartConfig={chartConfig}
              symbol="square"
              interactive={interactiveFiltersConfig.legend.active}
              showTitle={fields.segment.showTitle}
            />
          </ChartControlsContainer>
        </GroupedBarChart>
      ) : (
        <BarChart {...props} limits={limits}>
          <ChartContainer>
            <ChartSvg>
              <AxisWidthLinear />
              <Bars />
              <AxisHideYOverflowRect />
              <AxisHeightBand />
              <AxisHeightBandDomain />
              <ErrorWhiskers />
              <HorizontalLimits {...limits} />
              <InteractionBars />
              {showTimeBrush && <BrushTime />}
            </ChartSvg>
            <Tooltip type="single" />
          </ChartContainer>
          {fields.animation || limits.limits.length > 0 ? (
            <ChartControlsContainer>
              {limits.limits.length > 0 && (
                <LegendColor
                  limits={limits}
                  dimensionsById={dimensionsById}
                  chartConfig={chartConfig}
                  symbol="square"
                />
              )}
              {fields.animation && (
                <TimeSlider
                  filters={filters}
                  dimensions={dimensions}
                  {...fields.animation}
                />
              )}
            </ChartControlsContainer>
          ) : null}
        </BarChart>
      )}
    </>
  );
});
