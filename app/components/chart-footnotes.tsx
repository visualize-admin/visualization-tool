import { Trans } from "@lingui/macro";
import { Box, Button, Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { PropsWithChildren, useEffect, useState } from "react";

import {
  extractChartConfigComponentIris,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { ChartFiltersList } from "@/components/chart-filters-list";
import { useChartTablePreview } from "@/components/chart-table-preview";
import { DataDownloadMenu, RunSparqlQuery } from "@/components/data-download";
import { ChartConfig, DataSource } from "@/configurator";
import { Dimension, Measure } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import {
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";
import { Icon, getChartIcon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { useEmbedOptions } from "@/utils/embed";
import { makeOpenDataLink } from "@/utils/opendata";

export const useFootnotesStyles = makeStyles<Theme, { useMarginTop: boolean }>(
  (theme) => ({
    actions: {
      marginTop: ({ useMarginTop }) => (useMarginTop ? theme.spacing(2) : 0),
      "--column-gap": "16px",
      columnGap: "var(--column-gap)",
      rowGap: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      overflow: "hidden",

      "& > button": {
        minWidth: "auto",
      },
    },
  })
);

export const ChartFootnotes = ({
  dataSource,
  chartConfig,
  dimensions,
  measures,
  configKey,
  onToggleTableView,
  visualizeLinkText,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
  measures?: Measure[];
  configKey?: string;
  onToggleTableView: () => void;
  visualizeLinkText?: JSX.Element;
}) => {
  const classes = useFootnotesStyles({ useMarginTop: true });
  const locale = useLocale();
  const [shareUrl, setShareUrl] = useState("");
  const { state: isTablePreview, setStateRaw: setIsTablePreview } =
    useChartTablePreview();
  // Reset back to chart view when switching chart type.
  useEffect(() => {
    setIsTablePreview(false);
  }, [setIsTablePreview, chartConfig.chartType]);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);

  const filters = useQueryFilters({
    chartConfig,
    dimensions,
    measures,
    componentIris: extractChartConfigComponentIris(chartConfig),
  });
  const commonQueryVariables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
  };
  const [{ data }] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const [{ data: downloadData }] = useDataCubesObservationsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: filters ?? [],
    },
    pause: !filters,
  });
  const sparqlEditorUrls =
    downloadData?.dataCubesObservations?.sparqlEditorUrls;
  const formatLocale = useTimeFormatLocale();
  const [
    {
      showDownload,
      showLandingPage,
      showTableSwitch,
      showSparqlQuery,
      showDatePublished,
      showSource,
      showDatasetTitle,
    },
  ] = useEmbedOptions();

  return (
    <div>
      <ChartFiltersList
        dataSource={dataSource}
        chartConfig={chartConfig}
        dimensions={dimensions}
        measures={measures}
      />
      {data?.dataCubesMetadata
        ? data.dataCubesMetadata.map((dataCubeMetadata) => {
            const cubeLink = makeOpenDataLink(locale, dataCubeMetadata);
            const sparqlEditorUrl = sparqlEditorUrls?.find(
              (d) => d.cubeIri === dataCubeMetadata.iri
            )?.url;

            return (
              <Box key={dataCubeMetadata.iri} sx={{ mt: 2 }}>
                {showDatasetTitle !== false ? (
                  <Typography
                    component="span"
                    variant="caption"
                    color="grey.600"
                  >
                    <strong>
                      <Trans id="dataset.footnotes.dataset">Dataset</Trans>
                    </strong>
                    <Trans id="typography.colon">: </Trans>
                    {cubeLink ? (
                      <Link target="_blank" href={cubeLink} rel="noreferrer">
                        {dataCubeMetadata.title}{" "}
                        <Icon
                          name="linkExternal"
                          size="1em"
                          style={{ display: "inline" }}
                        />
                      </Link>
                    ) : (
                      dataCubeMetadata.title
                    )}
                  </Typography>
                ) : null}

                {dataCubeMetadata.dateModified &&
                showDatePublished !== false ? (
                  <Typography
                    component="span"
                    variant="caption"
                    color="grey.600"
                  >
                    ,&nbsp;
                    <strong>
                      <Trans id="dataset.footnotes.updated">
                        Latest update
                      </Trans>
                    </strong>
                    <Trans id="typography.colon">: </Trans>
                    {formatLocale.format("%d.%m.%Y %H:%M")(
                      new Date(dataCubeMetadata.dateModified)
                    )}
                  </Typography>
                ) : null}

                {showSource !== false ? (
                  <Typography
                    component="div"
                    variant="caption"
                    color="grey.600"
                  >
                    <strong>
                      <Trans id="metadata.source">Source</Trans>
                    </strong>
                    <Trans id="typography.colon">: </Trans>
                    {dataCubeMetadata.publisher && (
                      <Box
                        component="span"
                        sx={{ "> a": { color: "grey.600" } }}
                        dangerouslySetInnerHTML={{
                          __html: dataCubeMetadata.publisher,
                        }}
                      />
                    )}
                    {configKey && shareUrl && visualizeLinkText && (
                      <>
                        {" "}
                        /{" "}
                        <LinkButton href={shareUrl}>
                          {" "}
                          {visualizeLinkText}
                        </LinkButton>
                      </>
                    )}
                  </Typography>
                ) : null}

                <Box className={classes.actions}>
                  {showDownload !== false ? (
                    <DataDownloadMenu
                      dataSource={dataSource}
                      title={dataCubeMetadata.title}
                      filters={getDataDownloadFilters(chartConfig, filters)}
                    />
                  ) : null}
                  {showTableSwitch !== false ? (
                    <>
                      {chartConfig.chartType !== "table" && (
                        <Button
                          component="a"
                          color="primary"
                          variant="text"
                          size="small"
                          startIcon={
                            <Icon
                              name={
                                isTablePreview
                                  ? getChartIcon(chartConfig.chartType)
                                  : "table"
                              }
                            />
                          }
                          onClick={onToggleTableView}
                          sx={{ p: 0, typography: "caption" }}
                        >
                          {isTablePreview ? (
                            <Trans id="metadata.switch.chart">
                              Switch to chart view
                            </Trans>
                          ) : (
                            <Trans id="metadata.switch.table">
                              Switch to table view
                            </Trans>
                          )}
                        </Button>
                      )}
                    </>
                  ) : null}
                  {dataCubeMetadata.landingPage &&
                    showLandingPage !== false && (
                      <Button
                        variant="text"
                        component="a"
                        href={dataCubeMetadata.landingPage}
                        target="_blank"
                        color="primary"
                        size="small"
                        sx={{ p: 0, typography: "caption" }}
                        startIcon={<Icon name="linkExternal" />}
                      >
                        <Trans id="dataset.metadata.learnmore">
                          Learn more about the dataset
                        </Trans>
                      </Button>
                    )}
                  {sparqlEditorUrl && showSparqlQuery !== false && (
                    <RunSparqlQuery
                      key={sparqlEditorUrl}
                      url={sparqlEditorUrl}
                    />
                  )}
                  {configKey && shareUrl && !visualizeLinkText && (
                    <LinkButton href={shareUrl}>
                      <Trans id="metadata.link.created.with.visualize">
                        Created with visualize.admin.ch
                      </Trans>
                    </LinkButton>
                  )}
                </Box>
              </Box>
            );
          })
        : null}
    </div>
  );
};

const LinkButton = (props: PropsWithChildren<{ href: string }>) => {
  return (
    <Button
      component="a"
      variant="text"
      color="primary"
      size="small"
      sx={{ p: 0, typography: "caption", verticalAlign: "unset" }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
};

const getDataDownloadFilters = (
  chartConfig: ChartConfig,
  queryFilters?: DataCubeObservationFilter[]
) => {
  return queryFilters ?? chartConfig.cubes.map((cube) => ({ iri: cube.iri }));
};
