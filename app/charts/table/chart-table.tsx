import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { ChartContainer } from "@/charts/shared/containers";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { TableConfig } from "@/configurator";

import { ChartProps, VisualizationProps } from "../shared/chart-props";

export const ChartTableVisualization = (
  props: VisualizationProps<TableConfig>
) => {
  const { observationQueryFilters } = props;

  return (
    <ChartDataWrapper
      {...props}
      observationQueryFilters={observationQueryFilters}
      Component={ChartTable}
    />
  );
};

const ChartTable = memo(function ChartTable(props: ChartProps<TableConfig>) {
  return (
    <TableChart {...props}>
      <ChartContainer>
        <Table />
      </ChartContainer>
    </TableChart>
  );
});
