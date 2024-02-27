import { memo } from "react";

import { ChartLoadingWrapper } from "@/charts/chart-loading-wrapper";
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
    <ChartLoadingWrapper
      dataSource={dataSource}
      componentIris={componentIris}
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
