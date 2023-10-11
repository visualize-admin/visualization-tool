import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { DataSource, TableConfig } from "@/configurator";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { ChartProps } from "../shared/ChartProps";

export const ChartTableVisualization = ({
  dataSetIri,
  dataSource,
  componentIris,
  chartConfig,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  componentIris: string[] | undefined;
  chartConfig: TableConfig;
}) => {
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
      filters: chartConfig.filters,
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
