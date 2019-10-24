import React from "react";
import { Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import {
  getCategoricalDimensions,
  getTimeDimensions,
  useDataSetAndMetadata
} from "../domain/data-cube";
import { ChartAreasControls } from "./cockpit-chart-areas";
import { ChartBarsControls } from "./cockpit-chart-bars";
import { ChartLinesControls } from "./cockpit-chart-lines";
import { ChartScatterplotControls } from "./cockpit-chart-scatterplot";
import { Loading } from "./hint";

export const ChartConfigurator = ({
  chartId,
  dataSetIri
}: {
  chartId: string;
  dataSetIri: string;
}) => {
  const [state] = useConfiguratorState();

  const meta = useDataSetAndMetadata(dataSetIri);

  if (meta.state === "loaded") {
    const { dimensions, measures } = meta.data;

    const timeDimensions = getTimeDimensions(dimensions);
    const categoricalDimensions = getCategoricalDimensions(dimensions);
    const measuresDimensions = measures;
    return (
      <Flex flexDirection="column">
        {state.state === "CONFIGURING_CHART" &&
          state.chartConfig.chartType === "column" && (
            <ChartBarsControls
              chartId={chartId}
              timeDimensions={timeDimensions}
              categoricalDimensions={categoricalDimensions}
              measuresDimensions={measuresDimensions}
            />
          )}
        {state.state === "CONFIGURING_CHART" &&
          state.chartConfig.chartType === "line" && (
            <ChartLinesControls
              chartId={chartId}
              timeDimensions={timeDimensions}
              categoricalDimensions={categoricalDimensions}
              measuresDimensions={measuresDimensions}
            />
          )}
        {state.state === "CONFIGURING_CHART" &&
          state.chartConfig.chartType === "area" && (
            <ChartAreasControls
              chartId={chartId}
              timeDimensions={timeDimensions}
              categoricalDimensions={categoricalDimensions}
              measuresDimensions={measuresDimensions}
            />
          )}
        {state.state === "CONFIGURING_CHART" &&
          state.chartConfig.chartType === "scatterplot" && (
            <ChartScatterplotControls
              chartId={chartId}
              measuresDimensions={measuresDimensions}
            />
          )}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
