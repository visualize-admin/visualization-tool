import { Trans } from "@lingui/macro";
import "isomorphic-unfetch";
import { NextPage } from "next";
import ErrorPage from "next/error";
import { Box, Button, Text } from "rebass";
import { ChartPublished } from "../../../components/chart-published";
import { Header } from "../../../components/header";
import { Success } from "../../../components/hint";
import { LocalizedLink } from "../../../components/links";
import { PublishActions } from "../../../components/publish-actions";
import { DataCubeProvider } from "../../../domain";
import { Config } from "../../../domain/config-types";

type PageProps = {
  statusCode?: number;
  config?: {
    key: string;
    data: Config;
  };
  publishSuccess?: string;
};

const Page: NextPage<PageProps> = ({ config, statusCode, publishSuccess }) => {
  if (statusCode) {
    // TODO: display 404 message
    return <ErrorPage statusCode={statusCode} />;
  }

  if (config) {
    const { dataSet, meta, chartConfig } = config.data;

    return (
      <DataCubeProvider>
        <Header />
        <Box px={4} bg="muted" minHeight="100vh">
          <Box sx={{ pt: 4, maxWidth: 696, margin: "0 auto" }}>
            {publishSuccess && <Success />}

            <Box variant="container.chart">
              <ChartPublished
                dataSet={dataSet}
                chartConfig={chartConfig}
                meta={meta}
              />
            </Box>

            <PublishActions configKey={config.key} />

            <Text
              variant="heading3"
              mt={3}
              mb={5}
              color="monochrome.800"
              fontFamily="frutigerLight"
            >
              {publishSuccess ? (
                <Trans>
                  You can share this chart either by sharing its URL or by
                  embedding it on your website. You can also create a new
                  visualization or duplicate the above chart.
                </Trans>
              ) : (
                <Trans>
                  Create your own graphic now! With the visualization tool, you
                  can create your own graphics, based on a large number of Swiss
                  federal data.
                </Trans>
              )}
            </Text>

            <LocalizedLink
              pathname="/[locale]/chart/[chartId]"
              query={{ chartId: "new" }}
              passHref
            >
              <Button as="a" variant="primary" mb={4}>
                <Trans>New Visualization</Trans>
              </Button>
            </LocalizedLink>
          </Box>
        </Box>
      </DataCubeProvider>
    );
  }

  // Should never happen
  return null;
};

Page.getInitialProps = async ({ req, query, res }) => {
  const uri = res
    ? `http://localhost:${process.env.PORT || 3000}/api/config/${query.chartId}`
    : `/api/config/${query.chartId}`;
  const config = await fetch(uri).then(result => result.json());
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
