import { Box, Button, Drawer, Typography } from "@mui/material";

import { SelectDatasetStep } from "@/browser/select-dataset-step";
import { useTabsState } from "@/components/chart-selection-tabs";
import { DialogCloseButton } from "@/components/dialog-close-button";
import useDisclosure from "@/components/use-disclosure";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";

const FromNewDatasetUI = () => {
  const { open, close, isOpen } = useDisclosure();
  const [tabsState, setTabsState] = useTabsState();
  return (
    <>
      <Button
        variant="outlined"
        onClick={() => {
          setTabsState((state) => ({ ...state, popoverOpen: false }));
          open();
        }}
      >
        From new dataset
      </Button>
      <Drawer anchor="right" open={isOpen} variant="temporary">
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
    </>
  );
};

export default FromNewDatasetUI;
