import { Trans } from "@lingui/macro";
import { csvFormat } from "d3";
import { saveAs } from "file-saver";
import { keyBy } from "lodash";
import { memo, ReactNode, useMemo } from "react";
import { Box, Button, Link } from "theme-ui";
import * as XLSX from "xlsx";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartConfig } from "../configurator";
import { Observation } from "../domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";

type DataDownloadExtent = "visible" | "all";
type DataDownloadFileFormat = "csv" | "xlsx";

export const DataDownload = memo(
  ({
    dataSetIri,
    chartConfig,
    extent,
    fileFormat,
  }: {
    dataSetIri: string;
    chartConfig: ChartConfig;
    extent: DataDownloadExtent;
    fileFormat: DataDownloadFileFormat;
  }) => {
    const locale = useLocale();
    const filters = useQueryFilters({ chartConfig });
    const [{ data }] = useDataCubeObservationsQuery({
      variables: {
        locale,
        iri: dataSetIri,
        dimensions: null, // FIXME: Other fields may also be measures
        filters: extent === "visible" ? filters : null,
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
            extent={extent}
            fileFormat={fileFormat}
          />
          {observations.sparqlEditorUrl && (
            <>
              <Box sx={{ display: "inline", mx: 1 }}>·</Box>
              <RunSparqlQuery
                url={observations.sparqlEditorUrl}
                extent={extent}
              />
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
    extent,
    fileFormat,
  }: {
    title: string;
    observations: Observation[];
    dimensions: DimensionMetaDataFragment[];
    measures: DimensionMetaDataFragment[];
    extent: DataDownloadExtent;
    fileFormat: DataDownloadFileFormat;
  }) => {
    const data = useMemo(() => {
      const columns = keyBy([...dimensions, ...measures], (d) => d.iri);
      return observations.map((obs) =>
        Object.keys(obs).reduce((acc, key) => {
          const col = columns[key];
          return col
            ? {
                ...acc,
                ...{ [col.label]: obs[key] },
              }
            : acc;
        }, {})
      );
    }, [dimensions, measures, observations]);

    const onClick: () => void = useMemo(() => {
      switch (fileFormat) {
        case "csv":
          const csvData = csvFormat(data);
          const blob = new Blob([csvData], {
            type: "text/plain;charset=utf-8",
          });
          return () => saveAs(blob, `${title}.csv`);
        case "xlsx":
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(workbook, worksheet, "data");
          return () => XLSX.writeFile(workbook, `${title}.xlsx`);
      }
    }, [data, fileFormat, title]);

    return (
      <DownloadButton onClick={onClick}>
        {extent === "visible" ? (
          <Trans id="button.download.data.visible">Download visible data</Trans>
        ) : (
          <Trans id="button.download.data.all">Download all data</Trans>
        )}
      </DownloadButton>
    );
  }
);

const RunSparqlQuery = ({
  url,
  extent,
}: {
  url: string;
  extent: DataDownloadExtent;
}) => {
  return (
    <Link variant="inline" href={url} target="_blank" rel="noopener noreferrer">
      {extent === "visible" ? (
        <Trans id="button.download.runsparqlquery.visible">
          Run SPARQL query (visible)
        </Trans>
      ) : (
        <Trans id="button.download.runsparqlquery.all">
          Run SPARQL query (all)
        </Trans>
      )}
    </Link>
  );
};

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
