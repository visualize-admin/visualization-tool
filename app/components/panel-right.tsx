import { Trans } from "@lingui/macro";
import React from "react";
import { ChartFilters } from "./chart-filters";
import { Container, ContainerTitle } from "./container";
import { useConfiguratorState } from "../domain/configurator-state";

export const PanelRight = ({ chartId }: { chartId: string }) => {
  const [state] = useConfiguratorState();

  return (
    <Container side="right" data-name="panel-right">
      {state.state === "CONFIGURING_CHART" && (
        <>
          <ContainerTitle>
            <Trans>Daten Filter</Trans>
          </ContainerTitle>
          <ChartFilters chartId={chartId} dataSetIri={state.dataSet} />
        </>
      )}
    </Container>
  );
};
