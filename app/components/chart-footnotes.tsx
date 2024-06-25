import { Trans } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

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
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
}) => {
  const locale = useLocale();
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
          <Trans id="dataset.footnotes.updated">Latest data update</Trans>
          <Trans id="typography.colon">: </Trans>
          {formatLocale.format("%d.%m.%Y %H:%M")(new Date(latestUpdateDate))}
        </Typography>
      ) : null}
    </div>
  );
};
