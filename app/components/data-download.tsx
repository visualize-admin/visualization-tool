import { Trans } from "@lingui/macro";
import { saveAs } from "file-saver";
import { memo, ReactNode, useCallback, useMemo } from "react";
import { Box, Link } from "@mui/material";
import { keyBy } from "lodash";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartConfig } from "../configurator";
import { Observation } from "../domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";

type DataDownloadExtent = "visible" | "all";
export type DataDownloadFileFormat = "csv" | "xlsx";

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
    const columns = useMemo(() => {
      return keyBy([...dimensions, ...measures], (d) => d.iri);
    }, [dimensions, measures]);
    const data = useMemo(() => {
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
    }, [columns, observations]);

    const downloadData = useCallback(() => {
      fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columnKeys: Object.keys(columns).map((d) => columns[d].label),
          data,
          fileFormat,
        }),
      }).then((res) =>
        res.blob().then((blob) => saveAs(blob, `${title}.${fileFormat}`))
      );
    }, [columns, data, fileFormat, title]);

    return (
      <DownloadButton onClick={() => downloadData()}>
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
    <Link
      component="button"
      color="primary"
      underline="hover"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
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
  <Link component="button" color="primary" underline="hover" onClick={onClick}>
    {children}
  </Link>
);
