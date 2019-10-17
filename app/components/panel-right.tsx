import React from "react";
import { useConfiguratorState } from "../domain/configurator-state";
import { ChartFilters } from "./chart-filters";
import { Container } from "./container";

export const PanelRight = ({ chartId }: { chartId: string }) => {
  const [state] = useConfiguratorState();

  return (
    <Container side="right" data-name="panel-right">
      {state.state === "CONFIGURING_CHART" && (
        <>
          {/* <ContainerTitle>
            <Trans>Daten Filter</Trans>
          </ContainerTitle> */}
          <ChartFilters chartId={chartId} dataSetIri={state.dataSet} />
        </>
      )}
    </Container>
  );
};
