import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { DataSource, TableConfig } from "@/configurator";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import {
  useDataCubesComponentsQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

export const ChartTableVisualization = ({
  dataSource,
  componentIris,
  chartConfig,
}: {
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: TableConfig;
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
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const [componentsQuery] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      filters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
      })),
    },
  });
  const [observationsQuery] = useDataCubesObservationsQuery({
    variables: {
      ...commonQueryVariables,
      filters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
      })),
    },
  });

  return (
    <ChartLoadingWrapper
      metadataQuery={metadataQuery}
      componentsQuery={componentsQuery}
      observationsQuery={observationsQuery}
      Component={ChartTable}
      chartConfig={chartConfig}
    />
  );
};

const ChartTable = memo(function ChartTable(props: ChartProps<TableConfig>) {
  return (
    <TableChart {...props}>
      <Table />
    </TableChart>
  );
});
