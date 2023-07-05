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
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import { DataSource, QueryFilters, ScatterPlotConfig } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

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
      Component={ChartScatterplot}
      chartConfig={chartConfig}
    />
  );
};

export const ChartScatterplot = memo((props: ChartProps<ScatterPlotConfig>) => {
  const { chartConfig, dimensions } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;

  return (
    <ScatterplotChart aspectRatio={1} {...props}>
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

      {fields.animation && (
        <TimeSlider
          componentIri={fields.animation.componentIri}
          dimensions={dimensions}
          showPlayButton={fields.animation.showPlayButton}
          animationDuration={fields.animation.duration}
          animationType={fields.animation.type}
        />
      )}
    </ScatterplotChart>
  );
});
