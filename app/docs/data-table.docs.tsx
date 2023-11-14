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
import { Dimension, Measure } from "@/domain/data";
import { InteractiveFiltersProvider } from "@/stores/interactive-filters";

export const Docs = () => markdown`

## Data Table

${(
  <ReactSpecimen span={6}>
    <InteractiveFiltersProvider>
      <TableChart
        observations={tableObservations}
        dimensions={tableDimensions as Dimension[]}
        dimensionsByIri={keyBy(tableDimensions as Dimension[], (d) => d.iri)}
        measures={tableMeasures as Measure[]}
        measuresByIri={keyBy(tableMeasures as Measure[], (d) => d.iri)}
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
