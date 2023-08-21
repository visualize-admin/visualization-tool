import { Trans } from "@lingui/macro";
import { Box, Button, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ChartPanelPublished } from "@/components/chart-panel";
import { ChartPublished } from "@/components/chart-published";
import { Success } from "@/components/hint";
import { ContentLayout } from "@/components/layout";
import { PublishActions } from "@/components/publish-actions";
import { Config } from "@/configurator";
import { getConfig } from "@/db/config";
import { deserializeProps, Serialized, serializeProps } from "@/db/serialize";
import { useLocale } from "@/locales/use-locale";
import { useDataSourceStore } from "@/stores/data-source";
import { EmbedOptionsProvider } from "@/utils/embed";

type PageProps =
  | {
      status: "notfound";
    }
  | {
      status: "found";
      config: {
        key: string;
        data: Omit<Config, "activeField">;
      };
    };

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const config = await getConfig(query.chartId as string);

  if (config && config.data) {
    // TODO validate configuration
    return { props: serializeProps({ status: "found", config }) };
  }

  res.statusCode = 404;

  return { props: { status: "notfound" } };
};

const useStyles = makeStyles((theme: Theme) => ({
  actionBar: {
    backgroundColor: "white",
    padding: `${theme.spacing(3)} 2.25rem`,
    justifyContent: "flex-end",
    display: "flex",
    width: "100%",
    borderBottom: "1px solid",
    borderBottomColor: theme.palette.divider,
    [theme.breakpoints.down("md")]: {
      padding: `${theme.spacing(3)} 0.75rem`,
    },
  },
}));

const VisualizationPage = (props: Serialized<PageProps>) => {
  const locale = useLocale();
  const { query, replace } = useRouter();
  const classes = useStyles();

  // Keep initial value of publishSuccess
  const [publishSuccess] = useState(() => !!query.publishSuccess);
  const { status } = deserializeProps(props);

  const { dataSource, setDataSource } = useDataSourceStore();

  useEffect(() => {
    // Remove publishSuccess from URL so that when reloading of sharing the link
    // to someone, there is no publishSuccess mention
    if (query.publishSuccess) {
      replace({ pathname: window.location.pathname });
    }

    if (
      props.status === "found" &&
      props.config.data.dataSource.url !== dataSource.url
    ) {
      setDataSource(props.config.data.dataSource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.url, setDataSource, props]);

  if (status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const { key, data } = (props as Exclude<PageProps, { status: "notfound" }>)
    .config;

  return (
    <EmbedOptionsProvider>
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:title" content={data.meta.title[locale]} />
        <meta
          property="og:description"
          content={data.meta.description[locale]}
        />
        {/* og:url is set in _app.tsx */}
      </Head>
      <ContentLayout>
        <Box className={classes.actionBar}>
          <PublishActions configKey={key} sx={{ m: 0 }} />
        </Box>
        <Box
          px={[2, 4]}
          sx={{ backgroundColor: "muted.main" }}
          mb="auto"
          mx="auto"
          width="100%"
          overflow="hidden"
        >
          <Box sx={{ pt: 4, maxWidth: "50rem", margin: "auto" }}>
            {publishSuccess && (
              <Box mt={2} mb={5}>
                <Success />
              </Box>
            )}

            <ChartPanelPublished chartType={data.chartConfig.chartType}>
              <ChartPublished
                dataSet={data.dataSet}
                dataSource={data.dataSource}
                chartConfig={data.chartConfig}
                meta={data.meta}
                configKey={key}
              />
            </ChartPanelPublished>

            <Typography component="div" my={4}>
              {publishSuccess ? (
                <Trans id="hint.how.to.share">
                  You can share this chart either by sharing its URL or by
                  embedding it on your website. You can also create a new
                  visualization or duplicate the above chart.
                </Trans>
              ) : (
                <Trans id="hint.create.your.own.chart">
                  Create your own graphic now! With the visualization tool, you
                  can create your own graphics, based on a large number of Swiss
                  federal data.
                </Trans>
              )}
            </Typography>

            <Stack
              alignItems="flex-start"
              direction={{ xs: "column", sm: "row" }}
              // We need to use responsive syntax for spacing when using responsive
              // syntax for direction, otherwise it does not work
              spacing={{ xs: 2, sm: 2 }}
              sx={{ mb: 5 }}
            >
              <NextLink href="/create/new" passHref>
                <Button component="a" variant="outlined" color="primary">
                  <Trans id="button.new.visualization">
                    Create a new visualization
                  </Trans>
                </Button>
              </NextLink>
              <NextLink
                href={{ pathname: "/create/new", query: { from: key } }}
                passHref
              >
                <Button component="a" variant="outlined" color="primary">
                  <Trans id="button.copy.visualization">
                    Copy and edit this visualization
                  </Trans>
                </Button>
              </NextLink>
            </Stack>
          </Box>
        </Box>
      </ContentLayout>
    </EmbedOptionsProvider>
  );
};

export default VisualizationPage;
