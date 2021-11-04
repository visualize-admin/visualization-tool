import { ReactNode } from "react";
import { Box, Flex, Text } from "theme-ui";
import { ChartPublished } from "../components/chart-published";
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
          dataSet="https://environment.ld.admin.ch/foen/ubd0037/3/"
          meta={{
            title: {
              de: "Lärmbelastung durch Verkehr",
              fr: "Exposition au bruit du trafic",
              it: "Esposizione al rumore del traffico",
              en: "Traffic noise pollution",
            },
            description: {
              de: "",
              fr: "",
              it: "",
              en: "",
            },
          }}
          chartConfig={{
            chartType: "column",
            fields: {
              x: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0037/verkehrsart",
                sorting: {
                  sortingType: "byMeasure",
                  sortingOrder: "desc",
                },
              },
              y: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0037/wert",
              },
              segment: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0037/periode",
                palette: "category10",
                type: "grouped",
                sorting: {
                  sortingType: "byDimensionLabel",
                  sortingOrder: "asc",
                },
                colorMapping: {
                  "https://environment.ld.admin.ch/foen/ubd0037/periode/D":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0037/periode/N":
                    "#1f77b4",
                },
              },
            },
            interactiveFiltersConfig: {
              legend: {
                active: false,
                componentIri: "",
              },
              time: {
                active: false,
                componentIri: "",
                presets: {
                  type: "range",
                  from: "",
                  to: "",
                },
              },
              dataFilters: {
                active: true,
                componentIris: [
                  "https://environment.ld.admin.ch/foen/ubd0037/gemeindetype",
                  "https://environment.ld.admin.ch/foen/ubd0037/laermbelasteteeinheit",
                ],
              },
            },
            filters: {
              "https://environment.ld.admin.ch/foen/ubd0037/referenzjahr": {
                type: "single",
                value: "2015",
              },
              "https://environment.ld.admin.ch/foen/ubd0037/laermbelasteteeinheit":
                {
                  type: "single",
                  value:
                    "https://environment.ld.admin.ch/foen/ubd0037/laermbelasteteEinheit/Pers",
                },
              "https://environment.ld.admin.ch/foen/ubd0037/gemeindetype": {
                type: "single",
                value:
                  "https://environment.ld.admin.ch/foen/ubd0037/gemeindeTyp/CH",
              },
              "https://environment.ld.admin.ch/foen/ubd0037/beurteilung": {
                type: "single",
                value:
                  "https://environment.ld.admin.ch/foen/ubd0037/beurteilung/%3EIGWLSV",
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
          dataSet="https://environment.ld.admin.ch/foen/ubd0066/3/"
          meta={{
            title: {
              de: "Schwermetallbelastung des Bodens",
              fr: "Pollution des sols par les métaux lourds",
              it: "Carico di metalli pesanti nel suolo",
              en: "Heavy metal soil contamination",
            },
            description: {
              de: "",
              fr: "",
              it: "",
              en: "",
            },
          }}
          chartConfig={{
            chartType: "column",
            fields: {
              x: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0066/samplingperiod",
              },
              y: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0066/wert",
              },
              segment: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0066/station",
                palette: "category10",
                type: "grouped",
                sorting: {
                  sortingType: "byDimensionLabel",
                  sortingOrder: "asc",
                },
                colorMapping: {
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/1_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/2_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/3_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/4_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/5_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/6_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/7_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/8_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/9_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/10_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/11_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/12_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/13_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/14_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/15_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/16_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/17_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/18_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/19_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/20_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/21_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/22_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/23_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/24_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/25_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/26_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/27_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/28_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/29_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/30_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/31_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/32_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/33_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/34_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/35_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/36_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/37_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/38_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/39_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/40_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/41_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/42_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/42_2":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/43_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/44_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/45_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/46_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/47_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/48_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/49_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/50_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/51_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/52_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/53_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/54_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/55_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/56_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/57_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/58_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/59_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/59_2":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/60_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/61_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/62_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/63_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/64_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/65_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/66_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/67_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/68_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/69_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/70_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/71_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/72_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/73_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/74_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/75_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/76_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/77_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/78_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/79_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/80_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/81_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/82_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/83_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/84_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/85_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/86_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/87_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/88_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/89_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/90_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/91_1":
                    "#bcbd22",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/92_1":
                    "#17becf",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/92_2":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/93_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/94_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/95_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/96_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/97_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/98_1":
                    "#e377c2",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/99_1":
                    "#7f7f7f",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/100_1":
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/101_1":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/102_1":
                    "#2ca02c",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/103_1":
                    "#d62728",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/104_1":
                    "#9467bd",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/105_1":
                    "#8c564b",
                  "https://environment.ld.admin.ch/foen/ubd0066/Station/106_1":
                    "#e377c2",
                },
              },
            },
            interactiveFiltersConfig: {
              legend: {
                active: true,
                componentIri: "",
              },
              time: {
                active: false,
                presets: {
                  to: "",
                  from: "",
                  type: "range",
                },
                componentIri: "",
              },
              dataFilters: {
                active: true,
                componentIris: [
                  "https://environment.ld.admin.ch/foen/ubd0066/messparameter",
                ],
              },
            },
            filters: {
              "https://environment.ld.admin.ch/foen/ubd0066/landuse": {
                type: "single",
                value:
                  "https://environment.ld.admin.ch/foen/ubd0066/Landuse/10",
              },
              "https://environment.ld.admin.ch/foen/ubd0066/messparameter": {
                type: "single",
                value: "https://ld.admin.ch/cube/dimension/el01/cu",
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
  children?: ReactNode;
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
        as="h3"
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
        as="p"
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
