import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
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
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: TableConfig;
}) => {
  const locale = useLocale();
  const [metadataQuery] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [componentsQuery] = useComponentsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [observationsQuery] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null,
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
