import { Trans } from "@lingui/macro";
import { Box, Button, Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState, useMemo } from "react";

import { useChartTablePreview } from "@/components/chart-table-preview";
import { DataDownloadMenu, RunSparqlQuery } from "@/components/data-download";
import { ChartConfig, DataSource } from "@/configurator";
import { useTimeFormatLocale } from "@/formatters";
import {
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { getChartIcon, Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { makeOpenDataLink } from "@/utils/opendata";

import { useQueryFilters } from "../charts/shared/chart-helpers";

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

        // Separator between flex elements, the trick to have them not displayed
        // for each line leftmost element is to have them negatively positioned
        // cut by the overflow hidden
        "&:before": {
          content: '" "',
          display: "block",
          height: "3px",
          width: "3px ",
          borderRadius: "3px",
          position: "relative",
          left: "calc(-1 * var(--column-gap) / 2)",
          backgroundColor: theme.palette.grey[600],
        },
      },
    },
  })
);

export const ChartFootnotes = ({
  dataSetIri,
  dataSource,
  chartConfig,
  configKey,
  onToggleTableView,
  showDownload,
  showTableSwitch,
  showSparqlQuery,
  visualizeLinkText,
  showLandingPage,
  showSource,
  showDatasetTitle,
  showDatePublished,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  configKey?: string;
  onToggleTableView: () => void;
  showDownload?: boolean;
  showLandingPage?: boolean;
  showTableSwitch?: boolean;
  showSparqlQuery?: boolean;
  showSource?: boolean;
  showDatasetTitle?: boolean;
  showDatePublished?: boolean;
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

  const [{ data }] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  // Data for data download
  const filters = useQueryFilters({ chartConfig });
  const [{ data: visibleData }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      dimensions: null,
      filters,
    },
  });
  const sparqlEditorUrl =
    visibleData?.dataCubeByIri?.observations.sparqlEditorUrl;

  const formatLocale = useTimeFormatLocale();
  const cubeLink = useMemo(() => {
    return makeOpenDataLink(locale, data?.dataCubeByIri);
  }, [locale, data?.dataCubeByIri]);

  if (data?.dataCubeByIri) {
    const { dataCubeByIri } = data;

    return (
      <Box sx={{ mt: 2 }}>
        {showDatasetTitle !== false ? (
          <Typography component="span" variant="caption" color="grey.600">
            <strong>
              <Trans id="dataset.footnotes.dataset">Dataset</Trans>
            </strong>
            <Trans id="typography.colon">: </Trans>
            {cubeLink ? (
              <Link target="_blank" href={cubeLink} rel="noreferrer">
                {dataCubeByIri.title}{" "}
                <Icon
                  name="linkExternal"
                  size="1em"
                  style={{ display: "inline" }}
                />
              </Link>
            ) : (
              dataCubeByIri.title
            )}
          </Typography>
        ) : null}

        {dataCubeByIri.dateModified && showDatePublished !== false ? (
          <Typography component="span" variant="caption" color="grey.600">
            ,&nbsp;
            <strong>
              <Trans id="dataset.footnotes.updated">Latest update</Trans>
            </strong>
            <Trans id="typography.colon">: </Trans>
            {formatLocale.format("%d.%m.%Y %H:%M")(
              new Date(dataCubeByIri.dateModified)
            )}
          </Typography>
        ) : null}

        {showSource !== false ? (
          <Typography component="div" variant="caption" color="grey.600">
            <strong>
              <Trans id="metadata.source">Source</Trans>
            </strong>
            <Trans id="typography.colon">: </Trans>
            {dataCubeByIri.publisher && (
              <Box
                component="span"
                sx={{ "> a": { color: "grey.600" } }}
                dangerouslySetInnerHTML={{ __html: dataCubeByIri.publisher }}
              ></Box>
            )}
          </Typography>
        ) : null}

        <Box className={classes.actions}>
          {showDownload !== false ? (
            <DataDownloadMenu
              dataSetIri={dataSetIri}
              dataSource={dataSource}
              title={dataCubeByIri.title}
              filters={filters}
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
          {dataCubeByIri.landingPage && showLandingPage !== false && (
            <Button
              variant="text"
              component="a"
              href={dataCubeByIri.landingPage}
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
            <RunSparqlQuery url={sparqlEditorUrl as string} />
          )}
          {configKey && shareUrl && (
            <Button
              component="a"
              variant="text"
              color="primary"
              size="small"
              sx={{ p: 0, typography: "caption" }}
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {visualizeLinkText ?? (
                <Trans id="metadata.link.created.with.visualize">
                  Created with visualize.admin.ch
                </Trans>
              )}
            </Button>
          )}
        </Box>
      </Box>
    );
  } else {
    return null;
  }
};
