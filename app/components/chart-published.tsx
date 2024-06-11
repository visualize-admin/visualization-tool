import { Trans } from "@lingui/macro";
import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";

import { DataSetTable } from "@/browse/datatable";
import { extractChartConfigsComponentIris } from "@/charts/shared/chart-helpers";
import { LoadingStateProvider } from "@/charts/shared/chart-loading-state";
import { isUsingImputation } from "@/charts/shared/imputation";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import { ChartPanelLayout, ChartWrapper } from "@/components/chart-panel";
import { ChartControls } from "@/components/chart-shared";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { useChartStyles } from "@/components/chart-utils";
import { ChartWithFilters } from "@/components/chart-with-filters";
import { DashboardInteractiveFilters } from "@/components/dashboard-interactive-filters";
import Flex from "@/components/flex";
import { HintBlue, HintRed, HintYellow } from "@/components/hint";
import {
  MetadataPanelStoreContext,
  createMetadataPanelStore,
} from "@/components/metadata-panel-store";
import {
  ChartConfig,
  ConfiguratorStatePublished,
  DataSource,
  getChartConfig,
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
import { useEmbedOptions } from "@/utils/embed";
import useEvent from "@/utils/use-event";

type ChartPublishedProps = {
  configKey?: string;
};

type ChartPublishedIndividualChartProps = ChartPublishInnerProps;

const ChartPublishedIndividualChart = forwardRef<
  HTMLDivElement,
  ChartPublishedIndividualChartProps
>(({ dataSource, state, chartConfig, configKey, children, ...rest }, ref) => {
  return (
    <ChartTablePreviewProvider key={chartConfig.key}>
      <ChartWrapper
        key={chartConfig.key}
        layoutType={state.layout.type}
        ref={ref}
        {...rest}
      >
        <ChartPublishedInner
          key={chartConfig.key}
          dataSource={dataSource}
          state={state}
          chartConfig={chartConfig}
          configKey={configKey}
        >
          {children}
        </ChartPublishedInner>
      </ChartWrapper>
    </ChartTablePreviewProvider>
  );
});

export const ChartPublished = (props: ChartPublishedProps) => {
  const { configKey } = props;
  const [state] = useConfiguratorState(isPublished);
  const { dataSource } = state;
  const locale = useLocale();
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

  return (
    <InteractiveFiltersProvider chartConfigs={state.chartConfigs}>
      {state.layout.type === "dashboard" ? (
        <>
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
        </>
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
            <ChartWrapper layoutType={state.layout.type}>
              <ChartPublishedInner
                dataSource={dataSource}
                state={state}
                chartConfig={getChartConfig(state)}
                configKey={configKey}
              />
            </ChartWrapper>
          </ChartTablePreviewProvider>
        </>
      )}
    </InteractiveFiltersProvider>
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
  })
);

type ChartPublishInnerProps = {
  dataSource: DataSource | undefined;
  state: ConfiguratorStatePublished;
  chartConfig: ChartConfig;
  configKey: string | undefined;
  className?: string;
  children?: React.ReactNode;
};

const ChartPublishedInner = (props: ChartPublishInnerProps) => {
  const {
    dataSource = DEFAULT_DATA_SOURCE,
    state,
    chartConfig,
    configKey,
    className,
    children,
  } = props;
  const { meta } = chartConfig;
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    state: isTablePreview,
    setState: setIsTablePreview,
    containerRef,
    containerHeight,
    computeContainerHeight,
  } = useChartTablePreview();
  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));
  const [{ showDownload }] = useEmbedOptions();
  const metadataPanelStore = useMemo(() => createMetadataPanelStore(), []);
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

  const chartClasses = useChartStyles();
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
  const componentIris = extractChartConfigsComponentIris(state.chartConfigs);
  const [{ data: componentsData }] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
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
    <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
      <Box
        className={clsx(
          chartClasses.root,
          publishedChartClasses.root,
          className
        )}
        ref={rootRef}
      >
        {children}
        <ChartErrorBoundary resetKeys={[chartConfig]}>
          <div>
            {metadata?.some(
              (d) => d.publicationStatus === DataCubePublicationStatus.Draft
            ) && (
              <Box sx={{ mb: 4 }}>
                <HintRed iconName="datasetError" iconSize={64}>
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
                <HintRed iconName="datasetError" iconSize={64}>
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
                <HintYellow iconName="hintWarning">
                  <Trans id="data.source.notTrusted">
                    This chart is not using a trusted data source.
                  </Trans>
                </HintYellow>
              </Box>
            )}
            {isUsingImputation(chartConfig) && (
              <Box sx={{ mb: 4 }}>
                <HintBlue iconName="hintWarning">
                  <Trans id="dataset.hasImputedValues">
                    Some data in this dataset is missing and has been
                    interpolated to fill the gaps.
                  </Trans>
                </HintBlue>
              </Box>
            )}
          </div>
          <LoadingStateProvider>
            <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
              <Flex
                sx={{
                  justifyContent: meta.title[locale]
                    ? "space-between"
                    : "flex-end",
                  gap: 2,
                }}
              >
                {meta.title[locale] ? (
                  <Title text={meta.title[locale]} />
                ) : (
                  // We need to have a span here to keep the space between the
                  // title and the chart (subgrid layout)
                  <span />
                )}
              </Flex>
              {meta.description[locale] ? (
                <Description text={meta.description[locale]} />
              ) : (
                // We need to have a span here to keep the space between the
                // title and the chart (subgrid layout)
                <span />
              )}
              <ChartControls
                dataSource={dataSource}
                chartConfig={chartConfig}
                metadataPanelProps={{
                  dimensions: allComponents,
                  container: rootRef.current,
                }}
              />

              <div
                ref={containerRef}
                style={{
                  // TODO before merging, Align with chart-preview
                  minWidth: 0,
                  height: containerHeight.current,
                  marginTop: 16,
                  flexGrow: 1,
                }}
              >
                {isTablePreview ? (
                  <DataSetTable
                    sx={{ maxHeight: "100%" }}
                    dataSource={dataSource}
                    chartConfig={chartConfig}
                  />
                ) : (
                  <ChartWithFilters
                    dataSource={dataSource}
                    componentIris={componentIris}
                    chartConfig={chartConfig}
                  />
                )}
              </div>
              <ChartFootnotes
                dataSource={dataSource}
                chartConfig={chartConfig}
                dimensions={dimensions}
                configKey={configKey}
                onToggleTableView={handleToggleTableView}
                visualizeLinkText={
                  showDownload === false ? (
                    <Trans id="metadata.link.created.with.visualize.alternate">
                      visualize.admin.ch
                    </Trans>
                  ) : undefined
                }
              />
            </InteractiveFiltersChartProvider>
          </LoadingStateProvider>
        </ChartErrorBoundary>
      </Box>
    </MetadataPanelStoreContext.Provider>
  );
};
