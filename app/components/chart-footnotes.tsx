import { Trans } from "@lingui/macro";
import { useEffect, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import { ChartConfig } from "../configurator";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";
import { DataDownload } from "./data-download";
import Stack from "./Stack";

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
        <Typography component="div" variant="meta" color="monochrome600">
          <Trans id="metadata.dataset">Dataset</Trans>: {dataCubeByIri.title}
        </Typography>

        <Typography component="div" variant="meta" color="monochrome600">
          <Trans id="metadata.source">Source</Trans>:{" "}
          {dataCubeByIri.publisher && (
            <Box
              component="span"
              sx={{ "> a": { color: "monochrome600" } }}
              dangerouslySetInnerHTML={{ __html: dataCubeByIri.publisher }}
            ></Box>
          )}
        </Typography>

        <Stack direction="row" spacing={0} sx={{ mt: 2, alignItems: "center" }}>
          <DataDownload dataSetIri={dataSetIri} chartConfig={chartConfig} />
          {configKey && shareUrl && (
            <>
              <Box sx={{ display: "inline", mx: 1 }}>·</Box>
              <Link
                variant="inline"
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
