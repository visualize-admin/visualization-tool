import React from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { ComboLineSingle } from "@/charts/combo/combo-line-single";
import { ComboLineSingleChart } from "@/charts/combo/combo-line-single-state";
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
import {
  ComboLineSingleConfig,
  DataSource,
  QueryFilters,
} from "@/config-types";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

type ChartComboLineSingleVisualizationProps = {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ComboLineSingleConfig;
  queryFilters: QueryFilters;
  published: boolean;
};

export const ChartComboLineSingleVisualization = (
  props: ChartComboLineSingleVisualizationProps
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
      Component={ChartComboLineSingle}
    />
  );
};

export const ChartComboLineSingle = React.memo(
  (props: ChartProps<ComboLineSingleConfig>) => {
    const { chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;

    return (
      <ComboLineSingleChart aspectRatio={0.4} {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear /> <AxisTime /> <AxisTimeDomain />
            <ComboLineSingle />
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
      </ComboLineSingleChart>
    );
  }
);
