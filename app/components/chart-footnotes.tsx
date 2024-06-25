import { Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { PropsWithChildren, useEffect, useState } from "react";

import {
  extractChartConfigComponentIris,
  useQueryFilters,
} from "@/charts/shared/chart-helpers";
import { ChartFiltersList } from "@/components/chart-filters-list";
import { DataDownloadMenu, RunSparqlQuery } from "@/components/data-download";
import { ChartConfig, DataSource } from "@/configurator";
import { Dimension } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import {
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";
import { assert } from "@/utils/assert";
import { useEmbedOptions } from "@/utils/embed";

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
  configKey,
  visualizeLinkText,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
  configKey?: string;
  visualizeLinkText?: JSX.Element;
}) => {
  const classes = useFootnotesStyles({ useMarginTop: true });
  const locale = useLocale();
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/v/${configKey}`);
  }, [configKey, locale]);

  const queryFilters = useQueryFilters({
    chartConfig,
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
      cubeFilters: queryFilters,
    },
  });
  const sparqlEditorUrls =
    downloadData?.dataCubesObservations?.sparqlEditorUrls;
  const formatLocale = useTimeFormatLocale();
  const [{ showDownload, showSparqlQuery, showDatePublished }] =
    useEmbedOptions();

  return (
    <div>
      <ChartFiltersList
        dataSource={dataSource}
        chartConfig={chartConfig}
        dimensions={dimensions}
      />
      {data?.dataCubesMetadata
        ? data.dataCubesMetadata.map((dataCubeMetadata) => {
            const sparqlEditorUrl = sparqlEditorUrls?.find(
              (d) => d.cubeIri === dataCubeMetadata.iri
            )?.url;
            const cubeQueryFilters = queryFilters.find(
              (f) => f.iri === dataCubeMetadata.iri
            );
            assert(cubeQueryFilters, "Cube query filters not found");

            return (
              <Box key={dataCubeMetadata.iri}>
                {dataCubeMetadata.dateModified &&
                showDatePublished !== false ? (
                  <Typography
                    component="span"
                    variant="caption"
                    color="grey.600"
                  >
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

                <Box className={classes.actions}>
                  {showDownload !== false ? (
                    <DataDownloadMenu
                      dataSource={dataSource}
                      title={dataCubeMetadata.title}
                      filters={cubeQueryFilters}
                    />
                  ) : null}
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
