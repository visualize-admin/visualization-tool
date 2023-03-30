import React, { memo } from "react";

import { Lines } from "@/charts/line/lines";
import { LineChart } from "@/charts/line/lines-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import {
  DataSource,
  LineConfig,
  LineFields,
  QueryFilters,
} from "@/configurator/config-types";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartLoadingWrapper } from "../chart-loading-wrapper";

export const ChartLinesVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: LineConfig;
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
      Component={ChartLines}
    />
  );
};

export const ChartLines = memo(function ChartLines({
  observations,
  dimensions,
  measures,
  fields,
  chartConfig,
}: {
  observations: Observation[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  fields: LineFields;
  chartConfig: LineConfig;
}) {
  const { interactiveFiltersConfig } = chartConfig;
  return (
    <LineChart
      data={observations}
      dimensions={dimensions}
      measures={measures}
      chartConfig={chartConfig}
      aspectRatio={0.4}
    >
      <ChartContainer>
        <ChartSvg>
          <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
          <Lines />
          <InteractionHorizontal />
          {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
        </ChartSvg>

        <Ruler />

        <HoverDotMultiple />

        <Tooltip type={fields.segment ? "multiple" : "single"} />
      </ChartContainer>

      <LegendColor
        symbol="line"
        interactive={fields.segment && interactiveFiltersConfig?.legend.active}
      />
    </LineChart>
  );
});
