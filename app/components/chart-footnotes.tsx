import { useChartTablePreview } from "@/components/chart-table-preview";
import { DataDownloadMenu, RunSparqlQuery } from "@/components/data-download";
import { ChartConfig } from "@/configurator";
import {
  useDataCubeMetadataWithComponentValuesQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { getChartIcon, Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { Trans } from "@lingui/macro";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
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
  const [{ data: allData }] = useDataCubeObservationsQuery({
    variables: { locale, iri: dataSetIri, dimensions: null, filters: null },
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

        <Stack direction="row" spacing={0} sx={{ mt: 2, alignItems: "center" }}>
          <DataDownloadMenu
            title={dataCubeByIri.title}
            allData={allData}
            visibleData={visibleData}
          />
          {chartConfig.chartType !== "table" && (
            <>
              <Box sx={{ display: "inline", mx: 2 }}>·</Box>
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
                sx={{ padding: 0, fontWeight: "regular" }}
              >
                <Typography variant="caption">
                  {isChartTablePreview ? (
                    <Trans id="metadata.switch.chart">
                      Switch to chart view
                    </Trans>
                  ) : (
                    <Trans id="metadata.switch.table">
                      Switch to table view
                    </Trans>
                  )}
                </Typography>
              </Button>
            </>
          )}
          {sparqlEditorUrl !== undefined && (
            <>
              <Box sx={{ display: "inline", mx: 2 }}>·</Box>
              <RunSparqlQuery url={sparqlEditorUrl as string} />
            </>
          )}
          {configKey && shareUrl && (
            <>
              <Box sx={{ display: "inline", mx: 2 }}>·</Box>
              <Button
                component="a"
                variant="text"
                color="primary"
                size="small"
                sx={{ fontWeight: "regular", padding: 0 }}
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
            </>
          )}
        </Stack>
      </Box>
    );
  } else {
    return null;
  }
};
