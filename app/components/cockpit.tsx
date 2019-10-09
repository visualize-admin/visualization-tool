import React from "react";
import { Box, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import {
  getCategoricalDimensions,
  getMeasuresDimensions,
  getTimeDimensions,
  useDataSetAndMetadata
} from "../domain/data-cube";
import {
  ChartAreasControls,
  ChartAreasVisualization
} from "./cockpit-chart-areas";
import {
  ChartBarsControls,
  ChartBarsVisualization
} from "./cockpit-chart-bars";
import {
  ChartLinesControls,
  ChartLinesVisualization
} from "./cockpit-chart-lines";
import { Filters } from "./cockpit-filters";
import { Loading } from "./hint";

export const Cockpit = ({
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

    const timeDimensions = getTimeDimensions({ dimensions });
    const categoricalDimensions = getCategoricalDimensions({ dimensions });
    const measuresDimensions = getMeasuresDimensions({ dimensions });

    return (
      <Flex>
        <Box width={1 / 4} px={2}>
          <h4>Grafik Konfigurieren</h4>
          {state.state === "CONFIGURING_CHART" &&
            state.chartConfig.chartType === "bar" && (
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
        </Box>
        <Box width={2 / 4} px={2}>
          {state.state === "CONFIGURING_CHART" &&
            state.chartConfig.chartType === "bar" && (
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
          {state.state === "CONFIGURING_CHART" &&
            state.chartConfig.chartType === "line" && (
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
          {state.state === "CONFIGURING_CHART" &&
            state.chartConfig.chartType === "area" && (
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
        </Box>
        <Box width={1 / 4} px={2}>
          <h4>Filter Daten</h4>
          <Filters
            chartId={chartId}
            dataSet={dataSet}
            dimensions={categoricalDimensions}
          />
        </Box>
      </Flex>
    );
  } else {
    return <Loading>Fetching metadata...</Loading>;
  }
};
