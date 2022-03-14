import { Trans } from "@lingui/macro";
import { csvFormat } from "d3";
import { saveAs } from "file-saver";
import { memo, ReactNode, useMemo } from "react";
import { Box, Button, Link } from "theme-ui";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartConfig } from "../configurator";
import { Observation } from "../domain/data";
import {
  DimensionMetaDataFragment,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { useLocale } from "../locales/use-locale";

type DataDownloadType = "visible" | "full";

export const DataDownload = memo(
  ({
    dataSetIri,
    chartConfig,
    type,
  }: {
    dataSetIri: string;
    chartConfig: ChartConfig;
    type: DataDownloadType;
  }) => {
    const locale = useLocale();
    const filters = useQueryFilters({ chartConfig });
    const [{ data }] = useDataCubeObservationsQuery({
      variables: {
        locale,
        iri: dataSetIri,
        dimensions: null, // FIXME: Other fields may also be measures
        filters: type === "visible" ? filters : null,
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
            type={type}
          />
          {observations.sparqlEditorUrl && (
            <>
              <Box sx={{ display: "inline", mx: 1 }}>·</Box>
              <RunSparqlQuery url={observations.sparqlEditorUrl} type={type} />
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
    type,
  }: {
    title: string;
    observations: Observation[];
    dimensions: DimensionMetaDataFragment[];
    measures: DimensionMetaDataFragment[];
    type: DataDownloadType;
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
        {type === "visible" ? (
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
  type,
}: {
  url: string;
  type: DataDownloadType;
}) => {
  return (
    <Link variant="inline" href={url} target="_blank" rel="noopener noreferrer">
      {type === "visible" ? (
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
