import { Trans } from "@lingui/macro";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Box, Button, Typography } from "@mui/material";
import { ChartPanel } from "../../components/chart-panel";
import { ChartPublished } from "../../components/chart-published";
import { Success } from "../../components/hint";
import { ContentLayout } from "../../components/layout";
import { PublishActions } from "../../components/publish-actions";
import Stack from "../../components/Stack";
import { Config } from "../../configurator";
import { getConfig } from "../../db/config";
import { useLocale } from "../../locales/use-locale";

type PageProps =
  | {
      status: "notfound";
    }
  | {
      status: "found";
      config: {
        key: string;
        data: Config;
      };
    };

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const config = await getConfig(query.chartId as string);

  if (config && config.data) {
    // TODO validate configuration
    return { props: { status: "found", config } };
  }

  res.statusCode = 404;

  return { props: { status: "notfound" } };
};

const VisualizationPage = (props: PageProps) => {
  const locale = useLocale();
  const { query } = useRouter();

  if (props.status === "notfound") {
    // TODO: display 404 message
    return <ErrorPage statusCode={404} />;
  }

  const {
    config: {
      key,
      data: { dataSet, meta, chartConfig },
    },
  } = props;
  const publishSuccess = !!query.publishSuccess;

  return (
    <>
      <Head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:title" content={meta.title[locale]} />
        <meta property="og:description" content={meta.description[locale]} />
        {/* og:url is set in _app.tsx */}
      </Head>
      <ContentLayout>
        <Box px={4} bg="muted" mb="auto" mx="auto">
          <Box sx={{ pt: 4, maxWidth: "80rem", margin: "auto" }}>
            {publishSuccess && <Success />}

            <ChartPanel>
              <ChartPublished
                dataSet={dataSet}
                chartConfig={chartConfig}
                meta={meta}
                configKey={key}
              />
            </ChartPanel>

            <PublishActions configKey={key} sx={{ mt: 5, mb: 5 }} />

            <Typography
              component="div"
              variant="h3"
              mt={3}
              mb={4}
              sx={{
                color: "monochrome800",
                fontSize: 5,
                fontFamily: "body",
                fontWeight: "regular",
              }}
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

            <Stack direction="row" spacing={2}>
              <NextLink href="/create/new" passHref>
                <Button component="a" variant="secondary">
                  <Trans id="button.new.visualization">
                    Create a new visualization
                  </Trans>
                </Button>
              </NextLink>
              <NextLink
                href={{ pathname: "/create/new", query: { from: key } }}
                passHref
              >
                <Button component="a" variant="secondary">
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
