import { Trans } from "@lingui/macro";
import { Flex, Text } from "@theme-ui/components";
import React from "react";
import { useConfiguratorState } from "../configurator";
import { useLocale } from "../locales/use-locale";
import { ChartAreasVisualization } from "./chart-areas";
import { ChartColumnsVisualization } from "./chart-columns";
import { ChartFootnotes } from "./chart-footnotes";
import { ChartLinesVisualization } from "./chart-lines";
import { ChartScatterplotVisualization } from "./chart-scatterplot";
import { ChartPieVisualization } from "./chart-pie";
import { ChartBarsVisualization } from "./chart-bars";

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
        color: "monochrome800",
      }}
    >
      {(state.state === "SELECTING_CHART_TYPE" ||
        state.state === "CONFIGURING_CHART" ||
        state.state === "DESCRIBING_CHART" ||
        state.state === "PUBLISHING") && (
        <>
          <Text
            variant="heading2"
            sx={{
              mb: 2,
              color: state.meta.title[locale] === "" ? "monochrome500" : "text",
            }}
          >
            {state.meta.title[locale] === "" ? (
              <Trans id="annotation.add.title">
                [You can add a title here]
              </Trans> // dataSet.label.value
            ) : (
              state.meta.title[locale]
            )}
          </Text>
          <Text
            variant="paragraph1"
            sx={{
              mb: 2,
              color:
                state.meta.description[locale] === ""
                  ? "monochrome500"
                  : "text",
            }}
          >
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
              flexGrow: 1,
            }}
          >
            {/* // FIXME: we shouldn't need this condition because the states must be these */}
            {state.chartConfig.chartType === "column" && (
              <ChartColumnsVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "bar" && (
              <ChartBarsVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "line" && (
              <ChartLinesVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "area" && (
              <ChartAreasVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "scatterplot" && (
              <ChartScatterplotVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
            {state.chartConfig.chartType === "pie" && (
              <ChartPieVisualization
                dataSetIri={dataSetIri}
                chartConfig={state.chartConfig}
              />
            )}
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
