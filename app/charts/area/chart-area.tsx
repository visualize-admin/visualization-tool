import { memo } from "react";

import { Areas } from "@/charts/area/areas";
import { AreaChart } from "@/charts/area/areas-state";
import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { AreaConfig, DataSource, QueryFilters } from "@/config-types";
import {
  useDataCubeObservationsQuery,
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

export const ChartAreasVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  queryFilters,
  componentIris,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: AreaConfig;
  queryFilters: QueryFilters;
  componentIris: string[] | undefined;
}) => {
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      filters: [{ iri: dataSetIri }],
    },
  });
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      filters: [{ iri: dataSetIri, componentIris }],
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      ...commonQueryVariables,
      iri: dataSetIri,
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
      Component={ChartAreas}
    />
  );
};

export const ChartAreas = memo((props: ChartProps<AreaConfig>) => {
  const { chartConfig } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;

  return (
    <AreaChart aspectRatio={0.4} {...props}>
      <ChartContainer>
        <ChartSvg>
          <AxisTime /> <AxisHeightLinear />
          <Areas /> <AxisTimeDomain />
          <InteractionHorizontal />
          {interactiveFiltersConfig?.timeRange.active === true && <BrushTime />}
        </ChartSvg>
        <Tooltip type={fields.segment ? "multiple" : "single"} />
        <Ruler />
      </ChartContainer>
      {fields.segment && (
        <ChartControlsContainer>
          <LegendColor
            chartConfig={chartConfig}
            symbol="square"
            interactive={interactiveFiltersConfig?.legend.active}
          />
        </ChartControlsContainer>
      )}
    </AreaChart>
  );
});
