import { Box, Link } from "@mui/material";
import { NextPage } from "next";
import NextLink from "next/link";
import React, { useEffect, useRef, useState } from "react";
import SuperJSON from "superjson";
import { SuperJSONResult } from "superjson/dist/types";

import { ChartPublished } from "@/components/chart-published";
import Flex from "@/components/flex";
import { ContentLayout } from "@/components/layout";
import {
  Config,
  ConfiguratorStateProvider,
  ConfiguratorStatePublished,
} from "@/configurator";
import { getAllConfigs } from "@/db/config";

type PageProps = {
  serializedConfigs: SuperJSONResult;
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
      serializedConfigs: SuperJSON.serialize(configs.filter((c) => c.data)),
    },
  };
};

const Page: NextPage<PageProps> = ({ serializedConfigs }) => {
  const deserializedConfigs = SuperJSON.deserialize(serializedConfigs) as {
    key: string;
    data: Config;
  }[];

  return (
    <ContentLayout>
      <Box px={4} sx={{ backgroundColor: "muted.main" }} mb="auto">
        <Flex sx={{ pt: 4, flexWrap: "wrap" }}>
          {deserializedConfigs.map((config, i) => {
            return (
              <Box
                key={config.key}
                id={`chart-${config.key}`}
                sx={{ width: ["100%", "50%", "50%", "33.33%"], p: 1 }}
              >
                <ConfiguratorStateProvider
                  chartId="published"
                  initialState={
                    {
                      ...config.data,
                      state: "PUBLISHED",
                    } as ConfiguratorStatePublished
                  }
                >
                  <HiddenUntilScrolledTo
                    initialVisible={i < 5}
                    fallback={<div>Loading...</div>}
                  >
                    <ChartPublished />
                  </HiddenUntilScrolledTo>
                  <Box
                    mb={2}
                    mx={4}
                    mr={6}
                    textAlign="right"
                    typography="caption"
                  >
                    Id: {config.key} -{" "}
                    <NextLink href={`/v/${config.key}`} passHref legacyBehavior>
                      <Link>Open</Link>
                    </NextLink>{" "}
                  </Box>
                </ConfiguratorStateProvider>
              </Box>
            );
          })}
        </Flex>
      </Box>
    </ContentLayout>
  );
};

export default Page;
