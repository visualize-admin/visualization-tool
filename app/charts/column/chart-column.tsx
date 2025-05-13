import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { Columns, ErrorWhiskers } from "@/charts/column/columns";
import {
  ColumnsGrouped,
  ErrorWhiskers as ErrorWhiskersGrouped,
} from "@/charts/column/columns-grouped";
import { GroupedColumnChart } from "@/charts/column/columns-grouped-state";
import { ColumnsStacked } from "@/charts/column/columns-stacked";
import { StackedColumnsChart } from "@/charts/column/columns-stacked-state";
import { ColumnChart } from "@/charts/column/columns-state";
import { InteractionColumns } from "@/charts/column/overlay-columns";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisHideXOverflowRect } from "@/charts/shared/axis-hide-overflow-rect";
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "@/charts/shared/axis-width-band";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { VerticalLimits } from "@/charts/shared/limits";
import { ColumnConfig } from "@/config-types";
import { useChartConfigFilters, useLimits } from "@/config-utils";
import { hasChartConfigs } from "@/configurator";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { useConfiguratorState } from "@/src";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartColumnsVisualization = (
  props: VisualizationProps<ColumnConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartColumns} />;
};

const ChartColumns = memo((props: ChartProps<ColumnConfig>) => {
  const { chartConfig, dimensions, measures, dimensionsById } = props;
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
        <StackedColumnsChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <ColumnsStacked />
              <AxisHideXOverflowRect />
              <AxisWidthBand />
              <AxisWidthBandDomain />
              <InteractionColumns />
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
              interactive={interactiveFiltersConfig?.legend.active}
              showTitle={fields.segment.showTitle}
            />
          </ChartControlsContainer>
        </StackedColumnsChart>
      ) : fields.segment?.componentId && fields.segment.type === "grouped" ? (
        <GroupedColumnChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <ColumnsGrouped />
              <AxisHideXOverflowRect />
              <AxisWidthBand />
              <AxisWidthBandDomain />
              <ErrorWhiskersGrouped />
              <InteractionColumns />
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
              interactive={interactiveFiltersConfig?.legend.active}
              showTitle={fields.segment.showTitle}
            />
          </ChartControlsContainer>
        </GroupedColumnChart>
      ) : (
        <ColumnChart {...props} limits={limits}>
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <Columns />
              <AxisHideXOverflowRect />
              <AxisWidthBand />
              <AxisWidthBandDomain />
              <ErrorWhiskers />
              <VerticalLimits {...limits} />
              <InteractionColumns />
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
        </ColumnChart>
      )}
    </>
  );
});
