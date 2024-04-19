import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { Pie } from "@/charts/pie/pie";
import { PieChart } from "@/charts/pie/pie-state";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { OnlyNegativeDataHint } from "@/components/hint";
import { PieConfig, useChartConfigFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartPieVisualization = (props: VisualizationProps<PieConfig>) => {
  return <ChartDataWrapper {...props} Component={ChartPie} />;
};

export const ChartPie = memo((props: ChartProps<PieConfig>) => {
  const { chartConfig, observations, dimensions } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const somePositive = observations.some(
    (d) => (d[fields?.y?.componentIri] as number) > 0
  );
  const filters = useChartConfigFilters(chartConfig);

  if (!somePositive) {
    return <OnlyNegativeDataHint />;
  }

  return (
    <PieChart aspectRatio={0.4} {...props}>
      <ChartContainer>
        <ChartSvg>
          <Pie />
        </ChartSvg>
        <Tooltip type="single" />
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
    </PieChart>
  );
});
