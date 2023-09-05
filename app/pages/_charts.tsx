import { Box, Link } from "@mui/material";
import { NextPage } from "next";
import NextLink from "next/link";
import React, { useEffect, useRef, useState } from "react";

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

const useVisible = (
  initialVisible: boolean,
  intersectionRatio: number = 0.25,
  observerOptions?: IntersectionObserverInit
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(initialVisible);
  useEffect(() => {
    const current = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          if (entry.intersectionRatio > intersectionRatio) {
            setVisible(true);
          } else {
            setVisible(false);
          }
        }
      },
      {
        threshold: 0.25,
        ...observerOptions,
      }
    );
    if (current) {
      observer.observe(current);
    }
    return () => {
      observer.disconnect();
    };
  }, [intersectionRatio, observerOptions]);
  return [ref, visible] as const;
};

const useHasBeenVisible = (...options: Parameters<typeof useVisible>) => {
  const [ref, visible] = useVisible(...options);
  const hasBeenVisible = useRef(visible);
  hasBeenVisible.current = hasBeenVisible.current || visible;
  return [ref, hasBeenVisible.current] as const;
};

export const HiddenUntilScrolledTo = ({
  children,
  initialVisible = false,
  fallback,
}: {
  children: React.ReactNode;
  initialVisible?: boolean;
  fallback: React.ReactNode;
}) => {
  const [ref, hasBeenVisible] = useHasBeenVisible(initialVisible);
  return <div ref={ref}>{hasBeenVisible ? children : fallback}</div>;
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
            {configs.map(
              (
                { key, data: { dataSet, dataSource, chartConfigs, meta } },
                i
              ) => {
                return chartConfigs.map((d) => (
                  <Box
                    key={key}
                    id={`chart-${key}`}
                    sx={{ width: ["100%", "50%", "50%", "33.33%"], p: 1 }}
                  >
                    <ChartPanelPublished chartType={d.chartType}>
                      <HiddenUntilScrolledTo
                        initialVisible={i < 5}
                        fallback={<div>Loading...</div>}
                      >
                        <ChartPublished
                          dataSet={dataSet}
                          dataSource={dataSource}
                          chartConfig={d}
                          meta={meta}
                          configKey={key}
                        />
                      </HiddenUntilScrolledTo>
                      <Box
                        mb={2}
                        mx={4}
                        mr={6}
                        textAlign="right"
                        typography="caption"
                      >
                        Id: {key} -{" "}
                        <NextLink href={`/v/${key}`} passHref>
                          <Link color="primary">Open</Link>
                        </NextLink>{" "}
                      </Box>
                    </ChartPanelPublished>
                  </Box>
                ));
              }
            )}
          </Flex>
        </Box>
      </ContentLayout>
    </>
  );
};

export default Page;
