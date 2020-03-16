import { Trans } from "@lingui/macro";
import { Box } from "@theme-ui/components";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import { Loading } from "./hint";
import { useDataCubeMetadataQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { ReactNode } from "react";

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
        <DataSetMetadataTitle>
          <Trans id="dataset.metadata.title">Title</Trans>
        </DataSetMetadataTitle>
        <DataSetMetadataBody>{data.dataCubeByIri.title}</DataSetMetadataBody>

        {data.dataCubeByIri.source && (
          <>
            <DataSetMetadataTitle>
              <Trans id="dataset.metadata.source">Source</Trans>
            </DataSetMetadataTitle>
            <DataSetMetadataBody>
              {data.dataCubeByIri.source}
            </DataSetMetadataBody>
          </>
        )}

        {data.dataCubeByIri.dateCreated && (
          <>
            <DataSetMetadataTitle>
              <Trans id="dataset.metadata.date.created">Date Created</Trans>
            </DataSetMetadataTitle>
            <DataSetMetadataBody>
              {formatTime(new Date(data.dataCubeByIri.dateCreated))}
            </DataSetMetadataBody>
          </>
        )}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

const DataSetMetadataTitle = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      color: "monochrome600"
    }}
  >
    {children}
  </Box>
);
const DataSetMetadataBody = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "regular",
      fontSize: [3, 4, 4],
      color: "monochrome900",
      mb: 3
    }}
  >
    {children}
  </Box>
);
