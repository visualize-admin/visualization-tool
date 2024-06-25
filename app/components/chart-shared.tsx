import { Trans, t } from "@lingui/macro";
import { Box, IconButton, useEventCallback } from "@mui/material";
import { ComponentProps, useEffect, useState } from "react";

import {
  ChartDataFiltersList,
  ChartDataFiltersToggle,
  useChartDataFiltersState,
} from "@/charts/shared/chart-data-filters";
import { ArrowMenu } from "@/components/arrow-menu";
import { useChartTablePreview } from "@/components/chart-table-preview";
import { MenuActionItem } from "@/components/menu-action-item";
import { MetadataPanel } from "@/components/metadata-panel";
import {
  ChartConfig,
  DataSource,
  getChartConfig,
  hasChartConfigs,
  isConfiguring,
  isPublished,
  useConfiguratorState,
} from "@/configurator";
import { getChartIcon } from "@/icons";
import SvgIcMore from "@/icons/components/IcMore";
import { useLocale } from "@/src";
import { createChartId } from "@/utils/create-chart-id";

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
  const showFilters = chartConfig.interactiveFiltersConfig?.dataFilters.active;
  const chartFiltersState = useChartDataFiltersState({
    dataSource,
    chartConfig,
  });
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateAreas: `
    "filtersToggle metadataToggle"
    "filtersList filtersList"`,
        mt: 4,
      }}
    >
      <Box sx={{ gridArea: "filtersToggle" }}>
        {showFilters && <ChartDataFiltersToggle {...chartFiltersState} />}
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
        {showFilters && <ChartDataFiltersList {...chartFiltersState} />}
      </Box>
    </Box>
  );
};

export const ChartMoreButton = ({ chartKey }: { chartKey: string }) => {
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useEventCallback(() => setAnchor(null));
  const chartConfig = getChartConfig(state, chartKey);
  const { setIsTableRaw } = useChartTablePreview();
  // Reset back to chart view when switching chart type.
  useEffect(() => {
    setIsTableRaw(false);
  }, [chartConfig.chartType, setIsTableRaw]);

  return (
    <>
      <IconButton
        onClick={(ev) => setAnchor(ev.currentTarget)}
        sx={{ height: "fit-content" }}
      >
        <SvgIcMore />
      </IconButton>
      <ArrowMenu
        open={!!anchor}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
      >
        {isPublished(state) ? (
          <div>
            {chartConfig.chartType !== "table" ? (
              <TableViewChartMenuActionItem
                chartType={chartConfig.chartType}
                onSuccess={handleClose}
              />
            ) : null}
          </div>
        ) : (
          <div>
            <DuplicateChartMenuActionItem
              chartConfig={chartConfig}
              onSuccess={handleClose}
            />
            {isConfiguring(state) ? null : (
              <MenuActionItem
                type="button"
                as="menuitem"
                onClick={() => {
                  dispatch({ type: "CONFIGURE_CHART", value: { chartKey } });
                  handleClose();
                }}
                iconName="edit"
                label={<Trans id="chart-controls.edit">Edit</Trans>}
              />
            )}
            {state.chartConfigs.length > 1 ? (
              <MenuActionItem
                type="button"
                as="menuitem"
                color="error"
                requireConfirmation
                confirmationTitle={t({
                  id: "chart-controls.delete.title",
                  message: "Delete chart?",
                })}
                confirmationText={t({
                  id: "chart-controls.delete.confirmation",
                  message: "Are you sure you want to delete this chart?",
                })}
                onClick={() => {
                  dispatch({
                    type: "CHART_CONFIG_REMOVE",
                    value: { chartKey },
                  });
                  handleClose();
                }}
                iconName="trash"
                label={<Trans id="chart-controls.delete">Delete</Trans>}
              />
            ) : null}
            {chartConfig.chartType !== "table" ? (
              <TableViewChartMenuActionItem
                chartType={chartConfig.chartType}
                onSuccess={handleClose}
              />
            ) : null}
          </div>
        )}
      </ArrowMenu>
    </>
  );
};

export const DuplicateChartMenuActionItem = ({
  chartConfig,
  onSuccess,
}: {
  chartConfig: ChartConfig;
  onSuccess: () => void;
}) => {
  const locale = useLocale();
  const [_, dispatch] = useConfiguratorState(hasChartConfigs);
  return (
    <MenuActionItem
      type="button"
      as="menuitem"
      onClick={() => {
        dispatch({
          type: "CHART_CONFIG_ADD",
          value: {
            chartConfig: { ...chartConfig, key: createChartId() },
            locale,
          },
        });
        onSuccess();
      }}
      iconName="duplicate"
      label={<Trans id="chart-controls.duplicate">Duplicate</Trans>}
    />
  );
};

const TableViewChartMenuActionItem = ({
  chartType,
  onSuccess,
}: {
  chartType: ChartConfig["chartType"];
  onSuccess: () => void;
}) => {
  const { isTable, setIsTable } = useChartTablePreview();
  return (
    <MenuActionItem
      type="button"
      as="menuitem"
      onClick={() => {
        setIsTable(!isTable);
        onSuccess();
      }}
      iconName={isTable ? getChartIcon(chartType) : "table"}
      label={
        isTable ? (
          <Trans id="chart-controls.chart-view">Chart view</Trans>
        ) : (
          <Trans id="chart-controls.table-view">Table view</Trans>
        )
      }
    />
  );
};
