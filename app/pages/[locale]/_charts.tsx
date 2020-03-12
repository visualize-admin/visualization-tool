import { Box, Flex, Link } from "@theme-ui/components";
import { NextPage } from "next";
import { ChartPublished } from "../../components/chart-published";
import { ContentLayout } from "../../components/layout";
import { Config } from "../../domain/config-types";
import { fetchAllConfigs } from "../../config-api";
import { LocalizedLink } from "../../components/links";

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
                  id={`chart-${key}`}
                  sx={{ width: ["100%", "50%", "50%", "33.33%"] }}
                >
                  <Flex
                    variant="container.chart"
                    sx={{ m: 2, flexDirection: "column" }}
                  >
                    <ChartPublished
                      dataSet={dataSet}
                      chartConfig={chartConfig}
                      meta={meta}
                    />
                    <LocalizedLink
                      pathname={`/[locale]/v/[chartId]`}
                      query={{ chartId: key }}
                    >
                      <Link variant="buttons.downloadButton" sx={{ p: 5 }}>
                        →
                      </Link>
                    </LocalizedLink>
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

export const getServerSideProps = async () => {
  const configs = await fetchAllConfigs();

  return {
    props: {
      configs: configs.filter((c: $Unexpressable) => c.data && c.data.meta)
    }
  };
};

export default Page;
