import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
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
import { getChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { ColumnConfig, DataSource, QueryFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useComponentsWithHierarchiesQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartColumnsVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
  published,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ColumnConfig;
  queryFilters: QueryFilters;
  published: boolean;
}) => {
  const locale = useLocale();
  const componentIrisToFilterBy = published
    ? getChartConfigComponentIris(chartConfig)
    : undefined;
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [componentsWithHierarchiesQuery] = useComponentsWithHierarchiesQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      componentIris: componentIrisToFilterBy,
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      componentIris: componentIrisToFilterBy,
      filters: queryFilters,
    },
  });

  return (
    <ChartLoadingWrapper
      metadataQuery={metadataQuery}
      componentsQuery={componentsWithHierarchiesQuery}
      observationsQuery={observationsQuery}
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
    chartConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    chartConfig: ColumnConfig;
  }) => {
    const { fields, interactiveFiltersConfig } = chartConfig;
    return (
      <>
        {/* FIXME: These checks should probably be handled somewhere else */}
        {fields.segment?.componentIri && fields.segment.type === "stacked" ? (
          <StackedColumnsChart
            data={observations}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            aspectRatio={0.4}
            chartConfig={chartConfig}
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
            {fields.animation && (
              <TimeSlider
                componentIri={fields.animation.componentIri}
                dimensions={dimensions}
                showPlayButton={fields.animation.showPlayButton}
                animationDuration={fields.animation.duration}
                animationType={fields.animation.type}
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
            aspectRatio={0.4}
            chartConfig={chartConfig}
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
            {fields.animation && (
              <TimeSlider
                componentIri={fields.animation.componentIri}
                dimensions={dimensions}
                showPlayButton={fields.animation.showPlayButton}
                animationDuration={fields.animation.duration}
                animationType={fields.animation.type}
              />
            )}
          </GroupedColumnChart>
        ) : (
          <ColumnChart
            data={observations}
            measures={measures}
            dimensions={dimensions}
            aspectRatio={0.4}
            chartConfig={chartConfig}
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
            {fields.animation && (
              <TimeSlider
                componentIri={fields.animation.componentIri}
                dimensions={dimensions}
                showPlayButton={fields.animation.showPlayButton}
                animationDuration={fields.animation.duration}
                animationType={fields.animation.type}
              />
            )}
          </ColumnChart>
        )}
      </>
    );
  }
);
