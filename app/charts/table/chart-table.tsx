import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { DataSource, TableConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import {
  DimensionMetadataFragment,
  useComponentsQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const ChartTableVisualization = ({
  dataSetIri,
  dataSource,
  chartConfig,
  published,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: TableConfig;
  published: boolean;
}) => {
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

const ChartTable = memo(function ChartTable({
  observations,
  dimensions,
  measures,
  chartConfig,
}: {
  observations: Observation[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  chartConfig: TableConfig;
}) {
  return (
    <TableChart
      data={observations}
      dimensions={dimensions}
      measures={measures}
      chartConfig={chartConfig}
    >
      <Table />
    </TableChart>
  );
});
