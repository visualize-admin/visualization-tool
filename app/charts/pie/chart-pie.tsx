import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { Pie } from "@/charts/pie/pie";
import { PieChart } from "@/charts/pie/pie-state";
import { getChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { OnlyNegativeDataHint } from "@/components/hint";
import {
  DataSource,
  PieConfig,
  QueryFilters,
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

export const ChartPieVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
  published,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: PieConfig;
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
  const [componentsQuery] = useComponentsQuery({
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
      componentsQuery={componentsQuery}
      observationsQuery={observationsQuery}
      chartConfig={chartConfig}
      Component={ChartPie}
    />
  );
};

export const ChartPie = memo(
  ({
    observations,
    dimensions,
    measures,
    chartConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    chartConfig: PieConfig;
  }) => {
    const { fields } = chartConfig;
    const somePositive = observations.some(
      (d) => (d[fields?.y?.componentIri] as number) > 0
    );

    if (!somePositive) {
      return <OnlyNegativeDataHint />;
    }

    const { interactiveFiltersConfig } = chartConfig;
    return (
      <PieChart
        data={observations}
        dimensions={dimensions}
        measures={measures}
        chartConfig={chartConfig}
        aspectRatio={0.5}
      >
        <ChartContainer>
          <ChartSvg>
            <Pie />
          </ChartSvg>
          <Tooltip type="single" />
        </ChartContainer>
        <LegendColor
          symbol="square"
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
      </PieChart>
    );
  }
);
