import { memo } from "react";

import {
  ColumnsGrouped,
  ErrorWhiskers as ErrorWhiskersGrouped,
} from "@/charts/column/columns-grouped";
import { GroupedColumnChart } from "@/charts/column/columns-grouped-state";
import { Columns, ErrorWhiskers } from "@/charts/column/columns-simple";
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
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import {
  ColumnConfig,
  ColumnFields,
  DataSource,
  InteractiveFiltersConfig,
  QueryFilters,
} from "@/configurator/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartLoadingWrapper } from "../chart-loading-wrapper";

export const ChartColumnsVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ColumnConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const [queryResp] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null,
      filters: queryFilters,
    },
  });

  return (
    <ChartLoadingWrapper
      query={queryResp}
      chartConfig={chartConfig}
      Component={ChartColumns}
    />
  );
};

export const ChartColumns = memo(
  ({
    observations,
    dimensions,
    measures,
    fields,
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    interactiveFiltersConfig: InteractiveFiltersConfig;
    fields: ColumnFields;
  }) => {
    return (
      <>
        {/* FIXME: These checks should probably be handled somewhere else */}
        {fields.segment?.componentIri && fields.segment.type === "stacked" ? (
          <StackedColumnsChart
            data={observations}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={0.4}
          >
            <ChartContainer>
              <ChartSvg>
                <AxisHeightLinear /> <AxisWidthBand />
                <ColumnsStacked /> <AxisWidthBandDomain />
                <InteractionColumns />
                {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
              </ChartSvg>
              <Tooltip type="multiple" />
            </ChartContainer>
            <LegendColor
              symbol="square"
              interactive={
                fields.segment && interactiveFiltersConfig?.legend.active
              }
            />
            {interactiveFiltersConfig?.timeSlider.componentIri && (
              <TimeSlider
                componentIri={interactiveFiltersConfig.timeSlider.componentIri}
                dimensions={dimensions}
              />
            )}
          </StackedColumnsChart>
        ) : fields.segment?.componentIri &&
          fields.segment.type === "grouped" ? (
          <GroupedColumnChart
            data={observations}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={0.4}
          >
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
            <LegendColor
              symbol="square"
              interactive={
                fields.segment && interactiveFiltersConfig?.legend.active
              }
            />
            {interactiveFiltersConfig?.timeSlider.componentIri && (
              <TimeSlider
                componentIri={interactiveFiltersConfig.timeSlider.componentIri}
                dimensions={dimensions}
              />
            )}
          </GroupedColumnChart>
        ) : (
          <ColumnChart
            data={observations}
            fields={fields}
            measures={measures}
            dimensions={dimensions}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={0.4}
          >
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
            {interactiveFiltersConfig?.timeSlider.componentIri && (
              <TimeSlider
                componentIri={interactiveFiltersConfig.timeSlider.componentIri}
                dimensions={dimensions}
              />
            )}
          </ColumnChart>
        )}
      </>
    );
  }
);
