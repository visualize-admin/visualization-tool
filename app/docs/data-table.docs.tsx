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
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { InteractiveFiltersProvider } from "@/stores/interactive-filters";

export const Docs = () => markdown`

## Data Table

${(
  <ReactSpecimen span={6}>
    <InteractiveFiltersProvider>
      <TableChart
        observations={tableObservations}
        dimensions={tableDimensions as DimensionMetadataFragment[]}
        dimensionsByIri={keyBy(
          tableDimensions as DimensionMetadataFragment[],
          (d) => d.iri
        )}
        measures={tableMeasures as DimensionMetadataFragment[]}
        measuresByIri={keyBy(
          tableMeasures as DimensionMetadataFragment[],
          (d) => d.iri
        )}
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
