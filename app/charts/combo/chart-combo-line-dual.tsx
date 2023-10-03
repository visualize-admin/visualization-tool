import React from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { ComboLineDual } from "@/charts/combo/combo-line-dual";
import { ComboLineDualChart } from "@/charts/combo/combo-line-dual-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { AxisTime, AxisTimeDomain } from "@/charts/shared/axis-width-time";
import { BrushTime } from "@/charts/shared/brush";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import {
  ChartContainer,
  ChartControlsContainer,
  ChartSvg,
} from "@/charts/shared/containers";
import { HoverDotMultiple } from "@/charts/shared/interaction/hover-dots-multiple";
import { Ruler } from "@/charts/shared/interaction/ruler";
import { Tooltip } from "@/charts/shared/interaction/tooltip";
import { LegendColor } from "@/charts/shared/legend-color";
import { InteractionHorizontal } from "@/charts/shared/overlay-horizontal";
import { ComboLineDualConfig, DataSource, QueryFilters } from "@/config-types";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

type ChartComboLineDualVisualizationProps = {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ComboLineDualConfig;
  queryFilters: QueryFilters;
  published: boolean;
};

export const ChartComboLineDualVisualization = (
  props: ChartComboLineDualVisualizationProps
) => {
  const { dataSetIri, dataSource, chartConfig, queryFilters, published } =
    props;
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
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <ComboLineDual />
            <InteractionHorizontal />
            {interactiveFiltersConfig?.timeRange.active && <BrushTime />}
          </ChartSvg>
          <HoverDotMultiple />
          <Ruler />
          <Tooltip type="multiple" />
        </ChartContainer>
        <ChartControlsContainer>
          <LegendColor chartConfig={chartConfig} symbol="line" />
        </ChartControlsContainer>
      </ComboLineDualChart>
    );
  }
);
