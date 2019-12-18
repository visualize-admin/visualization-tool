import React from "react";
import { Box, Text, Flex } from "rebass";
import { ChartPublished } from "../chart-published";
import { DataCubeProvider } from "../../domain";

export const Examples = ({
  headline,
  example1Headline,
  example1Description,
  example2Headline,
  example2Description,
  example3Headline,
  example3Description
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
    <DataCubeProvider>
      <Box
        maxWidth={1024}
        margin={[0, 0, "0 auto"]}
        p={4}
        color="monochrome.800"
      >
        <Text variant="homepageSection">{headline}</Text>
        <Example headline={example1Headline} description={example1Description}>
          <ChartPublished
            dataSet="http://environment.ld.admin.ch/foen/px/0703010000_102/dataset"
            meta={{
              title: {
                de: "Holzernte der Schweiz (m3)",
                fr: "Récolte de bois en Suisse (m3)",
                it: "Sfruttamento del legname in Svizzera (m3)",
                en: "Wood harvest in Switzerland (m3)"
              },
              description: {
                de: " ",
                fr: " ",
                it: " ",
                en: " "
              }
            }}
            chartConfig={{
              chartType: "column",
              fields: {
                x: {
                  componentIri:
                    "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/0"
                },
                y: {
                  componentIri:
                    "http://environment.ld.admin.ch/foen/px/0703010000_102/measure/0"
                },
                segment: {
                  componentIri:
                    "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/1",
                  type: "stacked",
                  palette: "category10"
                }
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
                    "2015": true
                  }
                },
                "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/1": {
                  type: "multi",
                  values: {
                    "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/1/0": true
                  }
                },
                "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/2": {
                  type: "single",
                  value:
                    "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/2/0"
                },
                "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/3": {
                  type: "single",
                  value:
                    "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/3/0"
                },
                "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/4": {
                  type: "single",
                  value:
                    "http://environment.ld.admin.ch/foen/px/0703010000_102/dimension/4/0"
                }
              }
            }}
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
                de: "Investitionen in den Forstbetrieben (Franken)",
                fr:
                  "Investissements dans les exploitations forestières (Francs)",
                it: "Investimenti nelle imprese forestal",
                en: "Investments in forest enterprises (Francs)"
              },
              description: {
                de: " ",
                fr: " ",
                it: " ",
                en: " "
              }
            }}
            chartConfig={{
              chartType: "area",
              fields: {
                x: {
                  componentIri:
                    "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/0"
                },
                y: {
                  componentIri:
                    "http://environment.ld.admin.ch/foen/px/0703030000_122/measure/0"
                },
                segment: {
                  componentIri:
                    "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1",
                  palette: "category10"
                }
              },
              filters: {
                "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/0": {
                  type: "multi",
                  values: {}
                },
                "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/1": {
                  type: "multi",
                  values: {}
                },
                "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/2": {
                  type: "single",
                  value:
                    "http://environment.ld.admin.ch/foen/px/0703030000_122/dimension/2/0"
                }
              }
            }}
          />
        </Example>
        {example3Headline && example3Description && (
          <Example
            headline={example3Headline}
            description={example3Description}
          ></Example>
        )}
      </Box>
    </DataCubeProvider>
  );
};

const Example = ({
  headline,
  description,
  reverse,
  children
}: {
  headline: string;
  description: string;
  reverse?: boolean;
  children?: React.ReactNode;
}) => (
  <Flex
    flexDirection={["column", "column", "row"]}
    justifyContent={["flex-start", "flex-start", "space-between"]}
    alignItems="center"
    mb={6}
  >
    <Box
      sx={{ order: reverse ? [1, 1, 2] : [2, 2, 1] }}
      ml={reverse ? [0, 0, 8] : 0}
      mr={reverse ? 0 : [0, 0, 8]}
      minWidth={0}
      width={["100%", "100%", "50%"]}
    >
      <Text variant="homepageExampleHeadline">{headline}</Text>
      <Text variant="homepageExampleDescription">{description}</Text>
    </Box>
    <Box
      sx={{
        order: reverse ? 1 : 2,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome.400",
        mt: 2
      }}
      width={["100%", "100%", "50%"]}
      minWidth={0}
      maxWidth={512}
    >
      {children}
    </Box>
  </Flex>
);
