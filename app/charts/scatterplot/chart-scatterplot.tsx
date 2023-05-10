import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { Scatterplot } from "@/charts/scatterplot/scatterplot-simple";
import { ScatterplotChart } from "@/charts/scatterplot/scatterplot-state";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "@/charts/shared/axis-height-linear";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "@/charts/shared/axis-width-linear";
import { getChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import {
  DataSource,
  QueryFilters,
  ScatterPlotConfig,
} from "@/configurator/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartScatterplotVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
  published,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ScatterPlotConfig;
  queryFilters: QueryFilters;
  published: boolean;
}) => {
  const locale = useLocale();
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [componentsQuery] = useComponentsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      componentIris: published
        ? getChartConfigComponentIris(chartConfig)
        : undefined,
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
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
      metadataQuery={metadataQuery}
      componentsQuery={componentsQuery}
      observationsQuery={observationsQuery}
      Component={ChartScatterplot}
      chartConfig={chartConfig}
    />
  );
};

export const ChartScatterplot = memo(
  ({
    observations,
    dimensions,
    measures,
    chartConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    chartConfig: ScatterPlotConfig;
  }) => {
    const { interactiveFiltersConfig, fields } = chartConfig;
    return (
      <ScatterplotChart
        data={observations}
        dimensions={dimensions}
        measures={measures}
        chartConfig={chartConfig}
        aspectRatio={1}
      >
        <ChartContainer>
          <ChartSvg>
            <AxisWidthLinear />
            <AxisHeightLinear />
            <AxisWidthLinearDomain />
            <AxisHeightLinearDomain />
            <Scatterplot />
            <InteractionVoronoi />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>

        <LegendColor
          symbol="circle"
          interactive={
            fields.segment && interactiveFiltersConfig?.legend.active === true
          }
        />

        {interactiveFiltersConfig?.timeSlider.componentIri && (
          <TimeSlider
            componentIri={interactiveFiltersConfig.timeSlider.componentIri}
            dimensions={dimensions}
          />
        )}
      </ScatterplotChart>
    );
  }
);
