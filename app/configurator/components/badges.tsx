import { Badge, BadgeProps } from "@mui/material";

import { getChartConfig, useChartConfigFilters } from "@/config-utils";
import { useControlSectionContext } from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";

export const FiltersBadge = ({ sx }: { sx?: BadgeProps["sx"] }) => {
  const ctx = useControlSectionContext();
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const filters = useChartConfigFilters(chartConfig);

  return (
    <Badge
      invisible={ctx.isOpen}
      badgeContent={
        Object.values(filters).filter((d) => d.type === "single").length
      }
      color="secondary"
      sx={{ display: "block", ...sx }}
    />
  );
};

export const DatasetsBadge = ({ sx }: { sx?: BadgeProps["sx"] }) => {
  const ctx = useControlSectionContext();
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const datasetsCount = chartConfig.cubes.length;

  return <Badge invisible={ctx.isOpen} badgeContent={datasetsCount} sx={sx} />;
};
