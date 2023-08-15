import { Trans } from "@lingui/macro";
import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useStore } from "zustand";

import { DataSetTable } from "@/browse/datatable";
import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { extractComponentIris } from "@/charts/shared/chart-helpers";
import { isUsingImputation } from "@/charts/shared/imputation";
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
import { DRAWER_WIDTH } from "@/configurator/components/drawer";
import { parseDate } from "@/configurator/components/ui-helpers";
import {
  DEFAULT_DATA_SOURCE,
  useIsTrustedDataSource,
} from "@/domain/datasource";
import {
  useComponentsQuery,
  useDataCubeMetadataQuery,
} from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import { useInteractiveFiltersStore } from "@/stores/interactive-filters";
import { useEmbedOptions } from "@/utils/embed";
import useEvent from "@/utils/use-event";

type ChartPublishedProps = {
  dataSet: string;
  dataSource: DataSource;
  meta: Meta;
  chartConfig: ChartConfig;
  configKey: string;
};

export const ChartPublished = (props: ChartPublishedProps) => {
  const { dataSet, dataSource, meta, chartConfig, configKey } = props;

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

type ChartPublishInnerProps = {
  dataSet: string;
  dataSource: DataSource | undefined;
  meta: Meta;
  chartConfig: ChartConfig;
  configKey: string;
};

export const ChartPublishedInner = (props: ChartPublishInnerProps) => {
  const {
    dataSet,
    dataSource = DEFAULT_DATA_SOURCE,
    meta,
    chartConfig,
    configKey,
  } = props;
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
  const commonQueryVariables = {
    iri: dataSet,
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };

  const [{ data: metadata }] = useDataCubeMetadataQuery({
    variables: commonQueryVariables,
  });
  const [{ data: components }] = useComponentsQuery({
    variables: {
      ...commonQueryVariables,
      componentIris: extractComponentIris(chartConfig),
    },
  });

  const publishedConfiguratorState = useMemo(() => {
    return {
      state: "PUBLISHING",
      dataSet,
      dataSource,
      chartConfig,
    } as ConfiguratorStatePublishing;
  }, [dataSet, dataSource, chartConfig]);
  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));

  const allComponents = useMemo(() => {
    if (!components?.dataCubeByIri) {
      return [];
    }

    return [
      ...components.dataCubeByIri.dimensions,
      ...components.dataCubeByIri.measures,
    ];
  }, [components?.dataCubeByIri]);

  const [{ showDownload }] = useEmbedOptions();

  return (
    <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
      <Box className={classes.root} ref={rootRef}>
        <ChartErrorBoundary resetKeys={[chartConfig]}>
          {metadata?.dataCubeByIri?.publicationStatus ===
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
          {metadata?.dataCubeByIri?.expires && (
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
          <Flex
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography component="div" variant="h2" mb={2}>
              {meta.title[locale]}
            </Typography>

            <MetadataPanel
              datasetIri={dataSet}
              dataSource={dataSource}
              dimensions={allComponents}
              container={rootRef.current}
            />
          </Flex>

          {meta.description[locale] && (
            <Typography component="div" variant="body1" mb={2}>
              {meta.description[locale]}
            </Typography>
          )}
          <Flex
            flexDirection="column"
            ref={containerRef}
            height={containerHeight.current!}
            flexGrow={1}
          >
            <PublishedConfiguratorStateProvider
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
                  visualize.admin.ch
                </Trans>
              ) : undefined
            }
          />
        </ChartErrorBoundary>
      </Box>
    </MetadataPanelStoreContext.Provider>
  );
};

type ChartWithInteractiveFiltersProps = {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
};

const ChartWithInteractiveFilters = React.forwardRef(
  (props: ChartWithInteractiveFiltersProps, ref) => {
    const { dataSet, dataSource, chartConfig } = props;
    const { interactiveFiltersConfig } = chartConfig;
    const setCalculationType = useInteractiveFiltersStore(
      (d) => d.setCalculationType
    );
    const setTimeRange = useInteractiveFiltersStore((d) => d.setTimeRange);
    const timeRange = interactiveFiltersConfig?.timeRange;
    const presetFrom =
      timeRange?.presets.from && parseDate(timeRange.presets.from);
    const presetTo = timeRange?.presets.to && parseDate(timeRange.presets.to);

    // Editor time presets supersede interactive state
    const presetFromStr = presetFrom?.toString();
    const presetToStr = presetTo?.toString();
    useEffect(() => {
      if (presetFrom && presetTo) {
        setTimeRange(presetFrom, presetTo);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setTimeRange, presetFromStr, presetToStr]);

    useEffect(() => {
      if (interactiveFiltersConfig?.calculation.type) {
        setCalculationType(interactiveFiltersConfig?.calculation.type);
      }
    }, [interactiveFiltersConfig?.calculation.type, setCalculationType]);

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
          published
        />
      </Flex>
    );
  }
);
ChartWithInteractiveFilters.displayName = "ChartWithInteractiveFilters";
