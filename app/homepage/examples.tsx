import { Box, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode, useEffect, useState } from "react";
import { useClient } from "urql";

import { ChartPublished } from "@/components/chart-published";
import Flex from "@/components/flex";
import { LoadingDataError } from "@/components/hint";
import { ConfiguratorState } from "@/configurator";
import { getExampleState1, getExampleState2 } from "@/homepage/constants";
import { HomepageSectionTitle } from "@/homepage/generic";
import { ConfiguratorStateProvider } from "@/src";
import { upgradeConfiguratorState } from "@/utils/chart-config/upgrade-cube";
import { useFetchData } from "@/utils/use-fetch-data";

type ExamplesProps = {
  headline: string;
  example1Headline: string;
  example1Description: string;
  example2Headline: string;
  example2Description: string;
};

export const Examples = (props: ExamplesProps) => {
  const {
    headline,
    example1Headline,
    example1Description,
    example2Headline,
    example2Description,
  } = props;
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

  return state1 && state2 ? (
    <Box
      sx={{
        maxWidth: 1024,
        // To prevent "jumping" of the content when the cube iris are updated
        // (which is super fast, but still noticeable)
        minHeight: "50vh",
        margin: [0, 0, "0 auto"],
        p: 4,
        color: "grey.800",
      }}
    >
      <HomepageSectionTitle>{headline}</HomepageSectionTitle>
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
        reverse
      />
    </Box>
  ) : null;
};

type ExampleProps = {
  queryKey: string;
  configuratorState: ConfiguratorState;
  headline: string;
  description: string;
  reverse?: boolean;
};

const Example = (props: ExampleProps) => {
  const { queryKey, configuratorState, headline, description, reverse } = props;
  const client = useClient();
  const { data, error } = useFetchData({
    queryKey: [queryKey],
    queryFn: () => {
      return upgradeConfiguratorState(configuratorState, {
        client,
        dataSource: configuratorState.dataSource,
      });
    },
  });

  return data ? (
    <ConfiguratorStateProvider chartId="published" initialState={data}>
      <ExampleCard
        headline={headline}
        description={description}
        reverse={reverse}
      >
        <ChartPublished />
      </ExampleCard>
    </ConfiguratorStateProvider>
  ) : error ? (
    <Box sx={{ mb: 6 }}>
      <LoadingDataError />
    </Box>
  ) : null;
};

const useStyles = makeStyles((theme: Theme) => ({
  children: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.grey[300],
    boxShadow: theme.shadows[5],
    marginTop: 2,
    minWidth: 0,
  },
}));

type ExampleCardProps = {
  headline: string;
  description: string;
  reverse?: boolean;
  children?: ReactNode;
};

const ExampleCard = (props: ExampleCardProps) => {
  const { headline, description, reverse, children } = props;
  const classes = useStyles();
  return (
    <Flex
      sx={{
        flexDirection: ["column", "column", "row"],
        justifyContent: ["flex-start", "flex-start", "space-between"],
        alignItems: "center",
        mb: 6,
      }}
    >
      <Box
        sx={{
          order: reverse ? [1, 1, 2] : [2, 2, 1],
          minWidth: 0,
          width: ["100%", "100%", "50%"],
          ml: reverse ? [0, 0, 8] : 0,
          mr: reverse ? 0 : [0, 0, 8],
        }}
      >
        <Typography variant="h3">{headline}</Typography>
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.5,
            mt: 4,
            mb: [2, 2, 0],
          }}
        >
          {description}
        </Typography>
      </Box>
      <Box
        className={classes.children}
        sx={{
          order: reverse ? 1 : 2,
          width: ["100%", "100%", "50%"],
          maxWidth: ["unset", "unset", 512],
        }}
      >
        {children}
      </Box>
    </Flex>
  );
};
