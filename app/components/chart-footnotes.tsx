import { Trans } from "@lingui/macro";
import { Box, Link, Text } from "theme-ui";
import { Fragment, useEffect, useState } from "react";
import { ChartConfig } from "../configurator";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";
import { DataDownload } from "./data-download";
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

  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: dataSetIri, locale },
  });

  const queryFilters = useQueryFilters({
    chartConfig,
    interactiveFiltersIsActive:
      chartConfig.interactiveFiltersConfig?.dataFilters.active ?? false,
  });
  if (data?.dataCubeByIri) {
    const {
      dataCubeByIri: { dimensions },
    } = data;

    const namedFilters = Object.entries(queryFilters).flatMap(([iri, f]) => {
      if (f.type !== "single") {
        return [];
      }

      const dimension = dimensions.find((d) => d.iri === iri);
      const value = dimension?.values.find((v) => v.value === f.value);

      if (!dimension) {
        return [];
      }

      return [
        {
          dimension,
          value,
        },
      ];
    });

    return (
      <>
        {namedFilters.length > 0 && (
          <Text variant="meta" color="monochrome800" sx={{ my: 2 }}>
            <Trans id="metadata.filter">Filterset</Trans>:
            {namedFilters.map(({ dimension, value }, i) => (
              <Fragment key={dimension.iri}>
                {" "}
                <span>{dimension.label}</span> (<span>{value?.label}</span>)
                {i < namedFilters.length - 1 && ","}
              </Fragment>
            ))}
          </Text>
        )}

        <Text variant="meta" color="monochrome600">
          <Trans id="metadata.dataset">Dataset</Trans>:{" "}
          {data.dataCubeByIri.title}
        </Text>

        <Text variant="meta" color="monochrome600">
          <Trans id="metadata.source">Source</Trans>:{" "}
          {data.dataCubeByIri.source && (
            <Box
              as="span"
              sx={{ "> a": { color: "monochrome600" } }}
              dangerouslySetInnerHTML={{ __html: data.dataCubeByIri.source }}
            ></Box>
          )}
        </Text>

        <Box>
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
      </>
    );
  } else {
    return null;
  }
};
