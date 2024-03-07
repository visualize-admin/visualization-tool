import React from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { InteractionColumns } from "@/charts/column/overlay-columns";
import { AxisHeightLinearDual } from "@/charts/combo/axis-height-linear-dual";
import { ComboLineColumn } from "@/charts/combo/combo-line-column";
import { ComboLineColumnChart } from "@/charts/combo/combo-line-column-state";
import { AxisWidthBand } from "@/charts/shared/axis-width-band";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { ComboLineColumnConfig, DataSource } from "@/config-types";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

import { ChartProps } from "../shared/ChartProps";

type ChartComboLineColumnVisualizationProps = {
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: ComboLineColumnConfig;
  queryFilters?: DataCubeObservationFilter[];
};

export const ChartComboLineColumnVisualization = (
  props: ChartComboLineColumnVisualizationProps
) => {
  const { dataSource, componentIris, chartConfig, queryFilters } = props;
  return (
    <ChartDataWrapper
      dataSource={dataSource}
      componentIris={componentIris}
      queryFilters={queryFilters}
      chartConfig={chartConfig}
      Component={ChartComboLineColumn}
    />
  );
};

export const ChartComboLineColumn = React.memo(
  (props: ChartProps<ComboLineColumnConfig>) => {
    const { chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;

    return (
      <ComboLineColumnChart aspectRatio={0.4} {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinearDual orientation="left" />
            <AxisHeightLinearDual orientation="right" />
            <AxisWidthBand />
            <ComboLineColumn />
            <InteractionColumns />
            {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler rotate />
          <Tooltip type="multiple" />
        </ChartContainer>
      </ComboLineColumnChart>
    );
  }
);
