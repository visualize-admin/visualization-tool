import { memo } from "react";

import { ChartDataWrapper } from "@/charts/chart-data-wrapper";
import { BrushTime, shouldShowBrush } from "@/charts/shared/brush";
import { ChartContainer } from "@/charts/shared/containers";
import { Table, TABLE_TIME_RANGE_HEIGHT } from "@/charts/table/table";
import { TableChart } from "@/charts/table/table-state";
import { TableConfig } from "@/configurator";
import { hasChartConfigs, useConfiguratorState } from "@/configurator";

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
  const { chartConfig } = props;
  const { interactiveFiltersConfig } = chartConfig;
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  const showTimeBrush = shouldShowBrush(
    interactiveFiltersConfig,
    dashboardFilters?.timeRange
  );

  return (
    <TableChart {...props}>
      <ChartContainer>
        {showTimeBrush && (
          <svg
            style={{
              width: "100%",
              height: TABLE_TIME_RANGE_HEIGHT,
              minHeight: TABLE_TIME_RANGE_HEIGHT,
            }}
          >
            <BrushTime yOffset={10} />
          </svg>
        )}
        <Table />
      </ChartContainer>
    </TableChart>
  );
});
