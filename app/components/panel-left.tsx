import React from "react";
import { useConfiguratorState } from "../domain/configurator-state";
import { ChartAnnotator } from "./chart-annotator";
import { ChartConfigurator } from "./chart-configurator";
import { ChartTypeSelector } from "./chart-type-selector";
import { DataSetList } from "./dataset-selector";

export const PanelLeft = () => {
  const [state] = useConfiguratorState();

  return (
    <>
      {state.state === "SELECTING_DATASET" ? (
        <DataSetList />
      ) : (
        <>
          {state.state === "SELECTING_CHART_TYPE" && (
            <ChartTypeSelector state={state} />
          )}
          {state.state === "CONFIGURING_CHART" && (
            <ChartConfigurator state={state} />
          )}
          {state.state === "DESCRIBING_CHART" && (
            <ChartAnnotator state={state} />
          )}
        </>
      )}
    </>
  );
};
