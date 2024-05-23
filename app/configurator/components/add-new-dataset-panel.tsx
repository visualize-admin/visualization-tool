import { Box, Drawer } from "@mui/material";
import { useState } from "react";
import { useClient } from "urql";
import createStore from "zustand";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
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

export const AddNewDatasetPanel = () => {
  const { isOpen, close } = useSearchDatasetPanelStore();
  const [dataSetIri, setDataSetIri] = useState("");
  const [state, dispatch] = useConfiguratorState();
  const locale = useLocale();
  const client = useClient();
  const { dataSource } = useDataSourceStore();

  const handleAddNewDataset = async (datasetIri: string) => {
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
      type: "CHART_CONFIG_ADD",
      value: {
        chartConfig: chartState.chartConfigs[0],
        locale,
      },
    });
  };
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
          <SelectDatasetStep
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
