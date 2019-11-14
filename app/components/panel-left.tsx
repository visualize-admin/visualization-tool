import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Link } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ChartConfigurator } from "./chart-configurator";
import { ControlSection } from "./chart-controls";
import { ChartTypeSelector } from "./chart-type-selector";
import { ContainerTitle } from "./container";
import { DataSetList } from "./dataset-selector";
import { LocalizedLink } from "./links";
import { ChartAnnotator } from "./chart-annotator";

export const PanelLeft = ({
  chartId,
  dataSetPreviewIri,
  updateDataSetPreviewIri
}: {
  chartId: string;
  dataSetPreviewIri?: string;
  updateDataSetPreviewIri: (x: string) => void;
}) => {
  const [state] = useConfiguratorState();

  return (
    <Box as="section" data-name="panel-left" variant="container.left">
      {chartId === "new" ? (
        <>
          <ContainerTitle>
            <Trans>Datensatz auswählen</Trans>
          </ContainerTitle>
          <DataSetList
            dataSetPreviewIri={dataSetPreviewIri}
            updateDataSetPreviewIri={updateDataSetPreviewIri}
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
            <ChartConfigurator chartId={chartId} dataSetIri={state.dataSet} />
          )}
          {state.state === "DESCRIBING_CHART" && (
            <ChartAnnotator chartId={chartId} />
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
    </Box>
  );
};
