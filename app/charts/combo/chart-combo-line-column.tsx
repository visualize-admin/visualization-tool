import React from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { InteractionColumns } from "@/charts/column/overlay-columns";
import { AxisHeightLinearDual } from "@/charts/combo/axis-height-linear-dual";
import { ComboLineColumn } from "@/charts/combo/combo-line-column";
import { ComboLineColumnChart } from "@/charts/combo/combo-line-column-state";
import { AxisWidthBand } from "@/charts/shared/axis-width-band";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import {
  ComboLineColumnConfig,
  DataSource,
  QueryFilters,
} from "@/config-types";
import {
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
  useDataCubesComponentsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

type ChartComboLineColumnVisualizationProps = {
  dataSetIri: string;
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: ComboLineColumnConfig;
  queryFilters: QueryFilters;
};

export const ChartComboLineColumnVisualization = (
  props: ChartComboLineColumnVisualizationProps
) => {
  const { dataSetIri, dataSource, componentIris, chartConfig, queryFilters } =
    props;
  const locale = useLocale();
  const commonQueryVariables = {
    iri: dataSetIri,
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: commonQueryVariables,
  });
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      filters: [{ iri: dataSetIri, componentIris }],
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
      Component={ChartComboLineColumn}
    />
  );
};

export const ChartComboLineColumn = React.memo(
  (props: ChartProps<ComboLineColumnConfig>) => {
    const { chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;

    return (
      <ComboLineColumnChart aspectRatio={0.4} {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinearDual orientation="left" />
            <AxisHeightLinearDual orientation="right" />
            <AxisWidthBand />
            <ComboLineColumn />
            <InteractionColumns />
            {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler rotate />
          <Tooltip type="multiple" />
        </ChartContainer>
      </ComboLineColumnChart>
    );
  }
);
