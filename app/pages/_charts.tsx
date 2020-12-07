import { Box, Flex, Link } from "theme-ui";
import { NextPage } from "next";
import { ChartPanel } from "../components/chart-panel";
import { ChartPublished } from "../components/chart-published";
import { ContentLayout } from "../components/layout";
import { LocalizedLink } from "../components/links";
import { getAllConfigs } from "../db/config";
import { Config } from "../configurator";

type PageProps = {
  configs: {
    key: string;
    data: Config;
  }[];
};

export const getServerSideProps = async () => {
  const configs = await getAllConfigs();

  return {
    props: {
      configs: configs.filter((c: $Unexpressable) => c.data && c.data.meta),
    },
  };
};

const Page: NextPage<PageProps> = ({ configs }) => {
  return (
    <>
      <ContentLayout>
        <Box px={4} bg="muted" mb="auto">
          <Flex sx={{ pt: 4, flexWrap: "wrap" }}>
            {configs.map(({ key, data: { dataSet, chartConfig, meta } }) => {
              return (
                <Box
                  key={key}
                  id={`chart-${key}`}
                  sx={{ width: ["100%", "50%", "50%", "33.33%"] }}
                >
                  <ChartPanel sx={{ m: 2, flexDirection: "column" }}>
                    <ChartPublished
                      dataSet={dataSet}
                      chartConfig={chartConfig}
                      meta={meta}
                      configKey={key}
                    />
                    <LocalizedLink
                      pathname={`/[locale]/v/[chartId]`}
                      query={{ chartId: key }}
                    >
                      <Link
                        sx={{
                          background: "transparent",
                          color: "primary",
                          textAlign: "left",
                          fontFamily: "body",
                          lineHeight: [1, 2, 2],
                          fontWeight: "regular",
                          fontSize: [1, 2, 2],
                          border: "none",
                          cursor: "pointer",
                          mt: 2,
                          p: 5,
                          ":disabled": {
                            cursor: "initial",
                            color: "monochrome500",
                          },
                        }}
                      >
                        →
                      </Link>
                    </LocalizedLink>
                  </ChartPanel>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </ContentLayout>
    </>
  );
};

export default Page;
