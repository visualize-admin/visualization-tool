import { Box } from "theme-ui";
import { useConfiguratorState } from "../../domain";
import { ChartAnnotationsSelector } from "../chart-annotations-selector";
import { ChartOptionsSelector } from "../chart-options-selector";
import { DataSetMetadata } from "../dataset-metadata";
import { PanelLeft } from "../panel-left";
import { PanelMiddle } from "../panel-middle";
import { Stepper } from "../stepper";

export const ChartEditor = () => {
  // Local state, the dataset preview doesn't need to be persistent.
  // FIXME: for a11y, "updateDataSetPreviewIri" should also move focus to "Weiter" button (?)
  const [state] = useConfiguratorState();

  return (
    <Box
      bg="muted"
      sx={{
        display: "grid",
        gridTemplateColumns:
          "minmax(12rem, 20rem) minmax(22rem, 1fr) minmax(12rem, 20rem)",
        gridTemplateRows: "auto minmax(0, 1fr)",
        gridTemplateAreas: `
        "header header header"
        "left middle right"
        `,
        width: "100%",
        position: "fixed",
        // FIXME replace 96px with actual header size
        top: "96px",
        height: "calc(100vh - 96px)"
      }}
    >
      <Box as="section" role="navigation" sx={{ gridArea: "header" }}>
        <Stepper />
      </Box>

      <Box as="section" data-name="panel-left" variant="container.left">
        <PanelLeft />
      </Box>

      <Box as="section" data-name="panel-right" variant="container.right">
        {state.state === "SELECTING_DATASET" && state.dataSet && (
          <DataSetMetadata dataSetIri={state.dataSet} />
        )}
        {state.state === "CONFIGURING_CHART" && (
          <ChartOptionsSelector state={state} />
        )}
        {state.state === "DESCRIBING_CHART" && (
          <ChartAnnotationsSelector state={state} />
        )}
      </Box>
      <Box as="section" data-name="panel-middle" variant="container.middle">
        <PanelMiddle dataSetPreviewIri={state.dataSet} />
      </Box>
    </Box>
  );
};
