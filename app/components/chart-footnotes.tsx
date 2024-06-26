import { Trans } from "@lingui/macro";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import uniqBy from "lodash/uniqBy";
import { useMemo } from "react";

import { extractChartConfigComponentIris } from "@/charts/shared/chart-helpers";
import { ChartFiltersList } from "@/components/chart-filters-list";
import { ChartConfig, DataSource } from "@/configurator";
import { Dimension, Measure } from "@/domain/data";
import { truthy } from "@/domain/types";
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
  measures,
}: {
  dataSource: DataSource;
  chartConfig: ChartConfig;
  dimensions?: Dimension[];
  measures?: Measure[];
}) => {
  const locale = useLocale();
  const usedComponents = useMemo(() => {
    const componentIris = extractChartConfigComponentIris({
      chartConfig,
      includeFilters: false,
    });
    const components =
      dimensions && measures ? [...dimensions, ...measures] : [];
    return componentIris
      .map((componentIri) => {
        return components.find((component) => component.iri === componentIri);
      })
      .filter(truthy); // exclude potential joinBy components
  }, [chartConfig, dimensions, measures]);
  const [{ data }] = useDataCubesMetadataQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: uniqBy(
        usedComponents.map((component) => ({ iri: component.cubeIri })),
        "iri"
      ),
    },
    pause: !usedComponents.length,
  });
  const formatLocale = useTimeFormatLocale();

  return (
    <div>
      {data?.dataCubesMetadata.map((metadata) => (
        <>
          <ChartFiltersList
            dataSource={dataSource}
            chartConfig={chartConfig}
            dimensions={dimensions}
            cubeIri={metadata.iri}
          />
          {metadata.dateModified ? (
            <Typography component="span" variant="caption" color="grey.600">
              <Trans id="dataset.footnotes.updated">Latest data update</Trans>
              <Trans id="typography.colon">: </Trans>
              {formatLocale.format("%d.%m.%Y %H:%M")(
                new Date(metadata.dateModified)
              )}
            </Typography>
          ) : null}
        </>
      ))}
    </div>
  );
};
