import React from "react";
import { Flex, Text } from "rebass";
import { AttributeWithMeta, DimensionWithMeta } from "../domain";
import { useConfiguratorState } from "../domain/configurator-state";
import { useDataSetAndMetadata } from "../domain/data-cube";
import { useLocale } from "../lib/use-locale";
import { ChartAreasVisualization } from "./chart-areas";
import { ChartColumnsVisualization } from "./chart-columns";
import { ChartFootnotes } from "./chart-footnotes";
import { ChartLinesVisualization } from "./chart-lines";
import { ChartScatterplotVisualization } from "./chart-scatterplot";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";

export const ChartPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const [state] = useConfiguratorState();

  const { data: metaData } = useDataSetAndMetadata(dataSetIri);

  const locale = useLocale();

  if (metaData) {
    const { dimensions, measures, dataSet, componentsByIri } = metaData;

    return (
      <Flex
        p={5}
        flexDirection="column"
        justifyContent="space-between"
        sx={{ height: "100%", color: "monochrome.800" }}
      >
        {(state.state === "SELECTING_CHART_TYPE" ||
          state.state === "CONFIGURING_CHART" ||
          state.state === "DESCRIBING_CHART" ||
          state.state === "PUBLISHING") && (
          <>
            <Text variant="heading2" mb={2}>
              {state.meta.title[locale] === "" ? (
                <Trans id="annotation.add.title">
                  [You can add a title here]
                </Trans> // dataSet.label.value
              ) : (
                state.meta.title[locale]
              )}
            </Text>
            <Text variant="paragraph1" mb={2}>
              {state.meta.description[locale] === "" ? (
                <Trans id="annotation.add.description">
                  [You can add a description here]
                </Trans> // dataSet.extraMetadata.get("description")!.value
              ) : (
                state.meta.description[locale]
              )}
            </Text>
            {/* // FIXME: we shouldn't need this condition because the states must be these */}
            {state.chartConfig.chartType === "column" && (
              <ChartColumnsVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "line" && (
              <ChartLinesVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "area" && (
              <ChartAreasVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "scatterplot" && (
              <ChartScatterplotVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                chartConfig={state.chartConfig}
              />
            )}
          </>
        )}

        {state.state !== "INITIAL" && state.chartConfig && (
          <ChartFootnotes
            source={dataSet.extraMetadata.get("contact")!.value} // FIXME: use "source" instead of "contact" when the API is fixed
            dataSetName={dataSet.label.value}
            filters={state.chartConfig.filters}
            componentsByIri={
              componentsByIri as Record<
                string,
                DimensionWithMeta | AttributeWithMeta
              >
            }
          />
        )}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
