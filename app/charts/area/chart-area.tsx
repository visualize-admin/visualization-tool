import React, { memo } from "react";

import { Areas } from "@/charts/area/areas";
import { AreaChart } from "@/charts/area/areas-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import {
  AreaConfig,
  DataSource,
  QueryFilters,
} from "@/configurator/config-types";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartLoadingWrapper } from "../chart-loading-wrapper";

export const ChartAreasVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: AreaConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const [queryResp] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null, // FIXME: Try to load less dimensions
      filters: queryFilters,
    },
  });
  return (
    <ChartLoadingWrapper
      query={queryResp}
      chartConfig={chartConfig}
      Component={ChartAreas}
    />
  );
};

export const ChartAreas = memo(
  ({
    observations,
    dimensions,
    measures,
    chartConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    chartConfig: AreaConfig;
  }) => {
    const { fields, interactiveFiltersConfig } = chartConfig;
    return (
      <AreaChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        chartConfig={chartConfig}
        aspectRatio={0.4}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisTime /> <AxisHeightLinear />
            <Areas /> <AxisTimeDomain />
            <InteractionHorizontal />
            {interactiveFiltersConfig?.timeRange.active === true && (
              <BrushTime />
            )}
          </ChartSvg>
          <Tooltip type={fields.segment ? "multiple" : "single"} />
          <Ruler />
        </ChartContainer>

        <LegendColor
          symbol="square"
          interactive={
            fields.segment && interactiveFiltersConfig?.legend.active === true
          }
        />
      </AreaChart>
    );
  }
);
