import { memo } from "react";

import { Areas } from "@/charts/area/areas";
import { AreaChart } from "@/charts/area/areas-state";
import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { AreaConfig, DataSource } from "@/config-types";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

import { ChartProps } from "../shared/ChartProps";

export const ChartAreasVisualization = ({
  dataSource,
  chartConfig,
  queryFilters,
  componentIris,
}: {
  dataSource: DataSource;
  chartConfig: AreaConfig;
  queryFilters?: DataCubeObservationFilter[];
  componentIris: string[] | undefined;
}) => {
  return (
    <ChartDataWrapper
      dataSource={dataSource}
      componentIris={componentIris}
      queryFilters={queryFilters}
      chartConfig={chartConfig}
      Component={ChartAreas}
    />
  );
};

export const ChartAreas = memo((props: ChartProps<AreaConfig>) => {
  const { chartConfig } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;

  return (
    <AreaChart aspectRatio={0.4} {...props}>
      <ChartContainer>
        <ChartSvg>
          <AxisTime /> <AxisHeightLinear />
          <Areas /> <AxisTimeDomain />
          <InteractionHorizontal />
          {interactiveFiltersConfig?.timeRange.active === true && <BrushTime />}
        </ChartSvg>
        <Tooltip type={fields.segment ? "multiple" : "single"} />
        <Ruler />
      </ChartContainer>
      {fields.segment && (
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="square"
            interactive={interactiveFiltersConfig?.legend.active}
          />
        </ChartControlsContainer>
      )}
    </AreaChart>
  );
});
