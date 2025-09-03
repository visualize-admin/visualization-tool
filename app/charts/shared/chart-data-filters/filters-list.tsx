import { Box } from "@mui/material";

import { useChartDataFiltersState } from "@/charts/shared/chart-data-filters";
import { ChartDataFilter } from "@/charts/shared/chart-data-filters/filter";
import { useChartInteractiveFilters } from "@/stores/interactive-filters";

export const ChartDataFiltersList = ({
  open,
  dataSource,
  chartConfig,
  loading,
  groupedPreparedFilters,
  componentIds,
}: ReturnType<typeof useChartDataFiltersState>) => {
  const dataFilters = useChartInteractiveFilters((d) => d.dataFilters);

  return componentIds && componentIds.length > 0 ? (
    <Box
      data-testid="published-chart-interactive-filters"
      sx={{
        display: open ? "grid" : "none",
        columnGap: 3,
        rowGap: 2,
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      }}
    >
      {groupedPreparedFilters.map(({ dimensionId, entries }) => (
        <ChartDataFilter
          key={dimensionId}
          filters={entries}
          dimensionId={dimensionId}
          dataSource={dataSource}
          chartConfig={chartConfig}
          dataFilters={dataFilters}
          disabled={loading}
        />
      ))}
    </Box>
  ) : null;
};
