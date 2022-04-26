import { Box, Link } from "@mui/material";
import { NextPage } from "next";
import NextLink from "next/link";

import { ChartPanelPublished } from "@/components/chart-panel";
import { ChartPublished } from "@/components/chart-published";
import Flex from "@/components/flex";
import { ContentLayout } from "@/components/layout";
import { Config } from "@/configurator";
import { getAllConfigs } from "@/db/config";

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
        <Box px={4} sx={{ backgroundColor: "muted.main" }} mb="auto">
          <Flex sx={{ pt: 4, flexWrap: "wrap" }}>
            {configs.map(({ key, data: { dataSet, chartConfig, meta } }) => {
              return (
                <Box
                  key={key}
                  id={`chart-${key}`}
                  sx={{ width: ["100%", "50%", "50%", "33.33%"] }}
                >
                  <ChartPanelPublished chartType={chartConfig.chartType}>
                    <ChartPublished
                      dataSet={dataSet}
                      chartConfig={chartConfig}
                      meta={meta}
                      configKey={key}
                    />
                    <NextLink href={`/v/${key}`}>
                      <Link
                        sx={{
                          background: "transparent",
                          color: "primary",
                          textAlign: "left",

                          lineHeight: ["1rem", "1.125rem", "1.125rem"],
                          fontWeight: "regular",
                          fontSize: ["0.625rem", "0.75rem", "0.75rem"],
                          border: "none",
                          cursor: "pointer",
                          mt: 2,
                          p: 5,
                          ":disabled": {
                            cursor: "initial",
                            color: "grey.500",
                          },
                        }}
                      >
                        →
                      </Link>
                    </NextLink>
                  </ChartPanelPublished>
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
