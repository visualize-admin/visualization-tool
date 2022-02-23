import { Trans } from "@lingui/macro";
import Head from "next/head";
import * as React from "react";
import { Box, Flex, Text } from "theme-ui";
import { ChartDataFilters } from "../charts/shared/chart-data-filters";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartErrorWrapper } from "../charts/shared/errors";
import { InteractiveFiltersProvider } from "../charts/shared/use-interactive-filters";
import useSyncInteractiveFilters from "../charts/shared/use-sync-interactive-filters";
import { ChartConfig, useConfiguratorState } from "../configurator";
import { useDataCubeMetadataQuery } from "../graphql/query-hooks";
import { DataCubePublicationStatus } from "../graphql/resolver-types";
import { useLocale } from "../locales/use-locale";
import { ChartErrorBoundary } from "./chart-error-boundary";
import { ChartFiltersList } from "./chart-filters-list";
import { ChartFootnotes } from "./chart-footnotes";
import GenericChart from "./common-chart";
import DebugPanel from "./debug-panel";
import { HintRed } from "./hint";

export const ChartPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const [state] = useConfiguratorState();
  const locale = useLocale();
  const [{ data: metaData }] = useDataCubeMetadataQuery({
    variables: { iri: dataSetIri, locale },
  });
  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        color: "monochrome800",
        p: 5,
      }}
    >
      <ChartErrorBoundary resetKeys={[state]}>
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
        {(state.state === "SELECTING_CHART_TYPE" ||
          state.state === "CONFIGURING_CHART" ||
          state.state === "DESCRIBING_CHART" ||
          state.state === "PUBLISHING") && (
          <>
            <>
              <Text
                variant="heading2"
                sx={{
                  mb: 2,
                  color:
                    state.meta.title[locale] === "" ? "monochrome500" : "text",
                }}
              >
                {state.meta.title[locale] === "" ? (
                  <Trans id="annotation.add.title">[ Title ]</Trans>
                ) : (
                  state.meta.title[locale]
                )}
              </Text>
              <Head>
                <title key="title">
                  {state.meta.title[locale] === ""
                    ? metaData?.dataCubeByIri?.title
                    : state.meta.title[locale]}{" "}
                  - visualize.admin.ch
                </title>
              </Head>
              <Text
                variant="paragraph1"
                sx={{
                  mb: 2,
                  color:
                    state.meta.description[locale] === ""
                      ? "monochrome500"
                      : "text",
                }}
              >
                {state.meta.description[locale] === "" ? (
                  <Trans id="annotation.add.description">[ Description ]</Trans>
                ) : (
                  state.meta.description[locale]
                )}
              </Text>
            </>
            <InteractiveFiltersProvider>
              <ChartWithInteractiveFilters
                dataSet={state.dataSet}
                chartConfig={state.chartConfig}
              />
              {state.chartConfig && (
                <ChartFootnotes
                  dataSetIri={dataSetIri}
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

const ChartWithInteractiveFilters = ({
  dataSet,
  chartConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  useSyncInteractiveFilters(chartConfig);

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
      }}
    >
      {/* Filters list & Interactive filters */}
      {chartConfig.interactiveFiltersConfig ? (
        <ChartDataFilters
          dataSet={dataSet}
          dataFiltersConfig={chartConfig.interactiveFiltersConfig.dataFilters}
          chartConfig={chartConfig}
        />
      ) : (
        <Flex sx={{ flexDirection: "column", my: 4 }}>
          <ChartFiltersList dataSetIri={dataSet} chartConfig={chartConfig} />
        </Flex>
      )}
      <Chart dataSet={dataSet} chartConfig={chartConfig} />
    </Flex>
  );
};

const Chart = ({
  dataSet,
  chartConfig,
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  // Combine filters from config + interactive filters
  const queryFilters = useQueryFilters({
    chartConfig,
  });

  const props = {
    dataSet,
    chartConfig: chartConfig,
    queryFilters: queryFilters,
  };

  return (
    <ChartErrorWrapper>
      <GenericChart {...props} />
    </ChartErrorWrapper>
  );
};
