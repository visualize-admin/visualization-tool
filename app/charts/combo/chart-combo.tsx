import { Box } from "@mui/material";
import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { ComboLineColumnChart } from "@/charts/combo/combo-line-column-state";
import { ComboLineChart } from "@/charts/combo/combo-line-state";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
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
    <ComboLineChart aspectRatio={0.4} {...props}>
      <Box>ComboLineChart</Box>
    </ComboLineChart>
  ) : (
    <ComboLineColumnChart aspectRatio={0.4} {...props}>
      <Box>ComboLineColumnChart</Box>
    </ComboLineColumnChart>
  );
});
