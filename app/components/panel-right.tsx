import React from "react";
import { Box } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ChartFilters } from "./chart-filters";

export const PanelRight = ({ chartId }: { chartId: string }) => {
  const [state] = useConfiguratorState();

  return (
    <Box as="section" data-name="panel-right" variant="container.right">
      {state.state === "CONFIGURING_CHART" && (
        <ChartFilters chartId={chartId} dataSetIri={state.dataSet} />
      )}
    </Box>
  );
};
