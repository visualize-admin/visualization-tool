import { Flex, Text } from "@theme-ui/components";
import { ChartConfig, Meta } from "../configurator";
import { useLocale } from "../lib/use-locale";
import { ChartAreasVisualization } from "./chart-areas";
import { ChartColumnsVisualization } from "./chart-columns";
import { ChartBarsVisualization } from "./chart-bars";
import { ChartFootnotes } from "./chart-footnotes";
import { ChartLinesVisualization } from "./chart-lines";
import { ChartScatterplotVisualization } from "./chart-scatterplot";
import { ChartPieVisualization } from "./chart-pie";

export const ChartPublished = ({
  dataSet,
  meta,
  chartConfig,
  configKey,
}: {
  dataSet: string;
  meta: Meta;
  chartConfig: ChartConfig;
  configKey: string;
}) => {
  const locale = useLocale();

  return (
    <Flex
      p={5}
      sx={{
        flexGrow: 1,
        color: "monochrome800",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {meta.title[locale] !== "" && (
        <Text variant="heading2" mb={2}>
          {meta.title[locale]}
        </Text>
      )}
      {meta.description[locale] && (
        <Text variant="paragraph1" mb={2}>
          {meta.description[locale]}
        </Text>
      )}
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        {chartConfig.chartType === "bar" && (
          <ChartBarsVisualization
            dataSetIri={dataSet}
            chartConfig={chartConfig}
          />
        )}
        {chartConfig.chartType === "column" && (
          <ChartColumnsVisualization
            dataSetIri={dataSet}
            chartConfig={chartConfig}
          />
        )}
        {chartConfig.chartType === "line" && (
          <ChartLinesVisualization
            dataSetIri={dataSet}
            chartConfig={chartConfig}
          />
        )}
        {chartConfig.chartType === "area" && (
          <ChartAreasVisualization
            dataSetIri={dataSet}
            chartConfig={chartConfig}
          />
        )}
        {chartConfig.chartType === "scatterplot" && (
          <ChartScatterplotVisualization
            dataSetIri={dataSet}
            chartConfig={chartConfig}
          />
        )}
        {chartConfig.chartType === "pie" && (
          <ChartPieVisualization
            dataSetIri={dataSet}
            chartConfig={chartConfig}
          />
        )}
      </Flex>
      <ChartFootnotes
        dataSetIri={dataSet}
        chartConfig={chartConfig}
        configKey={configKey}
      />
    </Flex>
  );
};
