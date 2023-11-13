import { markdown, ReactSpecimen } from "catalog";
import keyBy from "lodash/keyBy";

import { ChartContainer } from "@/charts/shared/containers";
import { Table } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import {
  tableConfig,
  tableDimensions,
  tableMeasures,
  tableObservations,
} from "@/docs/fixtures";
import { DataCubeDimension, DataCubeMeasure } from "@/domain/data";
import { InteractiveFiltersProvider } from "@/stores/interactive-filters";

export const Docs = () => markdown`

## Data Table

${(
  <ReactSpecimen span={6}>
    <InteractiveFiltersProvider>
      <TableChart
        observations={tableObservations}
        dimensions={tableDimensions as DataCubeDimension[]}
        dimensionsByIri={keyBy(
          tableDimensions as DataCubeDimension[],
          (d) => d.iri
        )}
        measures={tableMeasures as DataCubeMeasure[]}
        measuresByIri={keyBy(tableMeasures as DataCubeMeasure[], (d) => d.iri)}
        chartConfig={tableConfig}
      >
        <ChartContainer>
          <Table />
        </ChartContainer>
      </TableChart>
    </InteractiveFiltersProvider>
  </ReactSpecimen>
)}
`;
export default Docs;
