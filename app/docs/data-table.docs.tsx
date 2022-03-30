import { markdown, ReactSpecimen } from "catalog";
import * as React from "react";
import { ChartContainer } from "@/charts/shared/containers";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { DimensionMetaDataFragment } from "@/graphql/query-hooks";
import {
  tableConfig,
  tableDimensions,
  tableMeasures,
  tableObservations,
} from "@/docs/fixtures";

export const Docs = () => markdown`

## Data Table

${(
  <ReactSpecimen span={6}>
    <TableChart
      data={tableObservations}
      dimensions={tableDimensions as DimensionMetaDataFragment[]}
      measures={tableMeasures as DimensionMetaDataFragment[]}
      chartConfig={tableConfig}
    >
      <ChartContainer>
        <Table></Table>
      </ChartContainer>
    </TableChart>
  </ReactSpecimen>
)}
`;
export default Docs;
