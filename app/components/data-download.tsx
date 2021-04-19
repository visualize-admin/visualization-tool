import { Trans } from "@lingui/macro";
import { Box, Button, Link } from "theme-ui";
import { csvFormat } from "d3";
import { saveAs } from "file-saver";
import { memo, ReactNode, useMemo } from "react";
import { ChartConfig, ChartFields } from "../configurator";
import { Observation } from "../domain/data";
import {
  ComponentFieldsFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";

export interface ChartFieldsWithLabel {
  [x: string]: string;
}

export const DataDownload = memo(
  ({
    dataSetIri,
    chartConfig,
  }: {
    dataSetIri: string;
    chartConfig: ChartConfig;
  }) => {
    const locale = useLocale();
    const measures =
      "y" in chartConfig.fields
        ? [chartConfig.fields.y.componentIri]
        : chartConfig.chartType === "table"
        ? Object.values(chartConfig.fields).flatMap((f) =>
            f.componentType === "Measure" && !f.isHidden ? [f.componentIri] : []
          )
        : [];

    const [{ data }] = useDataCubeObservationsQuery({
      variables: {
        locale,
        iri: dataSetIri,
        measures, // FIXME: Other fields may also be measures
        filters: chartConfig.filters,
      },
    });

    if (data?.dataCubeByIri) {
      const { title, dimensions, measures, observations } = data?.dataCubeByIri;

      return (
        <>
          <DataDownloadInner
            title={title}
            observations={observations.data}
            dimensions={dimensions}
            measures={measures}
            fields={chartConfig.fields}
          />
          {observations.sparqlEditorUrl && (
            <>
              <Box sx={{ display: "inline", mx: 1 }}>·</Box>
              <Link
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
                href={observations.sparqlEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Trans id="button.download.runsparqlquery">
                  Run SPARQL query
                </Trans>
              </Link>
            </>
          )}
        </>
      );
    } else {
      return <DownloadButton onClick={() => {}}> </DownloadButton>;
    }
  }
);

const DataDownloadInner = memo(
  ({
    title,
    observations,
    dimensions,
    measures,
    fields,
  }: {
    title: string;
    observations: Observation[];
    dimensions: ComponentFieldsFragment[];
    measures: ComponentFieldsFragment[];
    fields: ChartFields;
  }) => {
    const forCsvData = useMemo(() => {
      const columns = [...dimensions, ...measures];
      return observations.map((obs) => {
        return Object.keys(obs).reduce((acc, key) => {
          const col = columns.find((d) => d.iri === key);

          return col
            ? {
                ...acc,
                ...{ [col.label]: obs[key] },
              }
            : acc;
        }, {});
      });
    }, [dimensions, measures, observations]);

    const csvData = csvFormat(forCsvData);

    const blob = new Blob([csvData], {
      type: "text/plain;charset=utf-8",
    });
    return (
      <DownloadButton onClick={() => saveAs(blob, `${title}.csv`)}>
        <Trans id="button.download.data">Download data</Trans>
      </DownloadButton>
    );
  }
);

export const DownloadButton = ({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) => (
  <Button
    variant="reset"
    sx={{
      display: "inline",
      background: "transparent",
      color: "primary",
      textAlign: "left",
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      border: "none",
      cursor: "pointer",
      // mt: 2,
      p: 0,
      ":disabled": {
        cursor: "initial",
        color: "monochrome500",
      },
      "&:hover": {
        textDecoration: "underline",
      },
    }}
    onClick={onClick}
  >
    {children}
  </Button>
);
