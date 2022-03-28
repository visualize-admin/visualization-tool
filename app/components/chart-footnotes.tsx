import { Trans } from "@lingui/macro";
import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ChartConfig } from "../configurator";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { getChartIcon, Icon } from "../icons";
import { useLocale } from "../locales/use-locale";
import { useChartTablePreview } from "./chart-table-preview";
import { AllAndVisibleDataDownloadMenu } from "./data-download";

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
          <AllAndVisibleDataDownloadMenu
            title={dataCubeByIri.title}
            dataSetIri={dataSetIri}
            chartConfig={chartConfig}
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
                <Typography variant="body2">
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
          {configKey && shareUrl && (
            <>
              <Box sx={{ display: "inline", mx: 2 }}>·</Box>
              <Link
                sx={{ typography: "body2" }}
                color="primary"
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Trans id="metadata.link.created.with.visualize">
                  Created with visualize.admin.ch
                </Trans>
              </Link>
            </>
          )}
        </Stack>
      </Box>
    );
  } else {
    return null;
  }
};
