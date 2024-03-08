import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { DataSource, TableConfig } from "@/configurator";

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
  return (
    <ChartDataWrapper
      dataSource={dataSource}
      componentIris={componentIris}
      Component={ChartTable}
      chartConfig={chartConfig}
      observationQueryFilters={chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        filters: cube.filters,
      }))}
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
