import { Box, Drawer, useEventCallback } from "@mui/material";
import { useState } from "react";
import { useClient } from "urql";
import createStore from "zustand";

import { SelectDatasetStepDrawer } from "@/browser/select-dataset-step";
import { DialogCloseButton } from "@/components/dialog-close-button";
import {
  ConfiguratorStateProvider,
  initChartStateFromCube,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useLocale } from "@/locales/use-locale";
import { useDataSourceStore } from "@/stores/data-source";
import { assert } from "@/utils/assert";

export const useSearchDatasetPanelStore = createStore<{
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}>((set) => ({
  isOpen: false,
  toggle: () => {
    set((s) => ({ isOpen: !s.isOpen }));
  },
  close: () => {
    set({ isOpen: false });
  },
  open: () => {
    set({ isOpen: true });
  },
}));

/**
 * Inits a new chart state based on a new dataset and adds it to the configurator state
 */
export const useAddChartConfigBasedOnNewDataset = () => {
  const [, dispatch] = useConfiguratorState();
  const locale = useLocale();
  const client = useClient();
  const { dataSource } = useDataSourceStore();
  const handleAddNewDataset = useEventCallback(async (datasetIri: string) => {
    const chartState = await initChartStateFromCube(
      client,
      datasetIri,
      dataSource,
      locale
    );

    if (!chartState) {
      return;
    }

    assert(
      chartState?.state === "CONFIGURING_CHART",
      "After init, chart state should be in CONFIGURING_CHART state"
    );

    dispatch({
      type: "CHART_CONFIG_ADD_NEW_DATASET",
      value: {
        chartConfig: chartState.chartConfigs[0],
        locale,
      },
    });
  });
  return handleAddNewDataset;
};

/**
 * Used when adding a new chart based on a new dataset
 * Shows the dataset search, but overrides its default behavior to
 * keep the state as a local state instead of inside the URL
 */
export const AddNewDatasetPanel = () => {
  const { isOpen, close } = useSearchDatasetPanelStore();
  const [dataSetIri, setDataSetIri] = useState("");
  const handleAddNewDataset = useAddChartConfigBasedOnNewDataset();

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      variant="temporary"
      onClose={close}
      PaperProps={{
        sx: {
          width: "1400px",
          maxWidth: "100%",
        },
      }}
    >
      <DialogCloseButton onClick={() => close()} />

      <Box>
        <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
          <SelectDatasetStepDrawer
            variant="drawer"
            dataset={dataSetIri}
            onClickBackLink={(ev) => {
              ev.preventDefault();
              setDataSetIri("");
            }}
            datasetResultsProps={{
              datasetResultProps: () => ({
                showDimensions: true,
                onClickTitle: (ev, datasetIri) => {
                  ev.preventDefault();
                  setDataSetIri(datasetIri);
                },
              }),
            }}
            datasetPreviewProps={{
              dataSetIri,
              onClickCreate: (ev, datasetIri) => {
                ev.preventDefault();
                handleAddNewDataset(datasetIri);
              },
            }}
          />
        </ConfiguratorStateProvider>
      </Box>
    </Drawer>
  );
};
