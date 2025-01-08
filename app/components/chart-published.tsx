import { t, Trans } from "@lingui/macro";
import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";

import { DataSetTable } from "@/browse/datatable";
import { extractChartConfigsComponentIds } from "@/charts/shared/chart-helpers";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { isUsingImputation } from "@/charts/shared/imputation";
import { CHART_RESIZE_EVENT_TYPE } from "@/charts/shared/use-size";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes, VisualizeLink } from "@/components/chart-footnotes";
import { ChartPanelLayout, ChartWrapper } from "@/components/chart-panel";
import {
  ChartControls,
  ChartMoreButton,
  useChartStyles,
} from "@/components/chart-shared";
import {
  ChartTablePreviewProvider,
  TablePreviewWrapper,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { ChartWithFilters } from "@/components/chart-with-filters";
import { DashboardInteractiveFilters } from "@/components/dashboard-interactive-filters";
import Flex from "@/components/flex";
import { HintBlue, HintRed, HintYellow } from "@/components/hint";
import {
  createMetadataPanelStore,
  MetadataPanelStoreContext,
} from "@/components/metadata-panel-store";
import { getChartConfig } from "@/config-utils";
import {
  ChartConfig,
  ConfiguratorStatePublished,
  DataSource,
  isPublished,
  useConfiguratorState,
} from "@/configurator";
import { Description, Title } from "@/configurator/components/annotators";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import {
  DEFAULT_DATA_SOURCE,
  useIsTrustedDataSource,
} from "@/domain/datasource";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
} from "@/graphql/hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import {
  InteractiveFiltersChartProvider,
  InteractiveFiltersProvider,
} from "@/stores/interactive-filters";
import { useResizeObserver } from "@/utils/use-resize-observer";

type ChartPublishedIndividualChartProps = Omit<
  ChartPublishInnerProps,
  "metadataPanelStore"
>;

const ChartPublishedIndividualChart = forwardRef<
  HTMLDivElement,
  ChartPublishedIndividualChartProps
>(({ dataSource, state, chartConfig, configKey, children, ...rest }, ref) => {
  const metadataPanelStore = useMemo(() => createMetadataPanelStore(), []);
  return (
    <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
      <ChartTablePreviewProvider key={chartConfig.key}>
        <ChartWrapper
          key={chartConfig.key}
          layoutType={state.layout.type}
          ref={ref}
          chartKey={chartConfig.key}
          {...rest}
        >
          <ChartPublishedInner
            key={chartConfig.key}
            dataSource={dataSource}
            state={state}
            chartConfig={chartConfig}
            configKey={configKey}
            metadataPanelStore={metadataPanelStore}
          >
            {children}
          </ChartPublishedInner>
        </ChartWrapper>
      </ChartTablePreviewProvider>
    </MetadataPanelStoreContext.Provider>
  );
});

export const ChartPublished = ({
  configKey,
  disableBorder,
}: {
  configKey?: string;
  disableBorder?: boolean;
}) => {
  const [state] = useConfiguratorState(isPublished);
  const { dataSource } = state;
  const locale = useLocale();
  const metadataPanelStore = useMemo(() => createMetadataPanelStore(), []);

  const publishedChartClasses = usePublishedChartStyles({ shrink: true });

  const renderChart = useCallback(
    (chartConfig: ChartConfig) => (
      <ChartPublishedIndividualChart
        key={chartConfig.key}
        dataSource={dataSource}
        state={state}
        chartConfig={chartConfig}
        configKey={configKey}
      />
    ),
    [configKey, dataSource, state]
  );
  // Sends out the height of the chart, so the iframe can be resized accordingly.
  const handleHeightChange = useCallback(
    ({ height }: { width: number; height: number }) => {
      window.parent.postMessage({ type: CHART_RESIZE_EVENT_TYPE, height }, "*");
    },
    []
  );
  const [ref] = useResizeObserver(handleHeightChange);

  return (
    <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
      <InteractiveFiltersProvider chartConfigs={state.chartConfigs}>
        <Box ref={ref}>
          {state.layout.type === "dashboard" ? (
            <Box className={publishedChartClasses.dashboardBoxWrapper}>
              <Box
                sx={{
                  mb:
                    state.layout.meta.title[locale] ||
                    state.layout.meta.description[locale]
                      ? 4
                      : 0,
                }}
              >
                {state.layout.meta.title[locale] && (
                  <Title text={state.layout.meta.title[locale]} />
                )}
                {state.layout.meta.description[locale] && (
                  <Description text={state.layout.meta.description[locale]} />
                )}
              </Box>

              <ChartPanelLayout
                layoutType={state.layout.layout}
                chartConfigs={state.chartConfigs}
                renderChart={renderChart}
              />
              {state.chartConfigs.length !== 1 && (
                <VisualizeLink
                  createdWith={t({ id: "metadata.link.created.with" })}
                />
              )}
            </Box>
          ) : (
            <>
              <Flex
                sx={{
                  flexDirection: "column",
                  mb:
                    state.layout.meta.title[locale] ||
                    state.layout.meta.description[locale]
                      ? 4
                      : 0,
                }}
              >
                {state.layout.meta.title[locale] && (
                  <Title text={state.layout.meta.title[locale]} />
                )}
                {state.layout.meta.description[locale] && (
                  <Description text={state.layout.meta.description[locale]} />
                )}
              </Flex>
              <ChartTablePreviewProvider>
                <DashboardInteractiveFilters />
                <ChartWrapper
                  layoutType={state.layout.type}
                  chartKey={state.activeChartKey}
                >
                  <ChartPublishedInner
                    dataSource={dataSource}
                    state={state}
                    chartConfig={getChartConfig(state)}
                    configKey={configKey}
                    metadataPanelStore={metadataPanelStore}
                    disableBorder={disableBorder}
                  />
                </ChartWrapper>
              </ChartTablePreviewProvider>
            </>
          )}
        </Box>
      </InteractiveFiltersProvider>
    </MetadataPanelStoreContext.Provider>
  );
};

const usePublishedChartStyles = makeStyles<Theme, { shrink: boolean }>(
  (theme) => ({
    root: {
      // Needed for the metadata panel to be contained inside the root.
      position: "relative",
      paddingLeft: ({ shrink }) =>
        `calc(${theme.spacing(5)} + ${shrink ? DRAWER_WIDTH : 0}px)`,
      transition: "padding 0.25s ease",
    },
    dashboardBoxWrapper: {
      [theme.breakpoints.up("xs")]: {
        padding: theme.spacing(5, 4, 2, 4),
      },
      [theme.breakpoints.up("md")]: {
        padding: theme.spacing(5),
      },
      [theme.breakpoints.up("lg")]: {
        padding: theme.spacing(6),
      },

      gap: 16,
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.palette.grey[200],
    },
  })
);

type ChartPublishInnerProps = {
  dataSource: DataSource | undefined;
  state: ConfiguratorStatePublished;
  chartConfig: ChartConfig;
  configKey: string | undefined;
  className?: string;
  children?: React.ReactNode;
  metadataPanelStore: ReturnType<typeof createMetadataPanelStore>;
  disableBorder?: boolean;
};

const ChartPublishedInnerImpl = (props: ChartPublishInnerProps) => {
  const {
    dataSource = DEFAULT_DATA_SOURCE,
    state,
    chartConfig,
    configKey,
    className,
    children,
    metadataPanelStore,
    disableBorder,
  } = props;
  const { meta } = chartConfig;
  const rootRef = useRef<HTMLDivElement>(null);
  const { isTable, computeContainerHeight } = useChartTablePreview();
  const metadataPanelOpen = useStore(metadataPanelStore, (state) => state.open);
  const shouldShrink = useMemo(() => {
    const rootWidth = rootRef.current?.getBoundingClientRect().width;

    if (!rootWidth) {
      return false;
    }

    return metadataPanelOpen && rootWidth > DRAWER_WIDTH * 2;
  }, [metadataPanelOpen]);

  useEffect(() => {
    const unsubscribe = metadataPanelStore.subscribe(() => {
      computeContainerHeight();
    });

    return () => unsubscribe();
  });

  const chartClasses = useChartStyles({ disableBorder });
  const publishedChartClasses = usePublishedChartStyles({
    shrink: shouldShrink,
  });
  const locale = useLocale();
  const isTrustedDataSource = useIsTrustedDataSource(dataSource);
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data: metadataData }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const metadata = metadataData?.dataCubesMetadata;
  const componentIds = extractChartConfigsComponentIds(state.chartConfigs);
  const [{ data: componentsData }] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIds,
        joinBy: cube.joinBy,
      })),
    },
  });
  const components = componentsData?.dataCubesComponents;
  const dimensions = components?.dimensions;
  const measures = components?.measures;
  const allComponents = useMemo(() => {
    if (!dimensions || !measures) {
      return [];
    }

    return [...dimensions, ...measures];
  }, [dimensions, measures]);

  return (
    <Box
      ref={rootRef}
      className={clsx(chartClasses.root, publishedChartClasses.root, className)}
    >
      {children}
      <ChartErrorBoundary resetKeys={[chartConfig]}>
        <div>
          {metadata?.some(
            (d) => d.publicationStatus === DataCubePublicationStatus.Draft
          ) && (
            <Box sx={{ mb: 4 }}>
              <HintRed>
                <Trans id="dataset.publicationStatus.draft.warning">
                  Careful, this dataset is only a draft.
                  <br />
                  <strong>Don&apos;t use for reporting!</strong>
                </Trans>
              </HintRed>
            </Box>
          )}
          {metadata?.some((d) => d.expires) && (
            <Box sx={{ mb: 4 }}>
              <HintRed>
                <Trans id="dataset.publicationStatus.expires.warning">
                  Careful, the data for this chart has expired.
                  <br />
                  <strong>Don&apos;t use for reporting!</strong>
                </Trans>
              </HintRed>
            </Box>
          )}
          {!isTrustedDataSource && (
            <Box sx={{ mb: 4 }}>
              <HintYellow>
                <Trans id="data.source.notTrusted">
                  This chart is not using a trusted data source.
                </Trans>
              </HintYellow>
            </Box>
          )}
          {isUsingImputation(chartConfig) && (
            <Box sx={{ mb: 4 }}>
              <HintBlue>
                <Trans id="dataset.hasImputedValues">
                  Some data in this dataset is missing and has been interpolated
                  to fill the gaps.
                </Trans>
              </HintBlue>
            </Box>
          )}
        </div>
        <LoadingStateProvider>
          <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
            <Flex
              sx={{
                height: "fit-content",
                justifyContent: meta.title[locale]
                  ? "space-between"
                  : "flex-end",
                gap: 2,
              }}
            >
              {meta.title[locale] ? (
                <Title
                  text={meta.title[locale]}
                  smaller={state.layout.type === "dashboard"}
                />
              ) : (
                // We need to have a span here to keep the space between the
                // title and the chart (subgrid layout)
                <span style={{ height: 1 }} />
              )}
              <Box sx={{ mt: "-0.33rem" }}>
                <ChartMoreButton
                  configKey={configKey}
                  chartKey={chartConfig.key}
                  chartWrapperNode={rootRef.current}
                  components={allComponents}
                />
              </Box>
            </Flex>
            {meta.description[locale] ? (
              <Description
                text={meta.description[locale]}
                smaller={state.layout.type === "dashboard"}
              />
            ) : (
              // We need to have a span here to keep the space between the
              // title and the chart (subgrid layout)
              <span style={{ height: 1 }} />
            )}
            <ChartControls
              dataSource={dataSource}
              chartConfig={chartConfig}
              dashboardFilters={state.dashboardFilters}
              metadataPanelProps={{
                components: allComponents,
                container: rootRef.current,
                allowMultipleOpen: true,
              }}
            />
            <TablePreviewWrapper>
              {isTable ? (
                <DataSetTable
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                  dashboardFilters={state.dashboardFilters}
                  sx={{ maxHeight: "100%" }}
                />
              ) : (
                <ChartWithFilters
                  dataSource={dataSource}
                  componentIds={componentIds}
                  chartConfig={chartConfig}
                  dashboardFilters={state.dashboardFilters}
                />
              )}
            </TablePreviewWrapper>
            <ChartFootnotes
              dataSource={dataSource}
              chartConfig={chartConfig}
              dashboardFilters={state.dashboardFilters}
              components={allComponents}
              showVisualizeLink={
                state.layout.type !== "dashboard" ||
                (state.layout.type === "dashboard" &&
                  state.chartConfigs.length === 1)
              }
            />
          </InteractiveFiltersChartProvider>
        </LoadingStateProvider>
      </ChartErrorBoundary>
    </Box>
  );
};

const ChartPublishedInner = (props: ChartPublishInnerProps) => (
  // Enforce re-mounting of the component when the chart config changes
  // to ensure we do not use any out of date data.
  <ChartPublishedInnerImpl {...props} key={props.chartConfig.key} />
);
