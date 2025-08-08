import { t, Trans } from "@lingui/macro";
import {
  Box,
  IconButton,
  Theme,
  ThemeProvider,
  useEventCallback,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { select } from "d3-selection";
import deburr from "lodash/deburr";
import uniqBy from "lodash/uniqBy";
import {
  ComponentProps,
  ReactNode,
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
import { getChartIcon, Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { animationFrame } from "@/utils/animation-frame";
import { createId } from "@/utils/create-id";
import {
  DISABLE_SCREENSHOT_ATTR,
  useScreenshot,
  UseScreenshotProps,
} from "@/utils/use-screenshot";

export const CHART_GRID_ROW_COUNT = 7;

/** Generic styles shared between `ChartPreview` and `ChartPublished`. */
export const useChartStyles = makeStyles<Theme, { removeBorder?: boolean }>(
  (theme) => ({
    root: {
      flexGrow: 1,
      padding: theme.spacing(8),
      backgroundColor: theme.palette.background.paper,
      border: ({ removeBorder }) =>
        removeBorder ? "none" : `1px solid ${theme.palette.divider}`,

      [`.${chartPanelLayoutGridClasses.root} &`]: {
        display: "flex",
        flexDirection: "column",
      },
    },
    editing: {
      display: "flex",
      flexDirection: "column",
    },
    pastEditing: {
      display: "grid",
      gridTemplateRows: "subgrid",
      /** Should stay in sync with the number of rows contained in a chart */
      gridRow: `span ${CHART_GRID_ROW_COUNT}`,
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
  metadataPanelProps?: Omit<
    ComponentProps<typeof MetadataPanel>,
    "dataSource" | "chartConfig" | "dashboardFilters"
  >;
}) => {
  const chartDataFilters = chartConfig.interactiveFiltersConfig.dataFilters;
  const dashboardDataFilters = dashboardFilters?.dataFilters;
  const showFilters =
    chartDataFilters.active &&
    chartDataFilters.componentIds.some(
      (id) => !dashboardDataFilters?.componentIds.includes(id)
    );
  const chartFiltersState = useChartDataFiltersState({
    dataSource,
    chartConfig,
    dashboardFilters,
  });

  return showFilters || metadataPanelProps ? (
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
      {metadataPanelProps ? (
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
      ) : null}
      <Box sx={{ gridArea: "filtersList" }}>
        {showFilters && <ChartDataFiltersList {...chartFiltersState} />}
      </Box>
    </Box>
  ) : (
    <span style={{ height: 1 }} />
  );
};

export const ChartMoreButton = ({
  configKey,
  chartKey,
  chartWrapperNode,
  components,
  disableDatabaseRelatedActions,
}: {
  configKey?: string;
  chartKey: string;
  chartWrapperNode?: HTMLElement | null;
  components: Component[];
  disableDatabaseRelatedActions?: boolean;
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

  const getPublishedActions = useCallback(() => {
    const actions: ReactNode[] = [];

    if (chartConfig.chartType !== "table") {
      actions.push(
        <TableViewChartMenuActionItem
          chartType={chartConfig.chartType}
          onSuccess={handleClose}
        />
      );
      actions.push(
        <DownloadPNGImageMenuActionItem
          configKey={configKey}
          chartKey={chartKey}
          components={components}
          screenshotName={screenshotName}
          screenshotNode={chartWrapperNode}
        />
      );
    }

    if (
      state.layout.type !== "dashboard" &&
      configKey &&
      !disableDatabaseRelatedActions
    ) {
      actions.push(<CopyChartMenuActionItem configKey={configKey} />);
      actions.push(<ShareChartMenuActionItem configKey={configKey} />);
    }

    return actions;
  }, [
    chartConfig.chartType,
    state.layout.type,
    configKey,
    disableDatabaseRelatedActions,
    handleClose,
    chartKey,
    components,
    screenshotName,
    chartWrapperNode,
  ]);

  const getUnpublishedActions = useCallback(() => {
    const actions: ReactNode[] = [];

    if (!isConfiguring(state)) {
      actions.push(
        <MenuActionItem
          type="button"
          as="menuitem"
          onClick={() => {
            dispatch({ type: "CONFIGURE_CHART", value: { chartKey } });
            handleClose();
          }}
          leadingIconName="pen"
          label={<Trans id="chart-controls.edit">Edit</Trans>}
        />
      );
    }

    actions.push(
      <DuplicateChartMenuActionItem
        chartConfig={chartConfig}
        onSuccess={handleClose}
      />
    );

    if (chartConfig.chartType !== "table") {
      actions.push(
        <TableViewChartMenuActionItem
          chartType={chartConfig.chartType}
          onSuccess={handleClose}
        />
      );
      actions.push(
        <DownloadPNGImageMenuActionItem
          configKey={configKey}
          chartKey={chartKey}
          components={components}
          screenshotName={screenshotName}
          screenshotNode={chartWrapperNode}
        />
      );
    }

    if (state.chartConfigs.length > 1) {
      actions.push(
        <MenuActionItem
          type="button"
          as="menuitem"
          color="red"
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
      );
    }

    return actions;
  }, [
    state,
    chartConfig,
    handleClose,
    dispatch,
    chartKey,
    configKey,
    components,
    screenshotName,
    chartWrapperNode,
  ]);

  const published = isPublished(state);

  const availableActions = useMemo(() => {
    return published ? getPublishedActions() : getUnpublishedActions();
  }, [getPublishedActions, getUnpublishedActions, published]);

  if (disableButton || availableActions.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton
        {...DISABLE_SCREENSHOT_ATTR}
        data-testid="chart-more-button"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ height: "fit-content" }}
      >
        <Icon name="dots" />
      </IconButton>
      <ArrowMenuTopBottom
        open={!!anchor}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {availableActions}
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
      leadingIconName="pen"
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
            chartConfig: { ...chartConfig, key: createId() },
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
      leadingIconName={isTable ? getChartIcon(chartType) : "tableChart"}
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
  const modifyNode = useModifyNode(configKey);
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
      label={t({ id: "chart-controls.export-png", message: "Export PNG" })}
    />
  );
};

const useModifyNode = (configKey?: string) => {
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

      if (footnotes && configKey) {
        const container = document.createElement("div");
        footnotes.appendChild(container);
        const root = createRoot(container);
        root.render(
          <ThemeProvider theme={theme}>
            <VisualizeLink
              configKey={configKey}
              createdWith={t({ id: "metadata.link.created.with" })}
            />
          </ThemeProvider>
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
        .selectAll(
          `:is(p, button, a, span, div, li, h1, h2, h3, h4, h5, h6):not([${DISABLE_SCREENSHOT_COLOR_WIPE_KEY}='true'])`
        )
        .style("color", color)
        .style("text-decoration", "none");
      // SVG elements have fill instead of color. Here we only target text elements,
      // to avoid changing the color of other SVG elements (charts).
      select(clonedNode)
        .selectAll(`text:not([${DISABLE_SCREENSHOT_COLOR_WIPE_KEY}='true'])`)
        .style("fill", color);
    },
    [chartWithFiltersClasses.chartWithFilters, theme, configKey]
  );
};

export const DISABLE_SCREENSHOT_COLOR_WIPE_KEY =
  "data-disable-screenshot-color";
export const DISABLE_SCREENSHOT_COLOR_WIPE_ATTR = {
  [DISABLE_SCREENSHOT_COLOR_WIPE_KEY]: true,
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
