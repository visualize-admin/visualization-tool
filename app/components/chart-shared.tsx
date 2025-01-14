import { t, Trans } from "@lingui/macro";
import {
  Box,
  IconButton,
  Theme,
  useEventCallback,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { select } from "d3-selection";
import deburr from "lodash/deburr";
import uniqBy from "lodash/uniqBy";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createRoot } from "react-dom/client";

import {
  ChartDataFiltersList,
  ChartDataFiltersToggle,
  useChartDataFiltersState,
} from "@/charts/shared/chart-data-filters";
import { extractChartConfigUsedComponents } from "@/charts/shared/chart-helpers";
import { ArrowMenuTopBottom } from "@/components/arrow-menu";
import {
  CHART_FOOTNOTES_CLASS_NAME,
  VisualizeLink,
} from "@/components/chart-footnotes";
import { chartPanelLayoutGridClasses } from "@/components/chart-panel-layout-grid";
import {
  TABLE_PREVIEW_WRAPPER_CLASS_NAME,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { useChartWithFiltersClasses } from "@/components/chart-with-filters";
import { MenuActionItem } from "@/components/menu-action-item";
import { MetadataPanel } from "@/components/metadata-panel";
import { getChartConfig } from "@/config-utils";
import {
  ChartConfig,
  DashboardFiltersConfig,
  DataSource,
  hasChartConfigs,
  isConfiguring,
  isPublished,
  useConfiguratorState,
} from "@/configurator";
import { timeUnitToFormatter } from "@/configurator/components/ui-helpers";
import { Component } from "@/domain/data";
import { truthy } from "@/domain/types";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { getChartIcon } from "@/icons";
import SvgIcMore from "@/icons/components/IcMore";
import { useLocale } from "@/src";
import { animationFrame } from "@/utils/animation-frame";
import { createChartId } from "@/utils/create-chart-id";
import {
  DISABLE_SCREENSHOT_ATTR,
  useScreenshot,
  UseScreenshotProps,
} from "@/utils/use-screenshot";

/** Generic styles shared between `ChartPreview` and `ChartPublished`. */
export const useChartStyles = makeStyles<Theme, { disableBorder?: boolean }>(
  (theme) => ({
    root: {
      flexGrow: 1,
      display: "grid",
      gridTemplateRows: "subgrid",
      /** Should stay in sync with the number of rows contained in a chart */
      gridRow: "span 7",
      padding: theme.spacing(6),
      backgroundColor: theme.palette.background.paper,
      border: ({ disableBorder }) =>
        disableBorder ? "none" : `1px solid ${theme.palette.divider}`,
      color: theme.palette.grey[800],
      [`.${chartPanelLayoutGridClasses.root} &`]: {
        display: "flex",
        flexDirection: "column",
      },
    },
  })
);

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
    chartConfig.interactiveFiltersConfig.dataFilters.componentIds.some(
      (componentId) =>
        !dashboardFilters?.dataFilters.componentIds.includes(componentId)
    );
  const chartFiltersState = useChartDataFiltersState({
    dataSource,
    chartConfig,
    dashboardFilters,
  });

  return (
    <Box
      {...DISABLE_SCREENSHOT_ATTR}
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
  chartWrapperNode,
  components,
}: {
  configKey?: string;
  chartKey: string;
  chartWrapperNode?: HTMLElement | null;
  components: Component[];
}) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(hasChartConfigs);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useEventCallback(() => setAnchor(null));
  const chartConfig = getChartConfig(state, chartKey);
  const { setIsTableRaw } = useChartTablePreview();

  // Reset back to chart view when switching chart type.
  useEffect(() => {
    setIsTableRaw(false);
  }, [chartConfig.chartType, setIsTableRaw]);

  const disableButton =
    isPublished(state) &&
    state.layout.type === "dashboard" &&
    chartConfig.chartType === "table";

  const screenshotName = useMemo(() => {
    const date = timeUnitToFormatter.Day(new Date());
    const label = chartConfig.meta.title[locale] || chartConfig.chartType;
    return `${date}_${label}`;
  }, [chartConfig.meta.title, chartConfig.chartType, locale]);

  return disableButton ? null : (
    <>
      <IconButton
        color="secondary"
        onClick={(ev) => setAnchor(ev.currentTarget)}
        sx={{ height: "fit-content" }}
        {...DISABLE_SCREENSHOT_ATTR}
        data-testid="chart-more-button"
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
              <>
                <TableViewChartMenuActionItem
                  chartType={chartConfig.chartType}
                  onSuccess={handleClose}
                />
                <DownloadPNGImageMenuActionItem
                  configKey={configKey}
                  chartKey={chartKey}
                  components={components}
                  screenshotName={screenshotName}
                  screenshotNode={chartWrapperNode}
                />
              </>
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
                leadingIconName="edit"
                label={<Trans id="chart-controls.edit">Edit</Trans>}
              />
            )}
            <DuplicateChartMenuActionItem
              chartConfig={chartConfig}
              onSuccess={handleClose}
            />
            {chartConfig.chartType !== "table" ? (
              <>
                <TableViewChartMenuActionItem
                  chartType={chartConfig.chartType}
                  onSuccess={handleClose}
                />
                <DownloadPNGImageMenuActionItem
                  configKey={configKey}
                  chartKey={chartKey}
                  components={components}
                  screenshotName={screenshotName}
                  screenshotNode={chartWrapperNode}
                />
              </>
            ) : null}
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
                leadingIconName="trash"
                label={<Trans id="chart-controls.delete">Delete</Trans>}
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
      leadingIconName="edit"
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
      leadingIconName="share"
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
      leadingIconName="duplicate"
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
      leadingIconName={isTable ? getChartIcon(chartType) : "table"}
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

const DownloadPNGImageMenuActionItem = ({
  configKey,
  chartKey,
  components,
  screenshotName,
  screenshotNode,
}: {
  configKey?: string;
  chartKey: string;
  components: Component[];
} & Omit<UseScreenshotProps, "type" | "modifyNode" | "pngMetadata">) => {
  const modifyNode = useModifyNode();
  const metadata = usePNGMetadata({
    configKey,
    chartKey,
    components,
  });
  const { loading, screenshot } = useScreenshot({
    type: "png",
    screenshotName,
    screenshotNode,
    modifyNode,
    pngMetadata: metadata,
  });

  return (
    <MenuActionItem
      type="button"
      as="menuitem"
      onClick={screenshot}
      disabled={loading}
      leadingIconName="download"
      label={`${t({ id: "chart-controls.export", message: "Export" })} PNG`}
    />
  );
};

const useModifyNode = () => {
  const theme = useTheme();
  const chartWithFiltersClasses = useChartWithFiltersClasses();

  return useCallback(
    async (clonedNode: HTMLElement, originalNode: HTMLElement) => {
      // We need to explicitly set the height of the chart container to the height
      // of the chart, as otherwise the screenshot won't work for free canvas charts.
      const tablePreviewWrapper = clonedNode.querySelector(
        `.${TABLE_PREVIEW_WRAPPER_CLASS_NAME}`
      ) as HTMLElement | null;

      if (tablePreviewWrapper) {
        const chart = originalNode.querySelector(
          `.${chartWithFiltersClasses.chartWithFilters}`
        );

        if (chart) {
          const height = chart.clientHeight;
          tablePreviewWrapper.style.height = `${height}px`;
        }
      }

      const footnotes = clonedNode.querySelector(
        `.${CHART_FOOTNOTES_CLASS_NAME}`
      );

      if (footnotes) {
        const container = document.createElement("div");
        footnotes.appendChild(container);
        const root = createRoot(container);
        root.render(
          <VisualizeLink
            createdWith={t({ id: "metadata.link.created.with" })}
          />
        );
        await animationFrame();
      }

      // Remove some elements that should not be included in the screenshot.
      // For maps, we can't apply custom classes to internal elements, so we need
      // to remove them here.
      clonedNode.querySelector(".maplibregl-ctrl")?.remove();

      // Every text element should be dark-grey (currently we use primary.main to
      // indicate interactive elements, which doesn't make sense for screenshots)
      // and not have underlines.
      const color = theme.palette.grey[700];
      select(clonedNode)
        .selectAll("*")
        .style("color", color)
        .style("text-decoration", "none");
      // SVG elements have fill instead of color. Here we only target text elements,
      // to avoid changing the color of other SVG elements (charts).
      select(clonedNode).selectAll("text").style("fill", color);
    },
    [chartWithFiltersClasses.chartWithFilters, theme.palette.grey]
  );
};

const usePNGMetadata = ({
  chartKey,
  configKey,
  components,
}: {
  chartKey: string;
  configKey?: string;
  components: Component[];
}): UseScreenshotProps["pngMetadata"] => {
  const locale = useLocale();
  const [state] = useConfiguratorState(hasChartConfigs);
  const chartConfig = getChartConfig(state, chartKey);

  const usedComponents = useMemo(() => {
    return extractChartConfigUsedComponents(chartConfig, { components });
  }, [chartConfig, components]);

  const [{ data }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      cubeFilters: uniqBy(
        usedComponents.map((component) => ({ iri: component.cubeIri })),
        "iri"
      ),
    },
    pause: !usedComponents.length,
  });

  return useMemo(() => {
    const publisher = data?.dataCubesMetadata
      .map((cube) =>
        cube.contactPoint
          ? `${cube.contactPoint.name} (${cube.contactPoint.email})`
          : (cube.creator?.label ?? cube.publisher)
      )
      .join(", ");
    const publisherMetadata = publisher
      ? { key: "Publisher", value: publisher }
      : null;
    const publishURL = configKey
      ? `${window.location.origin}/${locale}/v/${configKey}`
      : null;
    const publishURLMetadata = publishURL
      ? { key: "Publish URL", value: publishURL }
      : null;
    const datasets = data?.dataCubesMetadata
      .map((cube) => `${cube.title} ${cube.version ? `(${cube.version})` : ""}`)
      .join(", ");
    const datasetsMetadata = datasets
      ? { key: "Dataset", value: datasets }
      : null;

    const metadata = [publisherMetadata, publishURLMetadata, datasetsMetadata]
      .filter(truthy)
      .map(({ key, value }) => `${key}: ${value}`)
      .join(" | ");

    return metadata ? [{ key: "Comment", value: deburr(metadata) }] : [];
  }, [configKey, data?.dataCubesMetadata, locale]);
};
