import { Box, SxProps, Theme } from "@mui/material";

import { DataTablePreview } from "@/browse/ui/data-table-preview";
import {
  extractChartConfigComponentIds,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { Loading } from "@/components/hint";
import {
  ChartConfig,
  DashboardFiltersConfig,
  DataSource,
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
      chartConfig,
      variables: {
        ...commonQueryVariables,
        cubeFilters: chartConfig.cubes.map((cube) => ({
          iri: cube.iri,
          componentIds,
          joinBy: cube.joinBy,
        })),
      },
    });
  const queryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters,
    componentIds,
  });
  const [{ data: observationsData }] = useDataCubesObservationsQuery({
    chartConfig,
    variables: {
      ...commonQueryVariables,
      cubeFilters: queryFilters,
    },
    pause: fetchingComponents,
  });

  return metadataData?.dataCubesMetadata &&
    componentsData?.dataCubesComponents &&
    observationsData?.dataCubesObservations ? (
    <Box sx={{ maxHeight: 600, overflow: "auto", ...sx }}>
      <DataTablePreview
        title={metadataData.dataCubesMetadata.map((d) => d.title).join(", ")}
        dimensions={componentsData.dataCubesComponents.dimensions}
        measures={componentsData.dataCubesComponents.measures}
        observations={observationsData.dataCubesObservations.data}
        linkToMetadataPanel
      />
    </Box>
  ) : (
    <Loading />
  );
};
