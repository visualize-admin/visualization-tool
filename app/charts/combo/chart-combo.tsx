import { Box } from "@mui/material";
import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { ComboLineColumnChart } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualChart } from "@/charts/combo/combo-line-dual-state";
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
import { ComboConfig, DataSource, QueryFilters } from "@/config-types";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

type ChartComboVisualizationProps = {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ComboConfig;
  queryFilters: QueryFilters;
  published: boolean;
};

export const ChartComboVisualization = (
  props: ChartComboVisualizationProps
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
      Component={ChartCombo}
    />
  );
};

export const ChartCombo = memo((props: ChartProps<ComboConfig>) => {
  const { chartConfig } = props;
  const { interactiveFiltersConfig } = chartConfig;

  return chartConfig.chartSubtype === "line" ? (
    chartConfig.fields.y.axisMode === "single" ? (
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
    ) : (
      <ComboLineDualChart aspectRatio={0.4} {...props}>
        <Box>ComboLineDualChart</Box>
      </ComboLineDualChart>
    )
  ) : (
    <ComboLineColumnChart aspectRatio={0.4} {...props}>
      <Box>ComboLineColumnChart</Box>
    </ComboLineColumnChart>
  );
});
