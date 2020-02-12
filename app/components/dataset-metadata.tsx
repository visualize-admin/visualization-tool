import { Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import { Loading } from "./hint";
import { useDataCubeMetadataQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";

// FIXME: localize time format
const formatTime = timeFormat("%B %d, %Y");

export const DataSetMetadata = ({ dataSetIri }: { dataSetIri: string }) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataQuery({
    variables: { iri: dataSetIri, locale }
  });

  if (data?.dataCubeByIri) {
    return (
      <Box sx={{ m: 4 }}>
        <Box variant="dataSetMetadata.title">
          <Trans id="dataset.metadata.title">Title</Trans>
        </Box>
        <Box variant="dataSetMetadata.body">{data.dataCubeByIri.title}</Box>

        {data.dataCubeByIri.source && (
          <>
            <Box variant="dataSetMetadata.title">
              <Trans id="dataset.metadata.source">Source</Trans>
            </Box>
            <Box variant="dataSetMetadata.body">
              {data.dataCubeByIri.source}
            </Box>
          </>
        )}

        {data.dataCubeByIri.dateCreated && (
          <>
            <Box variant="dataSetMetadata.title">
              <Trans id="dataset.metadata.date.created">Date Created</Trans>
            </Box>
            <Box variant="dataSetMetadata.body">
              {formatTime(new Date(data.dataCubeByIri.dateCreated))}
            </Box>
          </>
        )}
      </Box>
    );
  } else {
    return <Loading />;
  }
};
