import { useEventCallback } from "@mui/material";
import { useState } from "react";
import { useClient } from "urql";
import createStore from "zustand";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { DialogCloseButton } from "@/components/dialog-close-button";
import { RightDrawer } from "@/configurator/components/drawers";
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
const useAddChartConfigBasedOnNewDataset = () => {
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
  const addNewDataset = useAddChartConfigBasedOnNewDataset();

  const handleClose = useEventCallback(() => {
    close();
  });

  const handleExited = useEventCallback(() => {
    setDataSetIri("");
  });

  return (
    <RightDrawer open={isOpen} onClose={handleClose} onExited={handleExited}>
      <DialogCloseButton onClick={() => handleClose()} />
      <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
        <SelectDatasetStep
          variant="drawer"
          dataset={dataSetIri}
          onClickBackLink={(ev) => {
            ev.preventDefault();
            setDataSetIri("");
          }}
          onCreateChartFromDataset={async (ev, datasetIri) => {
            ev.preventDefault();
            await addNewDataset(datasetIri);
            close();
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
          }}
        />
      </ConfiguratorStateProvider>
    </RightDrawer>
  );
};
