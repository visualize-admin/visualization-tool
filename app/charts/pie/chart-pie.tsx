import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { Pie } from "@/charts/pie/pie";
import { PieChart } from "@/charts/pie/pie-state";
import { AxisHeightTitle } from "@/charts/shared/axis-height-title";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { OnlyNegativeDataHint } from "@/components/hint";
import { PieConfig } from "@/config-types";
import { useChartConfigFilters } from "@/config-utils";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";

import { ChartProps, VisualizationProps } from "../shared/chart-props";

export const ChartPieVisualization = (props: VisualizationProps<PieConfig>) => {
  return <ChartDataWrapper {...props} Component={ChartPie} />;
};

const ChartPie = memo((props: ChartProps<PieConfig>) => {
  const { chartConfig, observations, dimensions, dimensionsById } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const somePositive = observations.some(
    (d) => (d[fields?.y?.componentId] as number) > 0
  );
  const filters = useChartConfigFilters(chartConfig);

  if (!somePositive) {
    return <OnlyNegativeDataHint />;
  }

  return (
    <PieChart {...props}>
      <ChartContainer>
        <ChartSvg>
          <AxisHeightTitle />
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
          dimensionsById={dimensionsById}
          chartConfig={chartConfig}
          symbol="square"
          interactive={
            fields.segment && interactiveFiltersConfig?.legend.active
          }
          showTitle={fields.segment.showTitle}
        />
      </ChartControlsContainer>
    </PieChart>
  );
});
