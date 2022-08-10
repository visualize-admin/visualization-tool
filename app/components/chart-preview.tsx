import { Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import Head from "next/head";
import * as React from "react";

import { ChartDataFilters } from "@/charts/shared/chart-data-filters";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { InteractiveFiltersProvider } from "@/charts/shared/use-interactive-filters";
import useSyncInteractiveFilters from "@/charts/shared/use-sync-interactive-filters";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFiltersList } from "@/components/chart-filters-list";
import { ChartFootnotes } from "@/components/chart-footnotes";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import GenericChart from "@/components/common-chart";
import DebugPanel from "@/components/debug-panel";
import Flex from "@/components/flex";
import { HintYellow } from "@/components/hint";
import { ChartConfig, useConfiguratorState } from "@/configurator";
import { DataSetTable } from "@/configurator/components/datatable";
import { useDataCubeMetadataQuery } from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { DataSource } from "@/graphql/resolvers/utils";
import { useResizeObserver } from "@/lib/use-resize-observer";
import { useLocale } from "@/locales/use-locale";

export const ChartPreview = ({
  dataSetIri,
  dataSource,
}: {
  dataSetIri: string;
  dataSource: DataSource;
}) => {
  return (
    <ChartTablePreviewProvider>
      <ChartPreviewInner dataSetIri={dataSetIri} dataSource={dataSource} />
    </ChartTablePreviewProvider>
  );
};

export const ChartPreviewInner = ({
  dataSetIri,
  dataSource,
}: {
  dataSetIri: string;
  dataSource: DataSource;
}) => {
  const [state] = useConfiguratorState();
  const locale = useLocale();

  const [{ data: metaData }] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
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

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        color: "grey.800",
        p: 5,
        width: "100%",
      }}
    >
      <ChartErrorBoundary resetKeys={[state]}>
        {metaData?.dataCubeByIri?.publicationStatus ===
          DataCubePublicationStatus.Draft && (
          <Box sx={{ mb: 4 }}>
            <HintYellow iconName="datasetError" iconSize={64}>
              <Trans id="dataset.publicationStatus.draft.warning">
                Careful, this dataset is only a draft.
                <br />
                <strong>Don&apos;t use for reporting!</strong>
              </Trans>
            </HintYellow>
          </Box>
        )}
        {(state.state === "CONFIGURING_CHART" ||
          state.state === "DESCRIBING_CHART" ||
          state.state === "PUBLISHING") && (
          <>
            <>
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  color: state.meta.title[locale] === "" ? "grey.500" : "text",
                }}
              >
                {state.meta.title[locale] === "" ? (
                  <Trans id="annotation.add.title">[ Title ]</Trans>
                ) : (
                  state.meta.title[locale]
                )}
              </Typography>
              <Head>
                <title key="title">
                  {state.meta.title[locale] === ""
                    ? metaData?.dataCubeByIri?.title
                    : state.meta.title[locale]}{" "}
                  - visualize.admin.ch
                </title>
              </Head>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  color:
                    state.meta.description[locale] === "" ? "grey.500" : "text",
                }}
              >
                {state.meta.description[locale] === "" ? (
                  <Trans id="annotation.add.description">[ Description ]</Trans>
                ) : (
                  state.meta.description[locale]
                )}
              </Typography>
            </>
            <InteractiveFiltersProvider>
              {isTablePreview ? (
                <DataSetTable
                  sx={{
                    height: height || lastHeight.current,
                    width: "100%",
                  }}
                  dataSetIri={dataSetIri}
                  dataSource={dataSource}
                  chartConfig={state.chartConfig}
                />
              ) : (
                <ChartWithInteractiveFilters
                  ref={chartRef}
                  dataSet={dataSetIri}
                  dataSource={dataSource}
                  chartConfig={state.chartConfig}
                />
              )}
              {state.chartConfig && (
                <ChartFootnotes
                  dataSetIri={dataSetIri}
                  dataSource={dataSource}
                  chartConfig={state.chartConfig}
                />
              )}
              <DebugPanel configurator={true} interactiveFilters={true} />
            </InteractiveFiltersProvider>
          </>
        )}
      </ChartErrorBoundary>
    </Flex>
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
    useSyncInteractiveFilters(chartConfig);

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
        {chartConfig.interactiveFiltersConfig?.dataFilters.active ? (
          <ChartDataFilters
            dataSet={dataSet}
            dataSource={dataSource}
            dataFiltersConfig={chartConfig.interactiveFiltersConfig.dataFilters}
            chartConfig={chartConfig}
          />
        ) : (
          <Flex sx={{ flexDirection: "column", my: 4 }}>
            <ChartFiltersList
              dataSetIri={dataSet}
              dataSource={dataSource}
              chartConfig={chartConfig}
            />
          </Flex>
        )}
        <Chart
          dataSet={dataSet}
          dataSource={dataSource}
          chartConfig={chartConfig}
        />
      </Flex>
    );
  }
);

const Chart = ({
  dataSet,
  dataSource,
  chartConfig,
}: {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
}) => {
  // Combine filters from config + interactive filters
  const queryFilters = useQueryFilters({
    chartConfig,
  });

  const props = {
    dataSet,
    dataSource,
    chartConfig: chartConfig,
    queryFilters: queryFilters,
  };

  return <GenericChart {...props} />;
};
