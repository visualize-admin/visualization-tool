import { Trans, t } from "@lingui/macro";
import { Box, IconButton, Theme, useEventCallback } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ComponentProps, useEffect, useState } from "react";

import {
  ChartDataFiltersList,
  ChartDataFiltersToggle,
  useChartDataFiltersState,
} from "@/charts/shared/chart-data-filters";
import { ArrowMenuTopBottom } from "@/components/arrow-menu";
import { chartPanelLayoutGridClasses } from "@/components/chart-panel-layout-grid";
import { useChartTablePreview } from "@/components/chart-table-preview";
import { MenuActionItem } from "@/components/menu-action-item";
import { MetadataPanel } from "@/components/metadata-panel";
import {
  ChartConfig,
  DashboardFiltersConfig,
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

/** Generic styles shared between `ChartPreview` and `ChartPublished`. */
export const useChartStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "grid",
    gridTemplateRows: "subgrid",
    /** Should stay in sync with the number of rows contained in a chart */
    gridRow: "span 7",
    height: "100%",
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    border: "1px solid",
    borderColor: theme.palette.divider,
    color: theme.palette.grey[800],
    [`.${chartPanelLayoutGridClasses.root} &`]: {
      display: "flex",
      flexDirection: "column",
    },
  },
}));

export const ChartControls = ({
  dataSource,
  chartConfig,
  dashboardFilters,
  metadataPanelProps,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dashboardFilters: DashboardFiltersConfig | undefined;
  metadataPanelProps: Omit<
    ComponentProps<typeof MetadataPanel>,
    "dataSource" | "chartConfig" | "dashboardFilters"
  >;
}) => {
  const showFilters =
    chartConfig.interactiveFiltersConfig?.dataFilters.active &&
    chartConfig.interactiveFiltersConfig.dataFilters.componentIris.some(
      (componentIri) =>
        !dashboardFilters?.dataFilters.componentIris.includes(componentIri)
    );
  const chartFiltersState = useChartDataFiltersState({
    dataSource,
    chartConfig,
    dashboardFilters,
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
          chartConfig={chartConfig}
          dashboardFilters={dashboardFilters}
          {...metadataPanelProps}
        />
      </Box>
      <Box sx={{ gridArea: "filtersList" }}>
        {showFilters && <ChartDataFiltersList {...chartFiltersState} />}
      </Box>
    </Box>
  );
};

export const ChartMoreButton = ({
  configKey,
  chartKey,
}: {
  configKey?: string;
  chartKey: string;
}) => {
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
        color="secondary"
        onClick={(ev) => setAnchor(ev.currentTarget)}
        sx={{ height: "fit-content" }}
      >
        <SvgIcMore />
      </IconButton>
      <ArrowMenuTopBottom
        open={!!anchor}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {isPublished(state) ? (
          <div>
            {chartConfig.chartType !== "table" ? (
              <TableViewChartMenuActionItem
                chartType={chartConfig.chartType}
                onSuccess={handleClose}
              />
            ) : null}
            {state.layout.type !== "dashboard" && configKey ? (
              <>
                <CopyChartMenuActionItem configKey={configKey} />
                <ShareChartMenuActionItem configKey={configKey} />
              </>
            ) : null}
          </div>
        ) : (
          <div>
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
            <DuplicateChartMenuActionItem
              chartConfig={chartConfig}
              onSuccess={handleClose}
            />
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
      </ArrowMenuTopBottom>
    </>
  );
};

const CopyChartMenuActionItem = ({ configKey }: { configKey: string }) => {
  const locale = useLocale();
  const [copyUrl, setCopyUrl] = useState("");
  useEffect(() => {
    setCopyUrl(
      `${window.location.origin}/${locale}/create/new?copy=${configKey}`
    );
  }, [configKey, locale]);
  return (
    <MenuActionItem
      type="link"
      as="menuitem"
      href={copyUrl}
      target="_blank"
      rel="noopener noreferrer"
      iconName="edit"
      label={<Trans id="chart-controls.copy-and-edit">Copy and edit</Trans>}
    />
  );
};

const ShareChartMenuActionItem = ({ configKey }: { configKey: string }) => {
  const locale = useLocale();
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);
  return (
    <MenuActionItem
      type="link"
      as="menuitem"
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      iconName="share"
      label={<Trans id="button.share">Share</Trans>}
    />
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
