import { ParsedUrlQuery } from "querystring";

import { Trans } from "@lingui/macro";
import { Box, Button, Paper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { DataSetPreviewTable } from "@/browse/datatable";
import { useFootnotesStyles } from "@/components/chart-footnotes";
import { DataDownloadMenu } from "@/components/data-download";
import Flex from "@/components/flex";
import { HintRed, Loading, LoadingDataError } from "@/components/hint";
import { DataSource } from "@/config-types";
import { sourceToLabel } from "@/domain/datasource";
import {
  useDataCubeMetadataQuery,
  useDataCubePreviewQuery,
} from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import SvgIcLinkExternal from "@/icons/components/IcLinkExternal";
import { useLocale } from "@/locales/use-locale";

export const isOdsIframe = (query: ParsedUrlQuery) => {
  return query["odsiframe"] === "true";
};

const useStyles = makeStyles<Theme, { descriptionPresent: boolean }>(
  (theme) => ({
    root: {
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "space-between",
      paddingLeft: theme.spacing(4),
    },
    header: {
      marginBottom: theme.spacing(5),
      [theme.breakpoints.up("md")]: {
        flexDirection: "row",
        alignItems: "center",
      },
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        gap: theme.spacing(4),
        alignItems: "start",
      },
    },
    title: {
      color: theme.palette.grey[800],
    },
    createChartButton: {
      [theme.breakpoints.up("md")]: {
        marginLeft: theme.spacing(6),
      },
      [theme.breakpoints.down("md")]: {
        marginLeft: 0,
      },
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    paper: {
      borderRadius: theme.spacing(4),
      paddingRight: theme.spacing(5),
      paddingBottom: theme.spacing(6),
      boxShadow: "none",
    },
    description: {
      marginBottom: theme.spacing(4),
      color: theme.palette.grey[600],
    },
    tableWrapper: {
      flexGrow: 1,
      width: "100%",
      position: "relative",
      overflowX: "auto",
      marginTop: ({ descriptionPresent }) =>
        descriptionPresent ? theme.spacing(6) : 0,
      WebkitMaskImage:
        "linear-gradient(to right, #FFF calc(100% - 3rem), transparent)",

      "&:after": {
        content: "''",
        paddingLeft: "1.5rem",
      },
    },
    footnotesWrapper: {
      marginTop: theme.spacing(4),
      justifyContent: "space-between",
    },
    numberOfRows: {
      color: theme.palette.grey[600],
    },
    loadingWrapper: {
      flexDirection: "column",
      justifyContent: "space-between",
      flexGrow: 1,
      padding: theme.spacing(5),
    },
  })
);

export const DataSetPreview = ({
  dataSetIri,
  dataSource,
  onCreateChartFromDataset,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  onCreateChartFromDataset?: (
    ev: React.MouseEvent<HTMLAnchorElement>,
    datasetIri: string
  ) => void;
}) => {
  const footnotesClasses = useFootnotesStyles({ useMarginTop: false });
  const locale = useLocale();
  const router = useRouter();
  const variables = {
    sourceType: dataSource.type,
    sourceUrl: dataSource.url,
    locale,
    cubeFilter: { iri: dataSetIri },
  };
  const [{ data: metadata, fetching: fetchingMetadata, error: metadataError }] =
    useDataCubeMetadataQuery({ variables });
  const [
    { data: previewData, fetching: fetchingPreview, error: previewError },
  ] = useDataCubePreviewQuery({ variables });
  const classes = useStyles({
    descriptionPresent: !!metadata?.dataCubeMetadata.description,
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
            justifyContent: isOdsIframe(router.query) ? "end" : "space-between",
          }}
        >
          <Head>
            <title key="title">
              {dataCubeMetadata.title} - visualize.admin.ch
            </title>
          </Head>
          {!isOdsIframe(router.query) && (
            <Typography className={classes.title} component="div" variant="h1">
              {dataCubeMetadata.title}
            </Typography>
          )}
          {onCreateChartFromDataset ? (
            <Button
              onClick={(ev) => onCreateChartFromDataset?.(ev, dataSetIri)}
              className={classes.createChartButton}
              component="a"
              endIcon={isOdsIframe(router.query) ? <SvgIcLinkExternal /> : null}
              target={isOdsIframe(router.query) ? "_blank" : undefined}
            >
              {!isOdsIframe(router.query) ? (
                <Trans id="browse.dataset.create-visualization">
                  Create visualization from dataset
                </Trans>
              ) : (
                <Trans id="browse.dataset.create-visualization-visualize">
                  Create with visualize.admin
                </Trans>
              )}
            </Button>
          ) : (
            <Link
              href={`/create/new?cube=${
                dataCubeMetadata.iri
              }&dataSource=${sourceToLabel(dataSource)}`}
              passHref
              legacyBehavior={!isOdsIframe(router.query)}
              target={isOdsIframe(router.query) ? "_blank" : undefined}
            >
              <Button
                endIcon={
                  isOdsIframe(router.query) ? <SvgIcLinkExternal /> : null
                }
                className={classes.createChartButton}
                component="a"
              >
                {!isOdsIframe(router.query) ? (
                  <Trans id="browse.dataset.create-visualization">
                    Create visualization from dataset
                  </Trans>
                ) : (
                  <Trans id="browse.dataset.create-visualization-visualize">
                    Create with visualize.admin
                  </Trans>
                )}
              </Button>
            </Link>
          )}
        </Flex>
        <Paper className={classes.paper} elevation={5}>
          {dataCubeMetadata.description && !isOdsIframe(router.query) && (
            <Typography
              className={classes.description}
              component="div"
              variant="body2"
            >
              {dataCubeMetadata.description}
            </Typography>
          )}
          <Flex className={classes.tableWrapper}>
            <DataSetPreviewTable
              title={dataCubeMetadata.title}
              dimensions={dataCubePreview.dimensions}
              measures={dataCubePreview.measures}
              observations={dataCubePreview.observations}
            />
          </Flex>
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

export type DataSetPreviewProps = React.ComponentProps<typeof DataSetPreview>;

export const FirstTenRowsCaption = () => {
  return (
    <Typography variant="caption" sx={{ fontWeight: "light" }}>
      <Trans id="datatable.showing.first.rows">Showing first 10 rows</Trans>
    </Typography>
  );
};
