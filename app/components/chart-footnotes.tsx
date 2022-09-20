import { Trans } from "@lingui/macro";
import { Box, Button, Link, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState, useMemo } from "react";

import { useChartTablePreview } from "@/components/chart-table-preview";
import { DataDownloadMenu, RunSparqlQuery } from "@/components/data-download";
import { ChartConfig, DataSource } from "@/configurator";
import {
  useDataCubeMetadataWithComponentValuesQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { getChartIcon, Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { makeOpenDataLink } from "@/utils/opendata";

import { useQueryFilters } from "../charts/shared/chart-helpers";

const useStyles = makeStyles((theme: Theme) => ({
  actions: {
    marginTop: theme.spacing(2),
    "--column-gap": "16px",
    columnGap: "var(--column-gap)",
    rowGap: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    overflow: "hidden",

    // Separator between flex elements, the trick to have them not displayed
    // for each line leftmost element is to have them negatively positioned
    // cut by the overflow hidden
    "& > *:before": {
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
}));

export const ChartFootnotes = ({
  dataSetIri,
  dataSource,
  chartConfig,
  configKey,
  onToggleTableView,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  configKey?: string;
  onToggleTableView: () => void;
}) => {
  const classes = useStyles();
  const locale = useLocale();
  const [shareUrl, setShareUrl] = useState("");
  const [isChartTablePreview, setIsChartTablePreview] = useChartTablePreview();
  // Reset back to chart view when switching chart type.
  useEffect(() => {
    setIsChartTablePreview(false);
  }, [setIsChartTablePreview, chartConfig.chartType]);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
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

  const cubeLink = useMemo(() => {
    return makeOpenDataLink(locale, data?.dataCubeByIri);
  }, [locale, data?.dataCubeByIri]);

  if (data?.dataCubeByIri) {
    const { dataCubeByIri } = data;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography component="div" variant="caption" color="grey.600">
          <Trans id="metadata.dataset">Dataset</Trans>:{" "}
          {cubeLink ? (
            <Link target="_blank" href={cubeLink} rel="noreferrer">
              {dataCubeByIri.title}{" "}
              <Icon
                name="linkExternal"
                size={12}
                style={{ display: "inline" }}
              />
            </Link>
          ) : (
            dataCubeByIri.title
          )}
        </Typography>

        <Typography component="div" variant="caption" color="grey.600">
          <Trans id="metadata.source">Source</Trans>:{" "}
          {dataCubeByIri.publisher && (
            <Box
              component="span"
              sx={{ "> a": { color: "grey.600" } }}
              dangerouslySetInnerHTML={{ __html: dataCubeByIri.publisher }}
            ></Box>
          )}
        </Typography>

        <Box className={classes.actions}>
          <DataDownloadMenu
            dataSetIri={dataSetIri}
            dataSource={dataSource}
            title={dataCubeByIri.title}
            filters={filters}
          />
          {chartConfig.chartType !== "table" && (
            <Button
              component="a"
              color="primary"
              variant="text"
              size="small"
              startIcon={
                <Icon
                  name={
                    isChartTablePreview
                      ? getChartIcon(chartConfig.chartType)
                      : "table"
                  }
                />
              }
              onClick={onToggleTableView}
              sx={{ p: 0, typography: "caption" }}
            >
              {isChartTablePreview ? (
                <Trans id="metadata.switch.chart">Switch to chart view</Trans>
              ) : (
                <Trans id="metadata.switch.table">Switch to table view</Trans>
              )}
            </Button>
          )}
          {dataCubeByIri.landingPage && (
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
          {sparqlEditorUrl && (
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
              <Trans id="metadata.link.created.with.visualize">
                Created with visualize.admin.ch
              </Trans>
            </Button>
          )}
        </Box>
      </Box>
    );
  } else {
    return null;
  }
};
