import React from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { AxisHeightLinearDual } from "@/charts/combo/axis-height-linear-dual";
import { ComboLineDual } from "@/charts/combo/combo-line-dual";
import { ComboLineDualChart } from "@/charts/combo/combo-line-dual-state";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { ComboLineDualConfig, DataSource } from "@/config-types";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

type ChartComboLineDualVisualizationProps = {
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: ComboLineDualConfig;
  queryFilters?: DataCubeObservationFilter[];
};

export const ChartComboLineDualVisualization = (
  props: ChartComboLineDualVisualizationProps
) => {
  const { dataSource, componentIris, chartConfig, queryFilters } = props;
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
  });
  const [observationsQuery] = useDataCubesObservationsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: queryFilters ?? [],
    },
    pause: !queryFilters,
  });

  return (
    <ChartLoadingWrapper
      metadataQuery={metadataQuery}
      componentsQuery={componentsQuery}
      observationsQuery={observationsQuery}
      chartConfig={chartConfig}
      Component={ChartComboLineDual}
    />
  );
};

export const ChartComboLineDual = React.memo(
  (props: ChartProps<ComboLineDualConfig>) => {
    const { chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;

    return (
      <ComboLineDualChart aspectRatio={0.4} {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinearDual orientation="left" />
            <AxisHeightLinearDual orientation="right" /> <AxisTime />
            <AxisTimeDomain />
            <ComboLineDual />
            <InteractionHorizontal />
            {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler />
          <Tooltip type="multiple" />
        </ChartContainer>
      </ComboLineDualChart>
    );
  }
);
