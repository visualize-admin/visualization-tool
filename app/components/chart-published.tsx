import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import * as React from "react";
import { useEffect, useMemo } from "react";

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
import { useIsTrustedDataSource } from "@/components/data-source-menu";
import Flex from "@/components/flex";
import { HintBlue, HintRed } from "@/components/hint";
import {
  ChartConfig,
  ConfiguratorStatePublishing,
  DataSource,
  Meta,
  PublishedConfiguratorStateProvider,
} from "@/configurator";
import { DataSetTable } from "@/configurator/components/datatable";
import { parseDate } from "@/configurator/components/ui-helpers";
import { useDataCubeMetadataQuery } from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useResizeObserver } from "@/lib/use-resize-observer";
import { useLocale } from "@/locales/use-locale";
import { DEFAULT_DATA_SOURCE } from "@/rdf/sparql-client";

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
  const locale = useLocale();
  const isTrustedDataSource = useIsTrustedDataSource(dataSource);

  const [{ data: metaData }] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [isTablePreview] = useChartTablePreview();

  const [chartRef, _, height] = useResizeObserver<HTMLDivElement>();
  const lastHeight = React.useRef(height);

  React.useEffect(() => {
    if (height !== 0) {
      lastHeight.current = height;
    }
  }, [height]);

  const publishedConfiguratorState = useMemo(() => {
    return {
      state: "PUBLISHING",
      dataSource,
      chartConfig: chartConfig,
    } as ConfiguratorStatePublishing;
  }, [chartConfig, dataSource]);

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        p: 5,
        color: "grey.800",
        overflowX: "auto",
      }}
    >
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
            <HintBlue iconName="hintWarning">
              <Trans id="data.source.notTrusted">
                This chart is not using a trusted data source.
              </Trans>
            </HintBlue>
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
        {meta.title[locale] !== "" && (
          <Typography component="div" variant="h2" mb={2}>
            {meta.title[locale]}
          </Typography>
        )}
        {meta.description[locale] && (
          <Typography component="div" variant="body1" mb={2}>
            {meta.description[locale]}
          </Typography>
        )}
        <InteractiveFiltersProvider>
          <Box height={height || lastHeight.current}>
            <PublishedConfiguratorStateProvider
              chartId={configKey}
              initialState={publishedConfiguratorState}
            >
              {isTablePreview ? (
                <DataSetTable
                  dataSetIri={dataSet}
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                />
              ) : (
                <ChartWithInteractiveFilters
                  ref={chartRef}
                  dataSet={dataSet}
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                />
              )}
            </PublishedConfiguratorStateProvider>
          </Box>
          {chartConfig && (
            <ChartFootnotes
              dataSetIri={dataSet}
              dataSource={dataSource}
              chartConfig={chartConfig}
              configKey={configKey}
            />
          )}
        </InteractiveFiltersProvider>
      </ChartErrorBoundary>
    </Box>
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
      interactiveFiltersConfig?.time.presets.from &&
      parseDate(interactiveFiltersConfig?.time.presets.from.toString());
    const presetTo =
      interactiveFiltersConfig?.time.presets.to &&
      parseDate(interactiveFiltersConfig?.time.presets.to.toString());

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
        dispatch({ type: "ADD_TIME_FILTER", value: [presetFrom, presetTo] });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, presetFromStr, presetToStr]);

    return (
      <Flex
        ref={ref}
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
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
