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
import {
  AxisWidthBand,
  AxisWidthBandDomain,
} from "@/charts/shared/axis-width-band";
import { BrushTime } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { ColumnConfig, useChartConfigFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartColumnsVisualization = (
  props: VisualizationProps<ColumnConfig>
) => {
  return <ChartDataWrapper {...props} Component={ChartColumns} />;
};

export const ChartColumns = memo((props: ChartProps<ColumnConfig>) => {
  const { chartConfig, dimensions } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const filters = useChartConfigFilters(chartConfig);

  return (
    <>
      {fields.segment?.componentIri && fields.segment.type === "stacked" ? (
        <StackedColumnsChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear /> <AxisWidthBand />
              <ColumnsStacked /> <AxisWidthBandDomain />
              <InteractionColumns />
              {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
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
        </StackedColumnsChart>
      ) : fields.segment?.componentIri && fields.segment.type === "grouped" ? (
        <GroupedColumnChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <AxisWidthBand />
              <ColumnsGrouped />
              <ErrorWhiskersGrouped />
              <AxisWidthBandDomain />
              <InteractionColumns />
              {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
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
        </GroupedColumnChart>
      ) : (
        <ColumnChart {...props}>
          <ChartContainer>
            <ChartSvg>
              <AxisHeightLinear />
              <AxisWidthBand />
              <Columns />
              <ErrorWhiskers />
              <AxisWidthBandDomain />
              <InteractionColumns />
              {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
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
        </ColumnChart>
      )}
    </>
  );
});
