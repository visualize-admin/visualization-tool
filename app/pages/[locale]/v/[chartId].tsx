import { Trans } from "@lingui/macro";
import { Box, Button, Flex, Text } from "@theme-ui/components";
import "isomorphic-unfetch";
import { NextPage } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import { ChartPublished } from "../../../components/chart-published";
import { Success } from "../../../components/hint";
import { ContentLayout } from "../../../components/layout";
import { LocalizedLink } from "../../../components/links";
import { PublishActions } from "../../../components/publish-actions";
import { Config } from "../../../domain/config-types";
import { useLocale } from "../../../lib/use-locale";
import { fetchConfig } from "../../../config-api";

type PageProps = {
  statusCode?: number;
  config?: {
    key: string;
    data: Config;
  };
  publishSuccess?: string;
};

const Page: NextPage<PageProps> = ({ config, statusCode, publishSuccess }) => {
  const locale = useLocale();
  if (statusCode) {
    // TODO: display 404 message
    return <ErrorPage statusCode={statusCode} />;
  }

  if (config) {
    const { dataSet, meta, chartConfig } = config.data;

    return (
      <>
        <Head>
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:title" content={meta.title[locale]} />
          <meta property="og:description" content={meta.description[locale]} />
          {/* og:url is set in _app.tsx */}
        </Head>
        <ContentLayout homepage={false}>
          <Box px={4} bg="muted" mb="auto">
            <Box sx={{ pt: 4, maxWidth: 696, margin: "auto" }}>
              {publishSuccess && <Success />}

              <Flex variant="container.chart">
                <ChartPublished
                  dataSet={dataSet}
                  chartConfig={chartConfig}
                  meta={meta}
                />
              </Flex>

              <PublishActions configKey={config.key} />

              <Text
                variant="heading3"
                mt={3}
                mb={5}
                sx={{ color: "monochrome800", fontFamily: "body" }}
              >
                {publishSuccess ? (
                  <Trans id="hint.how.to.share">
                    You can share this chart either by sharing its URL or by
                    embedding it on your website. You can also create a new
                    visualization or duplicate the above chart.
                  </Trans>
                ) : (
                  <Trans id="hint.create.your.own.chart">
                    Create your own graphic now! With the visualization tool,
                    you can create your own graphics, based on a large number of
                    Swiss federal data.
                  </Trans>
                )}
              </Text>

              <LocalizedLink
                pathname="/[locale]/create/[chartId]"
                query={{ chartId: "new" }}
                passHref
              >
                <Button as="a" variant="primary" sx={{ mb: 4 }}>
                  <Trans id="button.new.visualization">New Visualization</Trans>
                </Button>
              </LocalizedLink>
              <LocalizedLink
                pathname="/[locale]/create/[chartId]"
                query={{ chartId: "new", from: config.key }}
                passHref
              >
                <Button as="a" variant="outline" sx={{ mb: 4, ml: 4 }}>
                  <Trans id="button.copy.visualization">
                    Copy Visualization
                  </Trans>
                </Button>
              </LocalizedLink>
            </Box>
          </Box>
        </ContentLayout>
      </>
    );
  }

  // Should never happen
  return null;
};

Page.getInitialProps = async ({ req, query, res }) => {
  const config = await fetchConfig(query.chartId as string);
  const publishSuccess = query.publishSuccess as string;
  
  if (config && config.data) {
    // TODO validate configuration
    return { config, publishSuccess };
  }

  if (res) {
    res.statusCode = 404;
  }

  return { statusCode: 404 };
};

export default Page;
