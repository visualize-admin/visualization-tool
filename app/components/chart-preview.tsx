import { Trans } from "@lingui/macro";
import React from "react";
import { useConfiguratorState } from "../domain/configurator-state";
import { useDataSetAndMetadata } from "../domain/data-cube";
import { ChartAreasVisualization } from "./cockpit-chart-areas";
import { ChartBarsVisualization } from "./cockpit-chart-bars";
import { ChartLinesVisualization } from "./cockpit-chart-lines";
import { Loading, Hint } from "./hint";

export const ChartPreview = ({
  chartId,
  dataSetIri
}: {
  chartId: string;
  dataSetIri: string;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const meta = useDataSetAndMetadata(dataSetIri);
  console.log("in chart preview");
  if (meta.state === "loaded") {
    const { dimensions, measures, dataSet } = meta.data;
    return (
      <>
        {/* // FIXME: we shouldn't need this condition because the state must be these */}
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
          </>
        )}
      </>
    );
  } else {
    return (
      <Loading>
        <Trans>Metadaten werden herausgeholt...</Trans>
      </Loading>
    );
  }
};
