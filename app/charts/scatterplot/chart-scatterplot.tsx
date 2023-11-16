import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { Scatterplot } from "@/charts/scatterplot/scatterplot";
import { ScatterplotChart } from "@/charts/scatterplot/scatterplot-state";
import {
  AxisHeightLinear,
  AxisHeightLinearDomain,
} from "@/charts/shared/axis-height-linear";
import {
  AxisWidthLinear,
  AxisWidthLinearDomain,
} from "@/charts/shared/axis-width-linear";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import { DataSource, QueryFilters, ScatterPlotConfig } from "@/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

export const ChartScatterplotVisualization = ({
  dataSetIri,
  dataSource,
  componentIris,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: ScatterPlotConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
    filters: [{ iri: dataSetIri, componentIris, filters: queryFilters }],
  };
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: commonQueryVariables,
  });
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: commonQueryVariables,
  });
  const [observationsQuery] = useDataCubesObservationsQuery({
    variables: commonQueryVariables,
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
  (props: ChartProps<ScatterPlotConfig> & { published: boolean }) => {
    const { chartConfig, dimensions, published } = props;
    const { fields, filters, interactiveFiltersConfig } = chartConfig;

    return (
      <ScatterplotChart aspectRatio={published ? 1 : 0.4} {...props}>
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
        {(fields.animation || fields.segment) && (
          <ChartControlsContainer>
            {fields.animation && (
              <TimeSlider
                filters={filters}
                dimensions={dimensions}
                {...fields.animation}
              />
            )}
            {fields.segment && (
              <LegendColor
                chartConfig={chartConfig}
                symbol="circle"
                interactive={interactiveFiltersConfig?.legend.active}
              />
            )}
          </ChartControlsContainer>
        )}
      </ScatterplotChart>
    );
  }
);
