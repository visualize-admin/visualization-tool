import { Trans } from "@lingui/macro";
import React from "react";
import { Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { useDataSetAndMetadata } from "../domain/data-cube";
import { Filters } from "./cockpit-filters";
import { Loading } from "./hint";

export const ChartFilters = ({
  chartId,
  dataSetIri
}: {
  chartId: string;
  dataSetIri: string;
}) => {
  const [state] = useConfiguratorState();

  const meta = useDataSetAndMetadata(dataSetIri);

  if (meta.state === "loaded") {
    const { dimensions, dataSet } = meta.data;

    // const categoricalDimensions = getCategoricalDimensions({ dimensions });
    return (
      <Flex flexDirection="column">
        {state.state === "CONFIGURING_CHART" && (
          <Filters
            chartId={chartId}
            dataSet={dataSet}
            dimensions={dimensions}
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
