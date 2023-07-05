import { markdown, ReactSpecimen } from "catalog";

import { ChartContainer } from "@/charts/shared/containers";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import {
  tableConfig,
  tableDimensions,
  tableMeasures,
  tableObservations,
} from "@/docs/fixtures";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export const Docs = () => markdown`

## Data Table

${(
  <ReactSpecimen span={6}>
    <TableChart
      chartData={tableObservations}
      scalesData={tableObservations}
      segmentData={tableObservations}
      allData={tableObservations}
      dimensions={tableDimensions as DimensionMetadataFragment[]}
      measures={tableMeasures as DimensionMetadataFragment[]}
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
