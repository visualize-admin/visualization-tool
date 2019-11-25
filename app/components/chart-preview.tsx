import React from "react";
import { Flex, Text } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { useDataSetAndMetadata } from "../domain/data-cube";

import { Loading } from "./hint";
import { ChartColumnsVisualization } from "./chart-columns";
import { ChartLinesVisualization } from "./chart-lines";
import { ChartAreasVisualization } from "./chart-areas";
import { ChartScatterplotVisualization } from "./chart-scatterplot";
import { useLocale } from "../lib/use-locale";
import { Trans } from "@lingui/macro";

export const ChartPreview = ({ dataSetIri }: { dataSetIri: string }) => {
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
        <Text
          variant="meta"
          mt={4}
          sx={{
            color: "monochrome.600",
            alignSelf: "flex-end"
          }}
        >
          <Trans>Source</Trans>
          {`: ${
            // FIXME: use "source" instead of "contact" when the API is fixed
            dataSet.extraMetadata.get("contact")!.value
          }`}
        </Text>
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
