import { Trans } from "@lingui/macro";
import React from "react";
import { Button, Link, Box } from "rebass";
import { ChartConfigurator } from "./chart-configurator";
import { ChartTypeSelector } from "./chart-type-selector";
import { Container, ContainerTitle } from "./container";
import { DataSetList, Preview } from "./dataset-selector";
import { LocalizedLink } from "./links";
import { useConfiguratorState } from "../domain/configurator-state";
import { ControlSection } from "./chart-controls";

export const PanelLeft = ({
  chartId,
  dataSetPreview,
  updateDataSetPreview
}: {
  chartId: string;
  dataSetPreview: Preview;
  updateDataSetPreview: (x: Preview) => void;
}) => {
  const [state, dispatch] = useConfiguratorState();

  return (
    <Container side="left" data-name="panel-left">
      {chartId === "new" ? (
        <>
          <ContainerTitle>
            <Trans>Datensatz auswählen</Trans>
          </ContainerTitle>
          <DataSetList
            dataSetPreview={dataSetPreview}
            updateDataSetPreview={updateDataSetPreview}
          />
        </>
      ) : (
        <>
          {state.state === "SELECTING_CHART_TYPE" && (
            <>
              <ContainerTitle>
                <Trans>Chart-Typ auswählen</Trans>
              </ContainerTitle>
              <ChartTypeSelector chartId={chartId} dataSet={state.dataSet} />
            </>
          )}
          {state.state === "CONFIGURING_CHART" && (
            <>
              {/* Step 3: CONFIGURING_CHART */}
              {state.dataSet && state.chartConfig.chartType && (
                <ChartConfigurator
                  chartId={chartId}
                  dataSetIri={state.dataSet}
                />
              )}
            </>
          )}

          {/* Step 5 */}
          {state.state === "PUBLISHED" && (
            <ControlSection title="Teilen & einbetten">
              <Box mb={2}>
                <Trans id="test-form-success">Grafik URL</Trans>
              </Box>
              <Box mb={2}>
                <LocalizedLink href={`/[locale]/v/${state.configKey}`} passHref>
                  <Link sx={{ textDecoration: "underline", cursor: "pointer" }}>
                    {state.configKey}
                  </Link>
                </LocalizedLink>
              </Box>
            </ControlSection>
          )}
        </>
      )}
    </Container>
  );
};
