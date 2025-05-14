import { Box, SxProps, Theme } from "@mui/material";
import { useMemo } from "react";

import { DataTablePreview } from "@/browse/data-table-preview";
import { getSortedComponents } from "@/browse/utils";
import {
  extractChartConfigComponentIds,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { Loading } from "@/components/hint";
import {
  ChartConfig,
  DashboardFiltersConfig,
  DataSource,
  getConversionUnitsByComponentId,
} from "@/config-types";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartDataTablePreview = ({
  dataSource,
  chartConfig,
  dashboardFilters,
  sx,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  sx?: SxProps<Theme>;
}) => {
  const locale = useLocale();
  const componentIds = extractChartConfigComponentIds({ chartConfig });
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data: metadataData }] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const [{ data: componentsData, fetching: fetchingComponents }] =
    useDataCubesComponentsQuery({
      variables: {
        ...commonQueryVariables,
        cubeFilters: chartConfig.cubes.map((cube) => ({
          iri: cube.iri,
          componentIds,
          joinBy: cube.joinBy,
        })),
      },
    });
  const sortedComponents = useMemo(() => {
    const components = componentsData?.dataCubesComponents;

    if (!components) {
      return [];
    }

    return getSortedComponents([
      ...components.dimensions,
      ...components.measures,
    ]);
  }, [componentsData?.dataCubesComponents]);
  const queryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters,
    componentIds,
  });
  const [{ data: observationsData }] = useDataCubesObservationsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: queryFilters,
    },
    pause: fetchingComponents,
  });

  const conversionUnitsByComponentId = useMemo(() => {
    return getConversionUnitsByComponentId({
      fields: chartConfig.fields,
      components: sortedComponents,
    });
  }, [chartConfig.fields, sortedComponents]);

  return metadataData?.dataCubesMetadata &&
    componentsData?.dataCubesComponents &&
    observationsData?.dataCubesObservations ? (
    <Box sx={{ maxHeight: 600, overflow: "auto", ...sx }}>
      <DataTablePreview
        title={metadataData.dataCubesMetadata.map((d) => d.title).join(", ")}
        sortedComponents={sortedComponents}
        observations={observationsData.dataCubesObservations.data}
        linkToMetadataPanel
        conversionUnitsByComponentId={conversionUnitsByComponentId}
      />
    </Box>
  ) : (
    <Loading />
  );
};
