import { Trans } from "@lingui/macro";
import { Box, Button, Paper, Typography } from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import * as React from "react";
import { AllDataDownloadMenu } from "@/components/data-download";
import DebugPanel from "@/components/debug-panel";
import Flex from "@/components/flex";
import { HintRed, Loading, LoadingDataError } from "@/components/hint";
import { useDataCubePreviewQuery } from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";
import { DataSetPreviewTable } from "@/configurator/components/datatable";

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
          <Typography component="div" variant="h1" sx={{ color: "grey.800" }}>
            {dataCubeByIri.title}
          </Typography>
          <Link passHref href={`/create/new?cube=${dataCubeByIri.iri}`}>
            <Button
              component="a"
              sx={{ ml: 6, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <Trans id="browse.dataset.create-visualization">
                Create visualization from dataset
              </Trans>
            </Button>
          </Link>
        </Flex>
        <Paper
          elevation={5}
          sx={{
            borderRadius: 8,
            py: 6,
            px: 5,
          }}
        >
          <Typography
            component="div"
            variant="body2"
            sx={{ mb: 4, color: "grey.600" }}
          >
            {dataCubeByIri.description}
          </Typography>

          <Box
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
          <Flex sx={{ mt: 4, justifyContent: "space-between" }}>
            <Typography
              variant="body2"
              sx={{ color: "grey.600", fontWeight: "light" }}
            >
              <Trans id="datatable.showing.first.rows">
                Showing first 10 rows
              </Trans>
            </Typography>
            <AllDataDownloadMenu
              dataSetIri={dataSetIri}
              title={dataCubeByIri.title}
            />
          </Flex>
          <DebugPanel configurator={true} />
        </Paper>
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
