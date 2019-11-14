import React from "react";
import { Flex, Text } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { useDataSetAndMetadata } from "../domain/data-cube";

import { Loading } from "./hint";
import { ChartBarsVisualization } from "./chart-bars";
import { ChartLinesVisualization } from "./chart-lines";
import { ChartAreasVisualization } from "./chart-areas";
import { ChartScatterplotVisualization } from "./chart-scatterplot";
import { useLocale } from "../lib/use-locale";

export const ChartPreview = ({
  chartId,
  dataSetIri
}: {
  chartId: string;
  dataSetIri: string;
}) => {
  const [state] = useConfiguratorState();

  const meta = useDataSetAndMetadata(dataSetIri);

  const locale = useLocale();

  if (meta.state === "loaded") {
    const { dimensions, measures, dataSet } = meta.data;
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
          state.state === "PUBLISHED") && (
          <>
            <Text variant="heading2" mb={2}>
              {state.meta.title[locale] === ""
                ? dataSet.labels[0].value
                : state.meta.title[locale]}
            </Text>
            <Text variant="paragraph1" mb={2}>
              {state.meta.description[locale] === ""
                ? dataSet.extraMetadata.get("description")!.value
                : state.meta.description[locale]}
            </Text>
            {/* // FIXME: we shouldn't need this condition because the states must be these */}
            {state.chartConfig.chartType === "column" && (
              <ChartBarsVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                fields={{
                  xField: state.chartConfig.x,
                  heightField: state.chartConfig.height,
                  groupByField: state.chartConfig.color
                }}
                palette={state.chartConfig.palette}
              />
            )}
            {state.chartConfig.chartType === "line" && (
              <ChartLinesVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                fields={{
                  xField: state.chartConfig.x,
                  heightField: state.chartConfig.height,
                  groupByField: state.chartConfig.color
                }}
                palette={state.chartConfig.palette}
              />
            )}
            {state.chartConfig.chartType === "area" && (
              <ChartAreasVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                fields={{
                  xField: state.chartConfig.x,
                  heightField: state.chartConfig.height,
                  groupByField: state.chartConfig.color
                }}
                palette={state.chartConfig.palette}
              />
            )}
            {state.chartConfig.chartType === "scatterplot" && (
              <ChartScatterplotVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                fields={{
                  xField: state.chartConfig.x,
                  yField: state.chartConfig.y,
                  groupByField: state.chartConfig.color,
                  labelField: state.chartConfig.label
                }}
                palette={state.chartConfig.palette}
              />
            )}
          </>
        )}
        <Text
          variant="meta"
          mt={4}
          sx={{
            color: "monochrome.600",
            alignSelf: "flex-end"
          }}
        >{`Quelle: ${dataSet.extraMetadata.get("source")!.value}`}</Text>
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
