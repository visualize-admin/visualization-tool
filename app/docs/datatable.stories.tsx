import { Meta, StoryObj } from "@storybook/react";
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
import { InteractiveFiltersProvider } from "@/stores/interactive-filters";

const meta: Meta = {
  title: "Charts / Charts / Data Table",
};
export default meta;

const DataTableStory: StoryObj = {
  render: () => {
    return (
      <InteractiveFiltersProvider>
        <TableChart
          observations={tableObservations}
          dimensions={tableDimensions}
          dimensionsByIri={keyBy(tableDimensions, (d) => d.iri)}
          measures={tableMeasures}
          measuresByIri={keyBy(tableMeasures, (d) => d.iri)}
          chartConfig={tableConfig}
        >
          <ChartContainer>
            <Table />
          </ChartContainer>
        </TableChart>
      </InteractiveFiltersProvider>
    );
  },
};

export { DataTableStory as DataTable };
