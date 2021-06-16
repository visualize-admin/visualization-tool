import { Box } from "theme-ui";
import { useConfiguratorState } from "..";
import { ChartPanel } from "../../components/chart-panel";
import { ChartPreview } from "../../components/chart-preview";
import { DataSetPreview } from "./dataset-preview";
import { DataSetHint } from "../../components/hint";

export const PanelMiddle = () => {
  const [state] = useConfiguratorState();

  return (
    <>
      {state.state === "SELECTING_DATASET" ? (
        <>
          {state.dataSet ? (
            <ChartPanel>
              <DataSetPreview dataSetIri={state.dataSet} />
            </ChartPanel>
          ) : (
            <ChartPanel>
              <DataSetHint />
            </ChartPanel>
          )}
        </>
      ) : (
        <>
          {(state.state === "SELECTING_CHART_TYPE" ||
            state.state === "CONFIGURING_CHART" ||
            state.state === "DESCRIBING_CHART" ||
            state.state === "PUBLISHING") && (
            <ChartPanel>
              <ChartPreview dataSetIri={state.dataSet} />
            </ChartPanel>
          )}
        </>
      )}

      {process.env.NODE_ENV === "development" && (
        <Box my={3} p={2} bg="muted">
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </Box>
      )}
    </>
  );
};
