import { Box } from "@mui/material";
import { ComponentProps } from "react";

import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { MetadataPanel } from "@/components/metadata-panel";
import { ChartConfig, DataSource } from "@/configurator";

export const ChartControls = ({
  dataSource,
  chartConfig,
  metadataPanelProps,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  metadataPanelProps: Omit<
    ComponentProps<typeof MetadataPanel>,
    "dataSource" | "chartConfigs"
  >;
}) => {
  const disableFilters =
    !chartConfig.interactiveFiltersConfig?.dataFilters.active;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateAreas: `
    "filtersToggle metadataToggle"
    "filtersList filtersList"`,
      }}
    >
      <Box sx={{ gridArea: "filtersToggle" }}>
        {!disableFilters && (
          <ChartDataFilters dataSource={dataSource} chartConfig={chartConfig} />
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gridArea: "metadataToggle",
        }}
      >
        <MetadataPanel
          dataSource={dataSource}
          chartConfigs={[chartConfig]}
          {...metadataPanelProps}
        />
      </Box>
      <Box sx={{ gridArea: "filtersList" }}>
        <Box></Box>
      </Box>
    </Box>
  );
};
