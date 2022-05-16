import { Trans } from "@lingui/macro";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { useChartTablePreview } from "@/components/chart-table-preview";
import { DataDownloadMenu, RunSparqlQuery } from "@/components/data-download";
import { ChartConfig } from "@/configurator";
import {
  useDataCubeMetadataWithComponentValuesQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { getChartIcon, Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";

import { useQueryFilters } from "../charts/shared/chart-helpers";

export const ChartFootnotes = ({
  dataSetIri,
  chartConfig,
  configKey,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
  configKey?: string;
}) => {
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
    variables: { iri: dataSetIri, locale },
  });

  // Data for data download
  const filters = useQueryFilters({ chartConfig });
  const [{ data: visibleData }] = useDataCubeObservationsQuery({
    variables: { locale, iri: dataSetIri, dimensions: null, filters },
  });
  const sparqlEditorUrl =
    visibleData?.dataCubeByIri?.observations.sparqlEditorUrl;

  if (data?.dataCubeByIri) {
    const { dataCubeByIri } = data;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography component="div" variant="caption" color="grey.600">
          <Trans id="metadata.dataset">Dataset</Trans>: {dataCubeByIri.title}
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

        <Box
          sx={{
            mt: 2,
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
              backgroundColor: "grey.600",
            },
          }}
        >
          <DataDownloadMenu
            title={dataCubeByIri.title}
            dataSetIri={dataSetIri}
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
                  size={16}
                />
              }
              onClick={() => setIsChartTablePreview(!isChartTablePreview)}
              sx={{ p: 0 }}
            >
              <Typography variant="caption">
                {isChartTablePreview ? (
                  <Trans id="metadata.switch.chart">Switch to chart view</Trans>
                ) : (
                  <Trans id="metadata.switch.table">Switch to table view</Trans>
                )}
              </Typography>
            </Button>
          )}
          {sparqlEditorUrl !== undefined && (
            <RunSparqlQuery url={sparqlEditorUrl as string} />
          )}
          {configKey && shareUrl && (
            <Button
              component="a"
              variant="text"
              color="primary"
              size="small"
              sx={{ p: 0 }}
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography variant="caption">
                <Trans id="metadata.link.created.with.visualize">
                  Created with visualize.admin.ch
                </Trans>
              </Typography>
            </Button>
          )}
        </Box>
      </Box>
    );
  } else {
    return null;
  }
};
