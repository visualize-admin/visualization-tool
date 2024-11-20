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
import {
  InteractiveFiltersChartProvider,
  InteractiveFiltersProvider,
} from "@/stores/interactive-filters";

const meta: Meta = {
  title: "Charts / Charts / Data Table",
};
export default meta;

const DataTableStory: StoryObj = {
  render: () => {
    return (
      <InteractiveFiltersProvider chartConfigs={[tableConfig]}>
        <InteractiveFiltersChartProvider chartConfigKey={tableConfig.key}>
          <TableChart
            observations={tableObservations}
            dimensions={tableDimensions}
            dimensionsById={keyBy(tableDimensions, (d) => d.id)}
            measures={tableMeasures}
            measuresById={keyBy(tableMeasures, (d) => d.id)}
            chartConfig={tableConfig}
          >
            <ChartContainer>
              <Table />
            </ChartContainer>
          </TableChart>
        </InteractiveFiltersChartProvider>
      </InteractiveFiltersProvider>
    );
  },
};

export { DataTableStory as DataTable };
