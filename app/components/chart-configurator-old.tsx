import React from "react";
import { Flex } from "rebass";
import { getCategoricalDimensions, getTimeDimensions } from "../domain/data";
import { useDataSetAndMetadata } from "../domain/data-cube";
import { ChartAreasControls } from "./chart-areas-controls";
import { ChartColumnsControls } from "./chart-columns-controls";
import { ChartLinesControls } from "./chart-lines-controls";
import { ChartScatterplotControls } from "./chart-scatterplot-controls";
import { Loading } from "./hint";
import { ConfiguratorStateConfiguringChart } from "../domain";

export const ChartConfigurator = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const meta = useDataSetAndMetadata(state.dataSet);

  if (meta.state === "loaded") {
    const { dimensions, measures } = meta.data;

    const timeDimensions = getTimeDimensions(dimensions);
    const categoricalDimensions = getCategoricalDimensions(dimensions);
    const measuresDimensions = measures;
    return (
      <Flex flexDirection="column">
        {state.chartConfig.chartType === "column" && (
          <ChartColumnsControls
            timeDimensions={timeDimensions}
            categoricalDimensions={categoricalDimensions}
            measuresDimensions={measuresDimensions}
          />
        )}
        {state.chartConfig.chartType === "line" && (
          <ChartLinesControls
            timeDimensions={timeDimensions}
            categoricalDimensions={categoricalDimensions}
            measuresDimensions={measuresDimensions}
          />
        )}
        {state.chartConfig.chartType === "area" && (
          <ChartAreasControls
            timeDimensions={timeDimensions}
            categoricalDimensions={categoricalDimensions}
            measuresDimensions={measuresDimensions}
          />
        )}
        {state.chartConfig.chartType === "scatterplot" && (
          <ChartScatterplotControls
            timeDimensions={timeDimensions}
            measuresDimensions={measuresDimensions}
            categoricalDimensions={categoricalDimensions}
          />
        )}
      </Flex>
    );
  } else {
    return <Loading />;
  }
};
