import React from "react";
import { Flex, Text } from "@theme-ui/components";
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
import { ChartPieVisualization } from "./chart-pie";

export const ChartPreview = ({ dataSetIri }: { dataSetIri: string }) => {
  const [state] = useConfiguratorState();

  const locale = useLocale();

  return (
    <Flex
      p={5}
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        color: "monochrome800"
      }}
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
          <Flex
            sx={{
              flexDirection: "column",
              justifyContent: "space-between",
              flexGrow: 1
            }}
          >
            {/* // FIXME: we shouldn't need this condition because the states must be these */}
            {state.chartConfig.chartType === "column" && (
              <ChartColumnsVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
            {/* {state.chartConfig.chartType === "column" && (
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
              )} */}
            {state.chartConfig.chartType === "area" && (
              <ChartAreasVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
            {/* {state.chartConfig.chartType === "scatterplot" && (
                <ChartScatterplotVisualization
                  dataSet={dataSet}
                  dimensions={dimensions}
                  measures={measures}
                  chartConfig={state.chartConfig}
                />
              )}
              {state.chartConfig.chartType === "pie" && (
                <ChartPieVisualization
                  dataSet={dataSet}
                  dimensions={dimensions}
                  measures={measures}
                  chartConfig={state.chartConfig}
                />
              )} */}
          </Flex>
        </>
      )}

      {state.state !== "INITIAL" && state.chartConfig && (
        <ChartFootnotes
          dataSetIri={dataSetIri}
          chartConfig={state.chartConfig}
        />
      )}
    </Flex>
  );
};
