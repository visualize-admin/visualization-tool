import { Trans } from "@lingui/macro";
import { useEffect, useState } from "react";
import { Box, Link, Text } from "theme-ui";
import { ChartConfig } from "../configurator";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";
import { DataDownload } from "./data-download";

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
        <Text as="div" variant="meta" color="monochrome600">
          <Trans id="metadata.dataset">Dataset</Trans>: {dataCubeByIri.title}
        </Text>

        <Text as="div" variant="meta" color="monochrome600">
          <Trans id="metadata.source">Source</Trans>:{" "}
          {dataCubeByIri.publisher && (
            <Box
              as="span"
              sx={{ "> a": { color: "monochrome600" } }}
              dangerouslySetInnerHTML={{ __html: dataCubeByIri.publisher }}
            ></Box>
          )}
        </Text>

        <Box sx={{ mt: 2 }}>
          <DataDownload dataSetIri={dataSetIri} chartConfig={chartConfig} />
          {configKey && shareUrl && (
            <>
              <Box sx={{ display: "inline", mx: 1 }}>·</Box>
              <Link
                href={shareUrl}
                sx={{
                  display: "inline",
                  textDecoration: "none",
                  color: "primary",
                  textAlign: "left",
                  fontFamily: "body",
                  lineHeight: [1, 2, 2],
                  fontWeight: "regular",
                  fontSize: [1, 2, 2],
                  border: "none",
                  cursor: "pointer",
                  mt: 2,
                  p: 0,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                <Trans id="metadata.link.created.with.visualize">
                  Created with visualize.admin.ch
                </Trans>
              </Link>
            </>
          )}
        </Box>
      </Box>
    );
  } else {
    return null;
  }
};
