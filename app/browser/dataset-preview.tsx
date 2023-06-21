import { Trans } from "@lingui/macro";
import { Box, Button, Paper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Head from "next/head";
import Link from "next/link";
import * as React from "react";

import { DataSetPreviewTable } from "@/browse/datatable";
import { useFootnotesStyles } from "@/components/chart-footnotes";
import { DataDownloadMenu, RunSparqlQuery } from "@/components/data-download";
import DebugPanel from "@/components/debug-panel";
import Flex from "@/components/flex";
import { HintRed, Loading, LoadingDataError } from "@/components/hint";
import { DataSource } from "@/config-types";
import { useDataCubePreviewQuery } from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { useLocale } from "@/locales/use-locale";

const useStyles = makeStyles<Theme, { descriptionPresent: boolean }>(
  (theme) => ({
    root: {
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "space-between",
      paddingLeft: theme.spacing(4),
    },
    header: {
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing(5),
    },
    title: {
      color: theme.palette.grey[800],
    },
    createChartButton: {
      marginLeft: theme.spacing(6),
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

export interface Preview {
  iri: string;
  label: string;
}

export const DataSetPreview = ({
  dataSetIri,
  dataSource,
}: {
  dataSetIri: string;
  dataSource: DataSource;
}) => {
  const footnotesClasses = useFootnotesStyles({ useMarginTop: false });
  const locale = useLocale();
  const [{ data: metadata, fetching, error }] = useDataCubePreviewQuery({
    variables: {
      iri: dataSetIri,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const classes = useStyles({
    descriptionPresent: !!metadata?.dataCubeByIri?.description,
  });

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  if (metadata?.dataCubeByIri) {
    const { dataCubeByIri } = metadata;

    return (
      <Flex className={classes.root}>
        {dataCubeByIri.publicationStatus ===
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
        <Flex className={classes.header}>
          <Head>
            <title key="title">
              {dataCubeByIri.title} - visualize.admin.ch
            </title>
          </Head>
          <Typography className={classes.title} component="div" variant="h1">
            {dataCubeByIri.title}
          </Typography>
          <Link passHref href={`/create/new?cube=${dataCubeByIri.iri}`}>
            <Button className={classes.createChartButton} component="a">
              <Trans id="browse.dataset.create-visualization">
                Create visualization from dataset
              </Trans>
            </Button>
          </Link>
        </Flex>
        <Paper className={classes.paper} elevation={5}>
          {dataCubeByIri.description && (
            <Typography
              className={classes.description}
              component="div"
              variant="body2"
            >
              {dataCubeByIri.description}
            </Typography>
          )}

          <Flex className={classes.tableWrapper}>
            <DataSetPreviewTable
              title={dataCubeByIri.title}
              dimensions={dataCubeByIri.dimensions}
              measures={dataCubeByIri.measures}
              observations={dataCubeByIri.observations.data}
            />
          </Flex>
          <Flex className={classes.footnotesWrapper}>
            <Flex className={footnotesClasses.actions}>
              <DataDownloadMenu
                dataSetIri={dataSetIri}
                dataSource={dataSource}
                title={dataCubeByIri.title}
              />
              {dataCubeByIri.observations.sparqlEditorUrl && (
                <RunSparqlQuery
                  url={dataCubeByIri.observations.sparqlEditorUrl}
                />
              )}
            </Flex>
            <Typography
              className={classes.numberOfRows}
              variant="body2"
              sx={{ fontWeight: "light" }}
            >
              <Trans id="datatable.showing.first.rows">
                Showing first 10 rows
              </Trans>
            </Typography>
          </Flex>
          <DebugPanel configurator={true} />
        </Paper>
      </Flex>
    );
  } else if (fetching) {
    return (
      <Flex className={classes.loadingWrapper}>
        <Loading />
      </Flex>
    );
  } else {
    return (
      <Flex className={classes.loadingWrapper}>
        <LoadingDataError message={error?.message} />
      </Flex>
    );
  }
};
