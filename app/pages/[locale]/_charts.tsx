import { Box, Flex } from "@theme-ui/components";
import "isomorphic-unfetch";
import { NextPage } from "next";
import { ChartPublished } from "../../components/chart-published";
import { ContentLayout } from "../../components/layout";
import { Config } from "../../domain/config-types";

type PageProps = {
  configs: {
    key: string;
    data: Config;
  }[];
};

const Page: NextPage<PageProps> = ({ configs }) => {
  return (
    <>
      <ContentLayout homepage={false}>
        <Box px={4} bg="muted" mb="auto">
          <Flex sx={{ pt: 4, flexWrap: "wrap" }}>
            {configs.map(({ key, data: { dataSet, chartConfig, meta } }) => {
              return (
                <Box
                  // variant="container.chart"
                  key={key}
                  sx={{ width: ["100%", "50%"] }}
                >
                  <Flex variant="container.chart" sx={{m: 2}}>
                    <ChartPublished
                      dataSet={dataSet}
                      chartConfig={chartConfig}
                      meta={meta}
                    />
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </ContentLayout>
    </>
  );
};

Page.getInitialProps = async ({ req, res }) => {
  const uri = res
    ? `http://localhost:${process.env.PORT || 3000}/api/config/all`
    : `/api/config/all`;
  const configs = await fetch(uri).then(result => result.json());
  return {
    configs: configs.filter((c: $Unexpressable) => c.data && c.data.meta)
  };
};

export default Page;
