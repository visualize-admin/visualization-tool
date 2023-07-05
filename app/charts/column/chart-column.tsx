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
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { ColumnConfig, DataSource, QueryFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import {
  useComponentsWithHierarchiesQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

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
  const componentIris = published
    ? extractComponentIris(chartConfig)
    : undefined;
  const commonQueryVariables = {
    iri: dataSetIri,
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: commonQueryVariables,
  });
  const [componentsWithHierarchiesQuery] = useComponentsWithHierarchiesQuery({
    variables: {
      ...commonQueryVariables,
      componentIris,
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      ...commonQueryVariables,
      componentIris,
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

export const ChartColumns = memo((props: ChartProps<ColumnConfig>) => {
  const { chartConfig, chartData, scalesData, dimensions, measures } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;

  return (
    <>
      {fields.segment?.componentIri && fields.segment.type === "stacked" ? (
        <StackedColumnsChart
          chartConfig={chartConfig}
          chartData={chartData}
          scalesData={scalesData}
          dimensions={dimensions}
          measures={measures}
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
      ) : fields.segment?.componentIri && fields.segment.type === "grouped" ? (
        <GroupedColumnChart
          chartConfig={chartConfig}
          chartData={chartData}
          scalesData={scalesData}
          dimensions={dimensions}
          measures={measures}
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
          chartConfig={chartConfig}
          chartData={chartData}
          scalesData={scalesData}
          measures={measures}
          dimensions={dimensions}
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
});
