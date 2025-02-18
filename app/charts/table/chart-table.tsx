import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { ChartContainer } from "@/charts/shared/containers";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { TableConfig } from "@/configurator";

import { ChartProps, VisualizationProps } from "../shared/ChartProps";

export const ChartTableVisualization = (
  props: Omit<VisualizationProps<TableConfig>, "observationQueryFilters">
) => {
  const { chartConfig, componentIds } = props;

  return (
    <ChartDataWrapper
      {...props}
      observationQueryFilters={chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIds,
        filters: cube.filters,
        joinBy: cube.joinBy,
      }))}
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
