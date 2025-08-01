import { Trans } from "@lingui/macro";
import {
  alertClasses,
  Box,
  Button,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Config as PrismaConfig, PUBLISHED_STATE } from "@prisma/client";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import { useEmbedQueryParams } from "@/components/embed-params";
import { HintWarning, PublishSuccess } from "@/components/hint";
import { ContentLayout } from "@/components/layout";
import { PublishActions } from "@/components/publish-actions";
import { ConfiguratorStatePublished } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";
import { getConfig, increaseConfigViewCount } from "@/db/config";
import { deserializeProps, Serialized, serializeProps } from "@/db/serialize";
import { useLocale } from "@/locales/use-locale";
import { useDataSourceStore } from "@/stores/data-source";

type PageProps =
  | {
      status: "notfound";
      config: null;
    }
  | {
      status: "found";
      config: Omit<PrismaConfig, "data"> & {
        data: Omit<ConfiguratorStatePublished, "activeField" | "state">;
      };
    };

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const config = await getConfig(query.chartId as string);

  if (config && config.data) {
    await increaseConfigViewCount(config.key);
    return {
      props: serializeProps({
        status: "found",
        config,
      }),
    };
  }

  res.statusCode = 404;

  return { props: { status: "notfound", config: null, viewCount: null } };
};

const useStyles = makeStyles((theme: Theme) => ({
  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    padding: `${theme.spacing(6)} ${theme.spacing(12)}`,
    borderBottom: "1px solid",
    borderBottomColor: theme.palette.divider,
    backgroundColor: theme.palette.background.paper,
  },
}));

const VisualizationPage = (props: Serialized<PageProps>) => {
  const locale = useLocale();
  const { query, replace } = useRouter();
  const classes = useStyles();
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  // Keep initial value of publishSuccess
  const [publishSuccess] = useState(() => !!query.publishSuccess);
  const { status, config } = deserializeProps(props);
  const { embedParams } = useEmbedQueryParams();

  const session = useSession();
  const canEdit =
    status === "found" &&
    config.user_id &&
    config.user_id === session.data?.user.id;

  const { key, state } = useMemo(() => {
    if (status === "found") {
      const state = {
        state: "PUBLISHED",
        ...config.data,
      } as ConfiguratorStatePublished;

      return {
        key: config.key,
        state,
      };
    }

    return {
      key: "",
      state: undefined,
    };
  }, [config?.data, config?.key, status]);
  const chartConfig = state ? getChartConfig(state) : undefined;

  useEffect(
    function removePublishSuccessFromURL() {
      // Remove publishSuccess from URL so that when reloading of sharing the link
      // to someone, there is no publishSuccess mention
      if (query.publishSuccess) {
        replace({ pathname: window.location.pathname }, undefined, {
          shallow: true,
        });
      }
    },
    [query.publishSuccess, replace]
  );

  const { dataSource, setDataSource } = useDataSourceStore();
  useEffect(
    function setCorrectDataSource() {
      if (status === "found" && config.data.dataSource.url !== dataSource.url) {
        setDataSource(config.data.dataSource);
      }
    },
    [config?.data.dataSource, dataSource.url, setDataSource, status]
  );

  if (
    status === "notfound" ||
    state === undefined ||
    chartConfig === undefined
  ) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        <meta property="og:title" content={state.layout.meta.title[locale]} />
        <meta
          property="og:description"
          content={state.layout.meta.description[locale]}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ContentLayout>
        {config.published_state === PUBLISHED_STATE.PUBLISHED && (
          <Box className={classes.actionBar}>
            <PublishActions
              chartWrapperRef={chartWrapperRef}
              configKey={key}
              locale={locale}
            />
          </Box>
        )}
        <Box px={[2, 4]} mb="auto" mx="auto" width="100%" overflow="hidden">
          <Box
            sx={{
              maxWidth: {
                xs: "100%",
                lg: 1152,
              },
              margin: "auto",
              p: 8,
            }}
          >
            {publishSuccess && (
              <Box mt={2} mb={5}>
                <PublishSuccess />
              </Box>
            )}
            {config.published_state === PUBLISHED_STATE.DRAFT && (
              <Box mt={2} mb={5}>
                <HintWarning
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    m: "auto",

                    [`& .${alertClasses.message}`]: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  }}
                >
                  <Trans id="hint.publication.draft">
                    This chart is still a draft.
                  </Trans>
                  {canEdit ? (
                    <Button
                      component={NextLink}
                      href={`/create/new?edit=${config.key}`}
                      variant="outlined"
                      color="inherit"
                      size="sm"
                    >
                      <Trans id="login.chart.edit">Edit</Trans>
                    </Button>
                  ) : null}
                </HintWarning>
              </Box>
            )}
            <Box ref={chartWrapperRef}>
              <ConfiguratorStateProvider
                chartId="published"
                initialState={state}
              >
                <ChartPublished configKey={key} embedParams={embedParams} />
              </ConfiguratorStateProvider>
            </Box>
            <Typography
              variant="body2"
              component="div"
              my={6}
              color="monochrome.700"
            >
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
              <NextLink href="/create/new" passHref legacyBehavior>
                <Button>
                  <Trans id="button.new.visualization">
                    Create a new visualization
                  </Trans>
                </Button>
              </NextLink>
              <NextLink
                href={{ pathname: "/create/new", query: { copy: key } }}
                passHref
                legacyBehavior
              >
                <Button>
                  <Trans id="button.copy.visualization">
                    Copy and edit this visualization
                  </Trans>
                </Button>
              </NextLink>
            </Stack>
          </Box>
        </Box>
      </ContentLayout>
    </>
  );
};

export default VisualizationPage;
