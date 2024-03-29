import React from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { ComboLineSingle } from "@/charts/combo/combo-line-single";
import { ComboLineSingleChart } from "@/charts/combo/combo-line-single-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { ComboLineSingleConfig, DataSource } from "@/config-types";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";

import { ChartProps } from "../shared/ChartProps";

type ChartComboLineSingleVisualizationProps = {
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: ComboLineSingleConfig;
  queryFilters?: DataCubeObservationFilter[];
};

export const ChartComboLineSingleVisualization = (
  props: ChartComboLineSingleVisualizationProps
) => {
  const { dataSource, componentIris, chartConfig, queryFilters } = props;

  return (
    <ChartDataWrapper
      dataSource={dataSource}
      componentIris={componentIris}
      observationQueryFilters={queryFilters}
      chartConfig={chartConfig}
      Component={ChartComboLineSingle}
    />
  );
};

export const ChartComboLineSingle = React.memo(
  (props: ChartProps<ComboLineSingleConfig>) => {
    const { chartConfig, measures } = props;
    const { interactiveFiltersConfig } = chartConfig;

    const getLegendItemDimension = React.useCallback(
      (label) => {
        return measures.find((measure) => measure.label === label);
      },
      [measures]
    );

    return (
      <ComboLineSingleChart aspectRatio={0.4} {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <ComboLineSingle />
            <InteractionHorizontal />
            {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler />
          <Tooltip type="multiple" />
        </ChartContainer>
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="line"
            getLegendItemDimension={getLegendItemDimension}
          />
        </ChartControlsContainer>
      </ComboLineSingleChart>
    );
  }
);
