import { ParsedUrlQuery } from "querystring";

import { Trans } from "@lingui/macro";
import { Box, Paper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { ComponentProps, useEffect } from "react";
import { UseQueryResponse } from "urql";

import { DataSetPreviewTable } from "@/browse/datatable";
import { useFootnotesStyles } from "@/components/chart-footnotes";
import { DataDownloadMenu } from "@/components/data-download";
import Flex from "@/components/flex";
import { HintRed, Loading, LoadingDataError } from "@/components/hint";
import { DataSource } from "@/config-types";
import {
  DataCubeMetadataQuery,
  useDataCubePreviewQuery,
} from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";

export const isOdsIframe = (query: ParsedUrlQuery) => {
  return query["odsiframe"] === "true";
};

const useStyles = makeStyles<
  Theme,
  { isOdsIframe: boolean; descriptionPresent: boolean }
>((theme) => ({
  root: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    marginBottom: ({ isOdsIframe }) => (isOdsIframe ? 0 : theme.spacing(4)),
  },
  paper: {
    borderRadius: theme.spacing(4),
    boxShadow: "none",
  },
  description: {
    marginBottom: theme.spacing(6),
  },
  tableOuterWrapper: {
    boxShadow: theme.shadows[4],
  },
  tableInnerWrapper: {
    flexGrow: 1,
    width: "100%",
    position: "relative",
    overflowX: "auto",
    marginTop: ({ descriptionPresent }) =>
      descriptionPresent ? theme.spacing(6) : 0,
  },
  footnotesWrapper: {
    marginTop: theme.spacing(4),
    justifyContent: "space-between",
  },
  loadingWrapper: {
    flexDirection: "column",
    justifyContent: "space-between",
    flexGrow: 1,
    padding: theme.spacing(5),
  },
}));

export const DataSetPreview = ({
  dataSetIri,
  dataSource,
  dataCubeMetadataQuery,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  dataCubeMetadataQuery: UseQueryResponse<DataCubeMetadataQuery, object>;
}) => {
  const footnotesClasses = useFootnotesStyles({ useMarginTop: false });
  const locale = useLocale();
  const router = useRouter();
  const odsIframe = isOdsIframe(router.query);
  const variables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
    cubeFilter: { iri: dataSetIri },
  };
  const [{ data: metadata, fetching: fetchingMetadata, error: metadataError }] =
    dataCubeMetadataQuery;
  const [
    { data: previewData, fetching: fetchingPreview, error: previewError },
  ] = useDataCubePreviewQuery({ variables });
  const classes = useStyles({
    descriptionPresent: !!metadata?.dataCubeMetadata.description,
    isOdsIframe: odsIframe,
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  if (fetchingMetadata || fetchingPreview) {
    return (
      <Flex className={classes.loadingWrapper}>
        <Loading />
      </Flex>
    );
  } else if (metadata?.dataCubeMetadata && previewData?.dataCubePreview) {
    const { dataCubeMetadata } = metadata;
    const { dataCubePreview } = previewData;

    return (
      <Flex className={classes.root}>
        {dataCubeMetadata.publicationStatus ===
          DataCubePublicationStatus.Draft && (
          <Box sx={{ mb: 4 }}>
            <HintRed>
              <Trans id="dataset.publicationStatus.draft.warning">
                Careful, this dataset is only a draft.
                <br />
                <strong>Don&apos;t use for reporting!</strong>
              </Trans>
            </HintRed>
          </Box>
        )}
        <Flex
          className={classes.header}
          sx={{
            justifyContent: odsIframe ? "end" : "space-between",
          }}
        >
          <Head>
            <title key="title">
              {dataCubeMetadata.title} - visualize.admin.ch
            </title>
          </Head>
          {!odsIframe && (
            <Typography variant="h1" fontWeight={700}>
              {dataCubeMetadata.title}
            </Typography>
          )}
        </Flex>
        <Paper className={classes.paper}>
          {dataCubeMetadata.description && !odsIframe && (
            <Typography className={classes.description} variant="body2">
              {dataCubeMetadata.description}
            </Typography>
          )}
          <div className={classes.tableOuterWrapper}>
            <Flex className={classes.tableInnerWrapper}>
              <DataSetPreviewTable
                title={dataCubeMetadata.title}
                dimensions={dataCubePreview.dimensions}
                measures={dataCubePreview.measures}
                observations={dataCubePreview.observations}
              />
            </Flex>
          </div>
          <Flex className={classes.footnotesWrapper}>
            <Flex className={footnotesClasses.actions}>
              {!isOdsIframe(router.query) && (
                <DataDownloadMenu
                  dataSource={dataSource}
                  title={dataCubeMetadata.title}
                  filters={variables.cubeFilter}
                />
              )}
            </Flex>
            <FirstTenRowsCaption />
          </Flex>
        </Paper>
      </Flex>
    );
  } else {
    return (
      <Flex className={classes.loadingWrapper}>
        <LoadingDataError
          message={metadataError?.message ?? previewError?.message}
        />
      </Flex>
    );
  }
};

export type DataSetPreviewProps = ComponentProps<typeof DataSetPreview>;

export const FirstTenRowsCaption = () => {
  return (
    <Typography variant="h6" component="span" color="monochrome.500">
      <Trans id="datatable.showing.first.rows">Showing first 10 rows</Trans>
    </Typography>
  );
};
