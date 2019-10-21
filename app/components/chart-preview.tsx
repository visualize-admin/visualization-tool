import { Trans } from "@lingui/macro";
import React from "react";
import { Flex, Text, Box } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { useDataSetAndMetadata } from "../domain/data-cube";
import { ChartAreasVisualization } from "./cockpit-chart-areas";
import { ChartBarsVisualization } from "./cockpit-chart-bars";
import { ChartLinesVisualization } from "./cockpit-chart-lines";
import { ChartScatterplotVisualization } from "./cockpit-chart-scatterplot";
import { Loading } from "./hint";
export const ChartPreview = ({
  chartId,
  dataSetIri
}: {
  chartId: string;
  dataSetIri: string;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const meta = useDataSetAndMetadata(dataSetIri);

  if (meta.state === "loaded") {
    const { dimensions, measures, dataSet } = meta.data;
    // console.log(dataSet.extraMetadata);
    return (
      <Flex
        p={5}
        flexDirection="column"
        justifyContent="space-between"
        sx={{ height: "100%", color: "monochrome.800" }}
      >
        <Text variant="heading2" mb={2}>
          {dataSet.labels[0].value}
        </Text>
        <Text variant="paragraph1" mb={2}>
          {dataSet.extraMetadata.get("description")!.value}
        </Text>
        {/* // FIXME: we shouldn't need this condition because the states must be these */}
        {(state.state === "SELECTING_CHART_TYPE" ||
          state.state === "CONFIGURING_CHART") && (
          <>
            {state.chartConfig.chartType === "bar" && (
              <ChartBarsVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                xField={state.chartConfig.x}
                groupByField={state.chartConfig.color}
                heightField={state.chartConfig.height}
              />
            )}
            {state.chartConfig.chartType === "line" && (
              <ChartLinesVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                xField={state.chartConfig.x}
                groupByField={state.chartConfig.color}
                heightField={state.chartConfig.height}
              />
            )}
            {state.chartConfig.chartType === "area" && (
              <ChartAreasVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                xField={state.chartConfig.x}
                groupByField={state.chartConfig.color}
                heightField={state.chartConfig.height}
              />
            )}
            {state.chartConfig.chartType === "scatterplot" && (
              <ChartScatterplotVisualization
                dataSet={dataSet}
                dimensions={dimensions}
                measures={measures}
                filters={state.chartConfig.filters}
                xField={state.chartConfig.x}
                yField={state.chartConfig.y}
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
    return (
      <Loading>
        <Trans>Metadaten werden geladen...</Trans>
      </Loading>
    );
  }
};
