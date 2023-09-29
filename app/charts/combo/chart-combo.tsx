import { Box } from "@mui/material";
import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { ComboLineColumnChart } from "@/charts/combo/combo-line-column-state";
import { ComboLineDualChart } from "@/charts/combo/combo-line-dual-state";
import { ComboLineSingle } from "@/charts/combo/combo-line-single";
import { ComboLineSingleChart } from "@/charts/combo/combo-line-single-state";
import { AxisHeightLinear } from "@/charts/shared/axis-height-linear";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import { ChartContainer, ChartSvg } from "@/charts/shared/containers";
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

  return chartConfig.chartSubtype === "line" ? (
    chartConfig.fields.y.axisMode === "single" ? (
      <ComboLineSingleChart aspectRatio={0.4} {...props}>
        <ChartContainer>
          <ChartSvg>
            <AxisHeightLinear />
            <ComboLineSingle />
          </ChartSvg>
        </ChartContainer>
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
