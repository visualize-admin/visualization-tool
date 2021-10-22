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
              de: "Anteil der Personen mit schädlichem oder lästigem Verkehrslärm am Wohnort, in der Schweiz, 2015",
              fr: "Proportion des personnes exposées à leur domicile à un bruit nuisible ou incommodant dû au trafic, en Suisse, en 2015",
              it: "Percentuale di persone esposte, al loro domicilio, a rumore dannoso o molesto generato dal traffico, in Svizzera, nel 2015",
              en: "Proportion of people exposed at home to harmful or disturbing levels of traffic noise, in Switzerland, 2015",
            },
          }}
          chartConfig={{
            chartType: "column",
            fields: {
              x: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0037/verkehrsart",
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
                    "#1f77b4",
                  "https://environment.ld.admin.ch/foen/ubd0037/periode/N":
                    "#ff7f0e",
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
                  "https://environment.ld.admin.ch/foen/ubd0037/beurteilung",
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
          dataSet="https://environment.ld.admin.ch/foen/ubd0104/3/"
          meta={{
            title: {
              de: "E. coli und Enterokokken in Badegewässern",
              fr: "E. coli et entérocoques dans les eaux de baignade",
              it: "E. coli ed enterococchi nelle acque di balneazione",
              en: "E. coli and enterococci in Bathing water",
            },
            description: {
              de: "Konzentration von Escherichia coli und intestinalen Enterokokken an Badestellen, nach Beobachtungsprogramm, 2018",
              fr: "Concentration en Escherichia coli et entérocoques intestinaux dans les sites de baignade, par programme d’observation, en 2018",
              it: "Concentrazione di Escherichia coli ed enterococchi intestinali nei siti di balneazione, per programma di osservazione, nel 2018",
              en: "Concentration of Escherichia coli and intestinal enterococci at bathing sites, by monitoring programme, 2018",
            },
          }}
          chartConfig={{
            chartType: "area",
            fields: {
              x: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing",
                sorting: {
                  sortingType: "byDimensionLabel",
                  sortingOrder: "asc",
                },
              },
              y: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0104/value",
              },
              segment: {
                componentIri:
                  "https://environment.ld.admin.ch/foen/ubd0104/station",
                palette: "category10",
                type: "grouped",
                sorting: {
                  sortingType: "byDimensionLabel",
                  sortingOrder: "asc",
                },
                colorMapping: {
                  "https://environment.ld.admin.ch/foen/ubd0104/Station/CH24001":
                    "#ff7f0e",
                  "https://environment.ld.admin.ch/foen/ubd0104/Station/CH24002":
                    "#1f77b4",
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
                componentIri: "",
                presets: {
                  type: "range",
                  from: "2007-05-20T22:00:00.000Z",
                  to: "2020-09-27T22:00:00.000Z",
                },
              },
              dataFilters: {
                active: true,
                componentIris: [
                  "https://environment.ld.admin.ch/foen/ubd0104/parametertype",
                ],
              },
            },
            filters: {
              "https://environment.ld.admin.ch/foen/ubd0104/dateofprobing": {
                type: "range",
                from: "2018-01-01",
                to: "2018-12-31",
              },
              "https://environment.ld.admin.ch/foen/ubd0104/parametertype": {
                type: "single",
                value: "E.coli",
              },
              "https://environment.ld.admin.ch/foen/ubd0104/station": {
                type: "multi",
                values: {
                  "https://environment.ld.admin.ch/foen/ubd0104/Station/CH24002":
                    true,
                  "https://environment.ld.admin.ch/foen/ubd0104/Station/CH24001":
                    true,
                },
              },
              "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm":
                {
                  type: "single",
                  value: "BAQUA_BE",
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
