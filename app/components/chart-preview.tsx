import { Trans } from "@lingui/macro";
import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Head from "next/head";
import { useMemo } from "react";

import { DataSetTable } from "@/browse/datatable";
import { extractChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { ChartFootnotes } from "@/components/chart-footnotes";
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
  DataSource,
  getChartConfig,
  useConfiguratorState,
} from "@/configurator";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
} from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

type ChartPreviewProps = {
  dataSetIri: string;
  dataSource: DataSource;
};

export const ChartPreview = (props: ChartPreviewProps) => {
  const { dataSetIri, dataSource } = props;

  return (
    <ChartTablePreviewProvider>
      <ChartPreviewInner dataSetIri={dataSetIri} dataSource={dataSource} />
    </ChartTablePreviewProvider>
  );
};

const useStyles = makeStyles<Theme>({
  title: {
    marginBottom: 2,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  description: {
    marginBottom: 2,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
});

export const ChartPreviewInner = (props: ChartPreviewProps) => {
  const { dataSetIri, dataSource } = props;
  const [state, dispatch] = useConfiguratorState();
  const chartConfig = getChartConfig(state);
  const locale = useLocale();
  const classes = useStyles();
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data: metadata }] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      filters: [{ iri: dataSetIri }],
    },
  });
  const componentIris = extractChartConfigComponentIris(chartConfig);
  const [{ data: components }] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      // FIXME: make a distinction per cube
      filters: [{ iri: dataSetIri, componentIris }],
    },
  });
  const {
    state: isTablePreview,
    setState: setIsTablePreview,
    containerRef,
    containerHeight,
  } = useChartTablePreview();

  const handleToggleTableView = useEvent(() => setIsTablePreview((c) => !c));

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
        p: 5,
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
        {(state.state === "CONFIGURING_CHART" ||
          state.state === "PUBLISHING") && (
          <>
            <>
              <Flex
                sx={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    color:
                      chartConfig.meta.title[locale] === ""
                        ? "grey.500"
                        : "text",
                  }}
                  className={classes.title}
                  onClick={() =>
                    dispatch({
                      type: "ACTIVE_FIELD_CHANGED",
                      value: "title",
                    })
                  }
                >
                  {chartConfig.meta.title[locale] === "" ? (
                    <Trans id="annotation.add.title">[ Title ]</Trans>
                  ) : (
                    chartConfig.meta.title[locale]
                  )}
                </Typography>

                <MetadataPanel
                  datasetIri={dataSetIri}
                  dataSource={dataSource}
                  dimensions={allComponents}
                  top={96}
                />
              </Flex>
              <Head>
                <title key="title">
                  {chartConfig.meta.title[locale] === ""
                    ? // FIXME: adapt to design
                      metadata?.dataCubesMetadata.map((d) => d.title).join(", ")
                    : chartConfig.meta.title[locale]}{" "}
                  - visualize.admin.ch
                </title>
              </Head>
              <Typography
                variant="body1"
                className={classes.description}
                sx={{
                  color:
                    chartConfig.meta.description[locale] === ""
                      ? "grey.500"
                      : "text",
                }}
                onClick={() =>
                  dispatch({
                    type: "ACTIVE_FIELD_CHANGED",
                    value: "description",
                  })
                }
              >
                {chartConfig.meta.description[locale] === "" ? (
                  <Trans id="annotation.add.description">[ Description ]</Trans>
                ) : (
                  chartConfig.meta.description[locale]
                )}
              </Typography>
            </>
            <Box ref={containerRef} height={containerHeight.current!}>
              {isTablePreview ? (
                <DataSetTable
                  sx={{
                    width: "100%",
                    maxHeight: "100%",
                  }}
                  dataSetIri={dataSetIri}
                  dataSource={dataSource}
                  chartConfig={chartConfig}
                />
              ) : (
                <ChartWithFilters
                  dataSet={dataSetIri}
                  dataSource={dataSource}
                  componentIris={componentIris}
                  chartConfig={chartConfig}
                />
              )}
            </Box>
            {chartConfig && (
              <ChartFootnotes
                dataSetIri={dataSetIri}
                dataSource={dataSource}
                chartConfig={chartConfig}
                onToggleTableView={handleToggleTableView}
              />
            )}
            <DebugPanel configurator interactiveFilters />
          </>
        )}
      </ChartErrorBoundary>
    </Flex>
  );
};
