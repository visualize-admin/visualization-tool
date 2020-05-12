import { Box, Flex, Text } from "@theme-ui/components";
import React from "react";
import { ChartPublished } from "../chart-published";
import { HomepageSection } from "./generic";

export const Examples = ({
  headline,
  example1Headline,
  example1Description,
  example2Headline,
  example2Description,
  example3Headline,
  example3Description,
}: {
  headline: string;
  example1Headline: string;
  example1Description: string;
  example2Headline: string;
  example2Description: string;
  example3Headline?: string;
  example3Description?: string;
}) => {
  return (
    <Box
      sx={{
        maxWidth: 1024,
        margin: [0, 0, "0 auto"],
        p: 4,
        color: "monochrome800",
      }}
    >
      <HomepageSection>{headline}</HomepageSection>
      <Example headline={example1Headline} description={example1Description}>
        <ChartPublished
          dataSet="http://environment.ld.admin.ch/foen/px/0703010000_102/dataset"
          meta={{
            title: {
              de: "",
              fr: "",
              it: "",
              en: "",
            },
            description: {
              de: " ",
              fr: " ",
              it: " ",
              en: " ",
            },
          }}
          chartConfig={{
            chartType: "column",
            fields: {
              x: {
                componentIri:
                  "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/0",
              },
              y: {
                componentIri:
                  "http://environment.ld.admin.ch/foen/px/0703010000_102/measure/0",
              },
              segment: {
                componentIri:
                  "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/1",
                type: "stacked",
                palette: "dark2",
              },
            },
            filters: {
              "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/0": {
                type: "multi",
                values: {
                  "1980": true,
                  "1985": true,
                  "1990": true,
                  "1995": true,
                  "2000": true,
                  "2005": true,
                  "2010": true,
                  "2015": true,
                },
              },
              "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/1": {
                type: "multi",
                values: {
                  "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/1/0": true,
                },
              },
              "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/2": {
                type: "single",
                value:
                  "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/2/0",
              },
              "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/3": {
                type: "single",
                value:
                  "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/3/0",
              },
              "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/4": {
                type: "single",
                value:
                  "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/4/0",
              },
            },
          }}
          configKey={""}
        />
      </Example>
      <Example
        headline={example2Headline}
        description={example2Description}
        reverse
      >
        <ChartPublished
          dataSet="http://environment.ld.admin.ch/foen/px/0703030000_122/dataset"
          meta={{
            title: {
              de: "",
              fr: "",
              it: "",
              en: "",
            },
            description: {
              de: " ",
              fr: " ",
              it: " ",
              en: " ",
            },
          }}
          chartConfig={{
            chartType: "area",
            fields: {
              x: {
                componentIri:
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/0",
              },
              y: {
                componentIri:
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/measure/0",
              },
              segment: {
                componentIri:
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1",
                palette: "set2",
              },
            },
            filters: {
              "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1": {
                type: "multi",
                values: {
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1/1": true,
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1/2": true,
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1/3": true,
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1/4": true,
                },
              },
              "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/2": {
                type: "single",
                value:
                  "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/2/0",
              },
            },
          }}
          configKey={""}
        />
      </Example>
      {example3Headline && example3Description && (
        <Example
          headline={example3Headline}
          description={example3Description}
        ></Example>
      )}
    </Box>
  );
};

const Example = ({
  headline,
  description,
  reverse,
  children,
}: {
  headline: string;
  description: string;
  reverse?: boolean;
  children?: React.ReactNode;
}) => (
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
      <Text
        sx={{
          fontSize: [5, 5, 6],
          lineHeight: 1.5,
          fontFamily: "body",
          fontWeight: "bold",
          mb: [2, 2, 4],
        }}
      >
        {headline}
      </Text>
      <Text
        sx={{
          fontSize: 4,
          lineHeight: 1.5,
          fontFamily: "body",
          mt: 4,
          mb: [2, 2, 0],
        }}
      >
        {description}
      </Text>
    </Box>
    <Box
      sx={{
        order: reverse ? 1 : 2,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome300",
        boxShadow: "primary",
        width: ["100%", "100%", "50%"],
        mt: 2,
        minWidth: 0,
        maxWidth: ["unset", "unset", 512],
      }}
    >
      {children}
    </Box>
  </Flex>
);
