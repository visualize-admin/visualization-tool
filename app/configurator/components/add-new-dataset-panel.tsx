import { Box, Drawer, Typography } from "@mui/material";
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
  return (
    <Drawer anchor="right" open={isOpen} variant="temporary" onClose={close}>
      <Typography variant="h3" sx={{ mt: 2, px: 6 }}>
        Choose a new dataset
      </Typography>
      <DialogCloseButton onClick={() => close()} />
      <Box width="90vw">
        <Box sx={{ mt: "-5rem" }}></Box>
        <ConfiguratorStateProvider chartId="new" allowDefaultRedirect={false}>
          <SelectDatasetStep />
        </ConfiguratorStateProvider>
      </Box>
    </Drawer>
  );
};
