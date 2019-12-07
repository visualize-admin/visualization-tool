import { Flex, Text } from "rebass";
import { ChartAreasVisualization } from "./chart-areas";
import { ChartColumnsVisualization } from "./chart-columns";
import { ChartFootnotes } from "./chart-footnotes";
import { ChartLinesVisualization } from "./chart-lines";
import { ChartScatterplotVisualization } from "./chart-scatterplot";
import {
  AttributeWithMeta,
  DimensionWithMeta,
  useDataSetAndMetadata
} from "../domain";
import { ChartConfig, Meta } from "../domain/config-types";
import { useLocale } from "../lib/use-locale";

export const ChartPublished = ({
  dataSet,
  meta,
  chartConfig
}: {
  dataSet: string;
  meta: Meta;
  chartConfig: ChartConfig;
}) => {
  const rd = useDataSetAndMetadata(dataSet);
  const locale = useLocale();

  return rd.state === "loaded" ? (
    <Flex
      p={5}
      flexDirection="column"
      justifyContent="space-between"
      sx={{ height: "100%", color: "monochrome.800" }}
    >
      <Text variant="heading2" mb={2}>
        {meta.title[locale] === ""
          ? rd.data.dataSet.label.value
          : meta.title[locale]}
      </Text>
      <Text variant="paragraph1" mb={2}>
        {meta.description[locale] === ""
          ? rd.data.dataSet.extraMetadata.get("description")!.value
          : meta.description[locale]}
      </Text>
      {chartConfig.chartType === "column" && (
        <ChartColumnsVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "line" && (
        <ChartLinesVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "area" && (
        <ChartAreasVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "scatterplot" && (
        <ChartScatterplotVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      <ChartFootnotes
        source={rd.data.dataSet.extraMetadata.get("contact")!.value} // FIXME: use "source" instead of "contact" when the API is fixed
        dataSetName={rd.data.dataSet.label.value}
        filters={chartConfig.filters}
        componentsByIri={
          rd.data.componentsByIri as Record<
            string,
            DimensionWithMeta | AttributeWithMeta
          >
        }
      />
    </Flex>
  ) : null;
};
