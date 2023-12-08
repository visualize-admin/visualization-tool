import { Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import Head from "next/head";
import React, { useMemo } from "react";

import { DataSetTable } from "@/browse/datatable";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
import { ChartPanelLayout, ChartWrapper } from "@/components/chart-panel";
import {
  ChartTablePreviewProvider,
  useChartTablePreview,
} from "@/components/chart-table-preview";
import { ChartWithFilters } from "@/components/chart-with-filters";
import DebugPanel from "@/components/debug-panel";
import Flex from "@/components/flex";
import { HintYellow } from "@/components/hint";
import { MetadataPanel } from "@/components/metadata-panel";
import {
  ChartConfig,
  DataSource,
  getChartConfig,
  hasChartConfigs,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { Description, Title } from "@/configurator/components/annotators";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
} from "@/graphql/hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

type ChartPreviewProps = {
  dataSource: DataSource;
};

export const ChartPreview = (props: ChartPreviewProps) => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const editing = isConfiguring(state);
  const renderChart = React.useCallback(
    (chartConfig: ChartConfig) => (
      <ChartPreviewInner {...props} chartKey={chartConfig.key} />
    ),
    [props]
  );

  return (
    <ChartTablePreviewProvider>
      {state.layout.type === "dashboard" && !editing ? (
        <ChartPanelLayout
          chartConfigs={state.chartConfigs}
          renderChart={renderChart}
        />
      ) : (
        <ChartWrapper editing={editing} layout={state.layout}>
          <ChartPreviewInner {...props} />
        </ChartWrapper>
      )}
    </ChartTablePreviewProvider>
  );
};

type ChartPreviewInnerProps = ChartPreviewProps & {
  chartKey?: string;
};

export const ChartPreviewInner = (props: ChartPreviewInnerProps) => {
  const { dataSource, chartKey } = props;
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state, chartKey);
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data: metadata }] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const componentIris = undefined;
  const [{ data: components }] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        componentIris,
        filters: cube.filters,
        joinBy: cube.joinBy,
      })),
    },
  });
  const {
    state: isTablePreview,
    setState: setIsTablePreview,
    containerRef,
    containerHeight,
  } = useChartTablePreview();

  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));
  const dimensions = components?.dataCubesComponents.dimensions;
  const measures = components?.dataCubesComponents.measures;
  const allComponents = useMemo(() => {
    if (!components?.dataCubesComponents) {
      return [];
    }

    return [
      ...components.dataCubesComponents.dimensions,
      ...components.dataCubesComponents.measures,
    ];
  }, [components?.dataCubesComponents]);

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        color: "grey.800",
        p: 6,
        width: "100%",
      }}
    >
      <ChartErrorBoundary resetKeys={[state]}>
        {/* FIXME: adapt to design */}
        {metadata?.dataCubesMetadata.some(
          (d) => d.publicationStatus === DataCubePublicationStatus.Draft
        ) && (
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
        {hasChartConfigs(state) && (
          <>
            <>
              <Flex
                sx={{
                  justifyContent:
                    state.state === "CONFIGURING_CHART" ||
                    chartConfig.meta.title[locale]
                      ? "space-between"
                      : "flex-end",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                {(state.state === "CONFIGURING_CHART" ||
                  chartConfig.meta.title[locale]) && (
                  <Title
                    text={chartConfig.meta.title[locale]}
                    lighterColor
                    onClick={
                      state.state === "CONFIGURING_CHART"
                        ? () =>
                            dispatch({
                              type: "CHART_ACTIVE_FIELD_CHANGED",
                              value: "title",
                            })
                        : undefined
                    }
                  />
                )}
                <MetadataPanel
                  // FIXME: adapt to design
                  datasetIri={chartConfig.cubes[0].iri}
                  dataSource={dataSource}
                  dimensions={allComponents}
                  top={96}
                />
              </Flex>
              <Head>
                <title key="title">
                  {!chartConfig.meta.title[locale]
                    ? // FIXME: adapt to design
                      metadata?.dataCubesMetadata.map((d) => d.title).join(", ")
                    : chartConfig.meta.title[locale]}{" "}
                  - visualize.admin.ch
                </title>
              </Head>
              {(state.state === "CONFIGURING_CHART" ||
                chartConfig.meta.description[locale]) && (
                <Description
                  text={chartConfig.meta.description[locale]}
                  lighterColor
                  onClick={
                    state.state === "CONFIGURING_CHART"
                      ? () => {
                          dispatch({
                            type: "CHART_ACTIVE_FIELD_CHANGED",
                            value: "description",
                          });
                        }
                      : undefined
                  }
                />
              )}
            </>
            <Box ref={containerRef} height={containerHeight.current!} mt={4}>
              {isTablePreview ? (
                <DataSetTable
                  sx={{
                    width: "100%",
                    maxHeight: "100%",
                  }}
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                />
              ) : (
                <ChartWithFilters
                  dataSource={dataSource}
                  componentIris={componentIris}
                  chartConfig={chartConfig}
                  dimensions={dimensions}
                  measures={measures}
                />
              )}
            </Box>
            {chartConfig && (
              <ChartFootnotes
                dataSource={dataSource}
                chartConfig={chartConfig}
                onToggleTableView={handleToggleTableView}
                dimensions={dimensions}
                measures={measures}
              />
            )}
            <DebugPanel configurator interactiveFilters />
          </>
        )}
      </ChartErrorBoundary>
    </Flex>
  );
};
