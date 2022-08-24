import { Box, Popover, Tab, Tabs } from "@mui/material";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStateDescribingChart,
  ConfiguratorStatePublishing,
  useConfiguratorState,
} from "@/configurator";
import { ChartTypeSelector } from "@/configurator/components/chart-type-selector";
import { getIconName } from "@/configurator/components/ui-helpers";
import { Icon, IconName } from "@/icons";

import Flex from "./flex";

type TabsState = {
  isPopoverOpen: boolean;
};

const TabsStateContext = createContext<
  [TabsState, Dispatch<TabsState>] | undefined
>(undefined);

export const useTabsState = () => {
  const ctx = useContext(TabsStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <TabsStateProvider /> to useTabsState()"
    );
  }

  return ctx;
};

const TabsStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useState<TabsState>({ isPopoverOpen: false });

  return (
    <TabsStateContext.Provider value={[state, dispatch]}>
      {children}
    </TabsStateContext.Provider>
  );
};

export const ChartSelectionTabs = ({
  chartType,
  editable,
}: {
  chartType: ChartType;
  /** Tabs are not editable when they are published. */
  editable: boolean;
}) => {
  return (
    <TabsStateProvider>
      {editable ? (
        <TabsEditable chartType={chartType} />
      ) : (
        <TabsFixed chartType={chartType} />
      )}
    </TabsStateProvider>
  );
};

const TabsEditable = ({ chartType }: { chartType: ChartType }) => {
  const [configuratorState] = useConfiguratorState() as unknown as [
    | ConfiguratorStateConfiguringChart
    | ConfiguratorStateDescribingChart
    | ConfiguratorStatePublishing
  ];
  const [tabsState, setTabsState] = useTabsState();
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const handleClose = useCallback(() => {
    setPopoverAnchorEl(null);
    setTabsState({ isPopoverOpen: false });
  }, [setTabsState]);

  useEffect(() => {
    handleClose();
  }, [handleClose, configuratorState.chartConfig.chartType]);

  return (
    <>
      <TabsInner
        chartType={chartType}
        editable={true}
        onActionButtonClick={(e: React.MouseEvent<HTMLElement>) => {
          setPopoverAnchorEl(e.currentTarget);
          setTabsState({ isPopoverOpen: true });
        }}
      />
      <Popover
        id="chart-selection-popover"
        open={tabsState.isPopoverOpen}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          horizontal: "left",
          vertical: "bottom",
        }}
        onClose={handleClose}
      >
        <ChartTypeSelector
          state={configuratorState}
          sx={{
            width: 320,
            px: 3,
            pb: 3,
          }}
        />
      </Popover>
    </>
  );
};

const TabsFixed = ({ chartType }: { chartType: ChartType }) => {
  return <TabsInner chartType={chartType} editable={false} />;
};

const TabsInner = ({
  chartType,
  editable,
  onActionButtonClick,
}: {
  chartType: ChartType;
  editable: boolean;
  onActionButtonClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) => {
  return (
    <Tabs value={0}>
      {/* TODO: Generate dynamically when chart composition is implemented */}
      <Tab
        sx={{ p: 0 }}
        onClick={onActionButtonClick}
        label={
          <TabContent iconName={getIconName(chartType)} editable={editable} />
        }
      />
    </Tabs>
  );
};

const TabContent = ({
  iconName,
  editable = false,
}: {
  iconName: IconName;
  editable?: boolean;
}) => {
  return (
    <Flex
      sx={{
        gap: 2,
        alignItems: "center",
        py: 1,
        px: 3,
        borderRadius: 3,
        transition: "0.125s ease background-color",
        "&:hover": editable
          ? {
              backgroundColor: "grey.200",
            }
          : undefined,
      }}
    >
      <Icon name={iconName} />

      {editable && (
        <Box component="span" sx={{ color: "grey.700" }}>
          <Icon name="chevronDown" size={16} />
        </Box>
      )}
    </Flex>
  );
};
