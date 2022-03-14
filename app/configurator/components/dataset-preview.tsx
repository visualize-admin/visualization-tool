import Flex from "../../components/flex";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { HintRed, Loading, LoadingDataError } from "../../components/hint";
import { DataSetPreviewTable } from "./datatable";
import { Trans } from "@lingui/macro";
import { useDataCubePreviewQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import { DataCubePublicationStatus } from "../../graphql/resolver-types";
import DebugPanel from "../../components/debug-panel";
import LinkButton from "./link-button";
import Head from "next/head";

export interface Preview {
  iri: string;
  label: string;
}
export const DataSetPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const locale = useLocale();
  const [{ data: metaData, fetching, error }] = useDataCubePreviewQuery({
    variables: { iri: dataSetIri, locale },
  });

  if (metaData && metaData.dataCubeByIri) {
    const { dataCubeByIri } = metaData;
    return (
      <Flex
        sx={{
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {metaData.dataCubeByIri.publicationStatus ===
          DataCubePublicationStatus.Draft && (
          <Box sx={{ mb: 4 }}>
            <HintRed iconName="datasetError" iconSize={64}>
              <Trans id="dataset.publicationStatus.draft.warning">
                Careful, this dataset is only a draft.
                <br />
                <strong>Don&apos;t use for reporting!</strong>
              </Trans>
            </HintRed>
          </Box>
        )}
        <Flex
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 6 }}
        >
          <Head>
            <title key="title">
              {dataCubeByIri.title} - visualize.admin.ch
            </title>
          </Head>
          <Typography component="div" variant="h1">
            {dataCubeByIri.title}
          </Typography>
          <LinkButton
            sx={{ ml: 6, whiteSpace: "nowrap", flexShrink: 0 }}
            href={`/create/new?cube=${dataCubeByIri.iri}`}
          >
            <Trans id="browse.dataset.create-visualization">
              Create visualization from dataset
            </Trans>
          </LinkButton>
        </Flex>
        <Box
          sx={{
            boxShadow: "primary",
            borderRadius: 20,
            bg: "monochrome100",
            py: 6,
            px: 5,
          }}
        >
          <Typography
            component="div"
            variant="body1"
            sx={{ mb: 4, color: "monochrome700" }}
          >
            {dataCubeByIri.description}
          </Typography>

          <Box
            variant="h3"
            sx={{
              flexGrow: 1,
              width: "100%",
              position: "relative",
              overflowX: "auto",
              mt: 6,
            }}
          >
            <DataSetPreviewTable
              title={dataCubeByIri.title}
              dataSetIri={dataCubeByIri.iri}
              dimensions={dataCubeByIri.dimensions}
              measures={dataCubeByIri.measures}
            />
          </Box>
          <Typography
            variant="table"
            sx={{
              mt: 4,
              color: "monochrome600",
              width: "100%",
              textAlign: "center",
              fontWeight: "light",
            }}
          >
            <Trans id="datatable.showing.first.rows">
              Showing first 10 rows
            </Trans>
          </Typography>
          <DebugPanel configurator={true} />
        </Box>
      </Flex>
    );
  } else if (fetching) {
    return (
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          p: 5,
        }}
      >
        <Loading />
      </Flex>
    );
  } else {
    return (
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          p: 5,
        }}
      >
        <LoadingDataError message={error?.message} />
      </Flex>
    );
  }
};
