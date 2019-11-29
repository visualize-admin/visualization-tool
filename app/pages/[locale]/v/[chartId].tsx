import "isomorphic-unfetch";
import { NextPage } from "next";
import ErrorPage from "next/error";
import { useDataSetAndMetadata, DataCubeProvider } from "../../../domain";
import { ChartConfig, Config, Meta } from "../../../domain/config-types";
import { ChartColumnsVisualization } from "../../../components/chart-columns";
import { ChartLinesVisualization } from "../../../components/chart-lines";
import { ChartAreasVisualization } from "../../../components/chart-areas";
import { ChartScatterplotVisualization } from "../../../components/chart-scatterplot";
import { Box, Button, Text, Flex } from "rebass";
import { Success } from "../../../components/hint";
import { LocalizedLink } from "../../../components/links";
import { Trans } from "@lingui/macro";
import { Header } from "../../../components/header";
import { PublishActions } from "../../../components/publish-actions";
import { useLocale } from "../../../lib/use-locale";

const DisplayChart = ({
  dataSet,
  meta,
  chartConfig
}: {
  dataSet: string;
  meta: Meta;
  chartConfig: ChartConfig;
}) => {
  const rd = useDataSetAndMetadata(dataSet);
  const locale = useLocale();

  return rd.state === "loaded" ? (
    <Flex
      p={5}
      flexDirection="column"
      justifyContent="space-between"
      sx={{ height: "100%", color: "monochrome.800" }}
    >
      <Text variant="heading2" mb={2}>
        {meta.title[locale] === ""
          ? rd.data.dataSet.labels[0].value
          : meta.title[locale]}
      </Text>
      <Text variant="paragraph1" mb={2}>
        {meta.description[locale] === ""
          ? rd.data.dataSet.extraMetadata.get("description")!.value
          : meta.description[locale]}
      </Text>
      {chartConfig.chartType === "column" && (
        <ChartColumnsVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "line" && (
        <ChartLinesVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "area" && (
        <ChartAreasVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "scatterplot" && (
        <ChartScatterplotVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      <Text
        variant="meta"
        mt={4}
        sx={{
          color: "monochrome.600",
          alignSelf: "flex-end"
        }}
      >
        <Trans>Source</Trans>
        {`: ${
          // FIXME: use "source" instead of "contact" when the API is fixed
          rd.data.dataSet.extraMetadata.get("contact")!.value
        }`}
      </Text>
      <Text
        variant="meta"
        sx={{
          color: "monochrome.600",
          alignSelf: "flex-end"
        }}
      >
        <Trans>Dataset</Trans>
        {`: ${rd.data.dataSet.labels[0].value}`}
      </Text>
    </Flex>
  ) : null;
};

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
              <DisplayChart
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
              <Trans>
                You can share this chart either by sharing its URL or by
                embedding it on your website. You can also create a new
                visualization or duplicate the above chart.
              </Trans>
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
