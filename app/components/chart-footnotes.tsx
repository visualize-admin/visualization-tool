import { Trans } from "@lingui/macro";
import { Box, Button, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { PropsWithChildren, useEffect, useState } from "react";

import { ChartFiltersList } from "@/components/chart-filters-list";
import { ChartConfig, DataSource } from "@/configurator";
import { Dimension } from "@/domain/data";
import { useTimeFormatLocale } from "@/formatters";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";

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
  const [{ data }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });
  const formatLocale = useTimeFormatLocale();
  const latestUpdateDate = data?.dataCubesMetadata
    .map((cubeMetadata) => cubeMetadata.dateModified)
    .sort()
    .reverse()[0];
  return (
    <div>
      <ChartFiltersList
        dataSource={dataSource}
        chartConfig={chartConfig}
        dimensions={dimensions}
      />
      {latestUpdateDate ? (
        <Typography component="span" variant="caption" color="grey.600">
          <strong>
            <Trans id="dataset.footnotes.updated">Latest update</Trans>
          </strong>
          <Trans id="typography.colon">: </Trans>
          {formatLocale.format("%d.%m.%Y %H:%M")(new Date(latestUpdateDate))}
        </Typography>
      ) : null}
      <Box className={classes.actions}>
        {configKey && shareUrl && !visualizeLinkText && (
          <LinkButton href={shareUrl}>
            <Trans id="metadata.link.created.with.visualize">
              Created with visualize.admin.ch
            </Trans>
          </LinkButton>
        )}
      </Box>
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
