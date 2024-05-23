import { Box, Drawer } from "@mui/material";
import { useState } from "react";
import createStore from "zustand";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { DialogCloseButton } from "@/components/dialog-close-button";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";

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
  return (
    <Drawer anchor="right" open={isOpen} variant="temporary" onClose={close}>
      <DialogCloseButton onClick={() => close()} />
      <Box maxWidth="1400px">
        <Box></Box>
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
                alert("Create new dataset" + datasetIri);
              },
            }}
          />
        </ConfiguratorStateProvider>
      </Box>
    </Drawer>
  );
};
