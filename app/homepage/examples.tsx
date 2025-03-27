import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { Box, Card, Skeleton, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useClient } from "urql";

import { ChartPublished } from "@/components/chart-published";
import { EmbedQueryParams } from "@/components/embed-params";
import { LoadingDataError } from "@/components/hint";
import { ConfiguratorState } from "@/configurator";
import { getExampleState1, getExampleState2 } from "@/homepage/constants";
import { HomepageSectionTitle } from "@/homepage/generic";
import { ConfiguratorStateProvider } from "@/src";
import { upgradeConfiguratorState } from "@/utils/chart-config/upgrade-cube";
import { useFetchData } from "@/utils/use-fetch-data";

export const Examples = ({
  headline,
  example1Headline,
  example1Description,
  example2Headline,
  example2Description,
}: {
  headline: string;
  example1Headline: string;
  example1Description: string;
  example2Headline: string;
  example2Description: string;
}) => {
  const [state1, setState1] = useState<ConfiguratorState>();
  const [state2, setState2] = useState<ConfiguratorState>();

  useEffect(() => {
    const run = async () => {
      (await Promise.all([getExampleState1(), getExampleState2()])).forEach(
        (state, i) => {
          i === 0 ? setState1(state) : setState2(state);
        }
      );
    };

    run();
  }, []);

  return (
    <Box sx={{ backgroundColor: "background.paper" }}>
      <ContentWrapper sx={{ py: 20 }}>
        <div style={{ width: "100%" }}>
          <HomepageSectionTitle>{headline}</HomepageSectionTitle>
          <Box
            sx={(t) => ({
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "subgrid",
              columnGap: 12,
              [t.breakpoints.up("md")]: {
                gridTemplateColumns: "1fr 1fr",
              },
            })}
          >
            <Example
              queryKey="example1"
              configuratorState={state1}
              headline={example1Headline}
              description={example1Description}
            />
            <Example
              queryKey="example2"
              configuratorState={state2}
              headline={example2Headline}
              description={example2Description}
            />
          </Box>
        </div>
      </ContentWrapper>
    </Box>
  );
};

const Example = ({
  queryKey,
  configuratorState,
  headline,
  description,
}: {
  queryKey: string;
  configuratorState?: ConfiguratorState;
  headline: string;
  description: string;
}) => {
  const client = useClient();
  const { data, error } = useFetchData({
    queryKey: [queryKey, configuratorState ? "A" : "B"],
    queryFn: () => {
      return upgradeConfiguratorState(configuratorState!, {
        client,
        dataSource: configuratorState!.dataSource,
      });
    },
    options: { pause: !configuratorState },
  });

  return data ? (
    <ConfiguratorStateProvider chartId="published" initialState={data}>
      <ExampleCard headline={headline} description={description}>
        <ChartPublished
          embedParams={{ removeBorder: true } as EmbedQueryParams}
        />
      </ExampleCard>
    </ConfiguratorStateProvider>
  ) : error ? (
    <Box sx={{ mb: 6 }}>
      <LoadingDataError />
    </Box>
  ) : (
    <Skeleton variant="rectangular" height={400} />
  );
};

const ExampleCard = ({
  children,
  headline,
  description,
}: {
  children?: ReactNode;
  headline: string;
  description: string;
}) => {
  return (
    <Card
      sx={{
        display: "grid",
        gridTemplateRows: "subgrid",
        gridRow: "span 2",
      }}
    >
      <div>{children}</div>
      <Box sx={{ px: 7, py: 11 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold" }}>
          {headline}
        </Typography>
        <Typography variant="body2" sx={{ mt: 4 }}>
          {description}
        </Typography>
      </Box>
    </Card>
  );
};
