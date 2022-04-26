import { ButtonBase, IconButton, Popover } from "@mui/material";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
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
  const [popoverAnchorEl, setPopoverAnchorEl] =
    useState<HTMLButtonElement | null>(null);

  return (
    <>
      <TabsInner
        chartType={chartType}
        editable={true}
        onActionButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
        onClose={() => {
          setPopoverAnchorEl(null);
          setTabsState({ isPopoverOpen: false });
        }}
      >
        <ChartTypeSelector state={configuratorState} />
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
  onActionButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <Flex sx={{ width: "100%", overflowX: "auto" }}>
      <Flex sx={{ gap: 1 }}>
        {/* TODO: Generate dynamically when chart composition is implemeneted */}
        <Tab
          iconName={getIconName(chartType)}
          selected
          editable={editable}
          onActionButtonClick={onActionButtonClick}
        />
        <Tab iconName="add" disabled narrow />
      </Flex>
    </Flex>
  );
};

const Tab = ({
  iconName,
  selected = false,
  disabled = false,
  editable = false,
  onActionButtonClick,
  narrow = false,
}: {
  iconName: IconName;
  selected?: boolean;
  disabled?: boolean;
  editable?: boolean;
  narrow?: boolean;
  onActionButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <TabButton selected={selected} disabled={disabled} narrow={narrow}>
      <Flex sx={{ gap: 1 }}>
        <Icon name={iconName} />

        {selected && editable && (
          <IconButton size="small" onClick={onActionButtonClick}>
            <Icon name="chevronDown" size={16} />
          </IconButton>
        )}
      </Flex>
    </TabButton>
  );
};

const TabButton = ({
  children,
  selected,
  disabled,
  narrow,
}: {
  children: ReactNode;
  selected: boolean;
  disabled: boolean;
  narrow: boolean;
}) => {
  return (
    <ButtonBase
      disabled={disabled}
      sx={{
        justifyContent: "center",
        alignItems: "center",

        width: narrow ? 50 : 100,
        height: selected ? 50 : 49,

        color: selected ? "primary.main" : "grey.900",
        bgcolor: "grey.100",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,

        boxShadow: 6,
      }}
    >
      {children}
    </ButtonBase>
  );
};
