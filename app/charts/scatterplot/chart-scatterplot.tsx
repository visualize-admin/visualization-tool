import { memo } from "react";

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
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionVoronoi } from "@/charts/shared/overlay-voronoi";
import {
  DataSource,
  InteractiveFiltersConfig,
  QueryFilters,
  ScatterPlotConfig,
  ScatterPlotFields,
} from "@/configurator/config-types";
import { TimeSlider } from "@/configurator/interactive-filters/time-slider";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartLoadingWrapper } from "../chart-loading-wrapper";

export const ChartScatterplotVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ScatterPlotConfig;
  queryFilters: QueryFilters;
}) => {
  const locale = useLocale();
  const [queryResp] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null, // FIXME: Other fields may also be measures
      filters: queryFilters,
    },
  });

  return (
    <ChartLoadingWrapper
      query={queryResp}
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
    fields,
    interactiveFiltersConfig,
  }: {
    observations: Observation[];
    dimensions: DimensionMetadataFragment[];
    measures: DimensionMetadataFragment[];
    fields: ScatterPlotFields;
    interactiveFiltersConfig: InteractiveFiltersConfig;
  }) => {
    return (
      <ScatterplotChart
        data={observations}
        fields={fields}
        dimensions={dimensions}
        measures={measures}
        interactiveFiltersConfig={interactiveFiltersConfig}
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

        {fields.animation && (
          <TimeSlider
            componentIri={fields.animation.componentIri}
            dimensions={dimensions}
          />
        )}
      </ScatterplotChart>
    );
  }
);
