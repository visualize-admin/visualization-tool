import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Link } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ChartConfigurator } from "./chart-configurator";
import { CollapsibleSection } from "./chart-controls";
import { ChartTypeSelector } from "./chart-type-selector";
import { DataSetList } from "./dataset-selector";
import { LocalizedLink } from "./links";
import { ChartAnnotator } from "./chart-annotator";

export const PanelLeft = ({
  dataSetPreviewIri,
  updateDataSetPreviewIri
}: {
  dataSetPreviewIri?: string;
  updateDataSetPreviewIri: (x: string) => void;
}) => {
  const [state] = useConfiguratorState();

  return (
    <>
      {state.state === "SELECTING_DATASET" ? (
        <DataSetList
          dataSetPreviewIri={dataSetPreviewIri}
          updateDataSetPreviewIri={updateDataSetPreviewIri}
        />
      ) : (
        <>
          {(state.state === "SELECTING_CHART_TYPE" ||
            state.state === "PRE_SELECTING_CHART_TYPE") && (
            <ChartTypeSelector state={state} />
          )}
          {state.state === "CONFIGURING_CHART" && (
            <ChartConfigurator state={state} />
          )}
          {state.state === "DESCRIBING_CHART" && (
            <ChartAnnotator state={state} />
          )}

          {/* Step 5 */}
          {state.state === "PUBLISHED" && (
            <CollapsibleSection title={<Trans>Share & embed</Trans>}>
              <Box mb={2}>
                <Trans id="test-form-success">Visualization URL</Trans>
              </Box>
              <Box mb={2}>
                <LocalizedLink href={`/[locale]/v/${state.configKey}`} passHref>
                  <Link sx={{ textDecoration: "underline", cursor: "pointer" }}>
                    {state.configKey}
                  </Link>
                </LocalizedLink>
              </Box>
            </CollapsibleSection>
          )}
        </>
      )}
    </>
  );
};
