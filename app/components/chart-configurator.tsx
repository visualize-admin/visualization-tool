import React from "react";
import { Box, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import {
  getCategoricalDimensions,
  getTimeDimensions,
  useDataSetAndMetadata
} from "../domain/data-cube";
import { ChartAreasControls } from "./cockpit-chart-areas";
import { ChartBarsControls } from "./cockpit-chart-bars";
import { ChartLinesControls } from "./cockpit-chart-lines";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";

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

    const timeDimensions = getTimeDimensions({ dimensions });
    const categoricalDimensions = getCategoricalDimensions({ dimensions });
    const measuresDimensions = measures; // getMeasuresDimensions({ dimensions });
    return (
      <Flex flexDirection="column">
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
      </Flex>
    );
  } else {
    return (
      <Loading>
        <Trans>Metadaten werden herausgeholt...</Trans>
      </Loading>
    );
  }
};

// <Box width={1 / 4} px={2}>
//   <h4>Filter Daten</h4>
//   <Filters
//     chartId={chartId}
//     dataSet={dataSet}
//     dimensions={categoricalDimensions}
//   />
// </Box>
