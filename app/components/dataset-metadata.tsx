import { Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import { useDataSetAndMetadata } from "../domain";
import { Loading } from "./hint";

// FIXME: localize time format
const formatTime = timeFormat("%B %d, %Y");

export const DataSetMetadata = ({ dataSetIri }: { dataSetIri: string }) => {
  const { data } = useDataSetAndMetadata(dataSetIri);

  if (data) {
    const { extraMetadata } = data.dataSet;

    const creationDate = extraMetadata.get("dateCreated")?.value;
    const source = extraMetadata.get("contact")?.value;
    return (
      <Box sx={{ m: 4 }}>
        <Box variant="dataSetMetadata.title">
          <Trans id="dataset.metadata.title">Title</Trans>
        </Box>
        <Box variant="dataSetMetadata.body">{data.dataSet.label.value}</Box>

        {source && (
          <>
            <Box variant="dataSetMetadata.title">
              <Trans id="dataset.metadata.source">Source</Trans>
            </Box>
            <Box variant="dataSetMetadata.body">{source}</Box>
          </>
        )}

        {creationDate && (
          <>
            <Box variant="dataSetMetadata.title">
              <Trans id="dataset.metadata.date.created">Date Created</Trans>
            </Box>
            <Box variant="dataSetMetadata.body">
              {formatTime(new Date(creationDate))}
            </Box>
          </>
        )}
        {/* <Box variant="dataSetMetadata.title">
          <Trans id="dataset.metadata.available.languages">
            Available languages
          </Trans>
        </Box>
        <Box variant="dataSetMetadata.body">
          {data.dataSet.map(l => (
            <Box>{l}</Box>
          ))}
        </Box> */}
      </Box>
    );
  } else {
    return <Loading />;
  }
};
