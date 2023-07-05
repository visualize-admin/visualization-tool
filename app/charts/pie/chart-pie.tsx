import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { Pie } from "@/charts/pie/pie";
import { PieChart } from "@/charts/pie/pie-state";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { OnlyNegativeDataHint } from "@/components/hint";
import { DataSource, PieConfig, QueryFilters } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

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
  const [componentsQuery] = useComponentsQuery({
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
      componentsQuery={componentsQuery}
      observationsQuery={observationsQuery}
      chartConfig={chartConfig}
      Component={ChartPie}
    />
  );
};

export const ChartPie = memo((props: ChartProps<PieConfig>) => {
  const { chartConfig, chartData, dimensions } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  // Allow displaying empty chart, which might be the case when animating
  // by time and there is no data for a given step.
  const somePositive =
    chartData.length > 0
      ? chartData.some((d) => (d[fields?.y?.componentIri] as number) > 0)
      : true;

  if (!somePositive) {
    return <OnlyNegativeDataHint />;
  }

  return (
    <PieChart aspectRatio={0.5} {...props}>
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

      {fields.animation && (
        <TimeSlider
          componentIri={fields.animation.componentIri}
          dimensions={dimensions}
          showPlayButton={fields.animation.showPlayButton}
          animationDuration={fields.animation.duration}
          animationType={fields.animation.type}
        />
      )}
    </PieChart>
  );
});
