import { Trans } from "@lingui/macro";
import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";

import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { isUsingImputation } from "@/charts/shared/imputation";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "@/charts/shared/use-interactive-filters";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import GenericChart from "@/components/common-chart";
import Flex from "@/components/flex";
import { HintBlue, HintRed, HintYellow } from "@/components/hint";
import {
  MetadataPanel,
  MetadataPanelStoreContext,
  createMetadataPanelStore,
} from "@/components/metadata-panel";
import {
  ChartConfig,
  ConfiguratorStatePublishing,
  DataSource,
  Meta,
  PublishedConfiguratorStateProvider,
} from "@/configurator";
import { DataSetTable } from "@/configurator/components/datatable";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import { parseDate } from "@/configurator/components/ui-helpers";
import {
  DEFAULT_DATA_SOURCE,
  useIsTrustedDataSource,
} from "@/domain/datasource";
import {
  DimensionMetadataFragment,
  useDataCubeMetadataWithComponentValuesQuery,
} from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import { useEmbedOptions } from "@/utils/embed";
import useEvent from "@/utils/use-event";

export const ChartPublished = ({
  dataSet,
  dataSource,
  meta,
  chartConfig,
  configKey,
}: {
  dataSet: string;
  dataSource: DataSource;
  meta: Meta;
  chartConfig: ChartConfig;
  configKey: string;
}) => {
  return (
    <ChartTablePreviewProvider>
      <ChartPublishedInner
        dataSet={dataSet}
        dataSource={dataSource}
        meta={meta}
        chartConfig={chartConfig}
        configKey={configKey}
      />
    </ChartTablePreviewProvider>
  );
};

const useStyles = makeStyles<Theme, { shrink: boolean }>((theme) => ({
  root: {
    position: "relative",
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    padding: theme.spacing(5),
    paddingLeft: ({ shrink }) =>
      `calc(${theme.spacing(5)} + ${shrink ? DRAWER_WIDTH : 0}px)`,
    color: theme.palette.grey[800],
    overflowX: "auto",
    transition: "padding 0.25s ease",
  },
}));

export const ChartPublishedInner = ({
  dataSet,
  dataSource = DEFAULT_DATA_SOURCE,
  meta,
  chartConfig,
  configKey,
}: {
  dataSet: string;
  dataSource: DataSource | undefined;
  meta: Meta;
  chartConfig: ChartConfig;
  configKey: string;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const {
    state: isTablePreview,
    setState: setIsTablePreview,
    containerRef,
    containerHeight,
    computeContainerHeight,
  } = useChartTablePreview();

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

  const classes = useStyles({
    shrink: shouldShrink,
  });
  const locale = useLocale();
  const isTrustedDataSource = useIsTrustedDataSource(dataSource);

  const [{ data: metaData }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const publishedConfiguratorState = useMemo(() => {
    return {
      state: "PUBLISHING",
      dataSource,
      chartConfig: chartConfig,
    } as ConfiguratorStatePublishing;
  }, [chartConfig, dataSource]);
  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));

  const allDimensions: DimensionMetadataFragment[] = useMemo(() => {
    return [
      ...(metaData?.dataCubeByIri?.dimensions ?? []),
      ...(metaData?.dataCubeByIri?.measures ?? []),
    ];
  }, [metaData?.dataCubeByIri?.dimensions, metaData?.dataCubeByIri?.measures]);

  const [{ showDownload }] = useEmbedOptions();

  return (
    <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
      <Box className={classes.root} ref={rootRef}>
        <ChartErrorBoundary resetKeys={[chartConfig]}>
          {metaData?.dataCubeByIri?.publicationStatus ===
            DataCubePublicationStatus.Draft && (
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
          {metaData?.dataCubeByIri?.expires && (
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
                  Some data in this dataset is missing and has been interpolated
                  to fill the gaps.
                </Trans>
              </HintBlue>
            </Box>
          )}
          <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography component="div" variant="h2" mb={2}>
              {meta.title[locale]}
            </Typography>

            <MetadataPanel
              datasetIri={dataSet}
              dataSource={dataSource}
              dimensions={allDimensions}
              container={rootRef.current}
            />
          </Flex>

          {meta.description[locale] && (
            <Typography component="div" variant="body1" mb={2}>
              {meta.description[locale]}
            </Typography>
          )}
          <InteractiveFiltersProvider>
            <Flex
              flexDirection="column"
              ref={containerRef}
              height={containerHeight.current!}
              flexGrow={1}
            >
              <PublishedConfiguratorStateProvider
                chartId={configKey}
                initialState={publishedConfiguratorState}
              >
                {isTablePreview ? (
                  <DataSetTable
                    sx={{ maxHeight: "100%" }}
                    dataSetIri={dataSet}
                    dataSource={dataSource}
                    chartConfig={chartConfig}
                  />
                ) : (
                  <ChartWithInteractiveFilters
                    dataSet={dataSet}
                    dataSource={dataSource}
                    chartConfig={chartConfig}
                  />
                )}
              </PublishedConfiguratorStateProvider>
            </Flex>
            <ChartFootnotes
              dataSetIri={dataSet}
              dataSource={dataSource}
              chartConfig={chartConfig}
              configKey={configKey}
              onToggleTableView={handleToggleTableView}
              visualizeLinkText={
                showDownload === false ? (
                  <Trans id="metadata.link.created.with.visualize.alternate">
                    More information
                  </Trans>
                ) : undefined
              }
            />
          </InteractiveFiltersProvider>
        </ChartErrorBoundary>
      </Box>
    </MetadataPanelStoreContext.Provider>
  );
};

const ChartWithInteractiveFilters = React.forwardRef(
  (
    {
      dataSet,
      dataSource,
      chartConfig,
    }: {
      dataSet: string;
      dataSource: DataSource;
      chartConfig: ChartConfig;
    },
    ref
  ) => {
    const [_, dispatch] = useInteractiveFilters();
    const { interactiveFiltersConfig } = chartConfig;

    const presetFrom =
      interactiveFiltersConfig?.timeRange.presets.from &&
      parseDate(interactiveFiltersConfig?.timeRange.presets.from.toString());
    const presetTo =
      interactiveFiltersConfig?.timeRange.presets.to &&
      parseDate(interactiveFiltersConfig?.timeRange.presets.to.toString());

    // Reset data filters if chart type changes
    useEffect(() => {
      dispatch({
        type: "RESET_DATA_FILTER",
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartConfig.chartType]);

    // Editor time presets supersede interactive state
    const presetFromStr = presetFrom?.toString();
    const presetToStr = presetTo?.toString();
    useEffect(() => {
      if (presetFrom && presetTo) {
        dispatch({
          type: "SET_TIME_RANGE_FILTER",
          value: [presetFrom, presetTo],
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, presetFromStr, presetToStr]);

    return (
      <Flex
        ref={ref}
        sx={{
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {/* Filters list & Interactive filters */}
        {chartConfig.interactiveFiltersConfig && (
          <ChartDataFilters
            dataSet={dataSet}
            dataSource={dataSource}
            dataFiltersConfig={chartConfig.interactiveFiltersConfig.dataFilters}
            chartConfig={chartConfig}
          />
        )}
        <GenericChart
          dataSet={dataSet}
          dataSource={dataSource}
          chartConfig={chartConfig}
        />
      </Flex>
    );
  }
);
