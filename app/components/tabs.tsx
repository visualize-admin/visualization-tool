import { Button } from "@mui/material";
import React, { useContext, useMemo, useState } from "react";

type TabsState = {
  currentTab: string;
  requestChangeTab: (newTab: string) => void;
};

const TabsContext = React.createContext<TabsState>({
  currentTab: "",
  requestChangeTab: () => undefined,
});

export const Tab = ({
  children,
  value,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const { requestChangeTab, currentTab } = useContext(TabsContext);

  return (
    <Button
      variant="contained"
      onClick={() => requestChangeTab(value)}
      sx={{
        ml: 2,
        background: "transparent",
        borderBottom: "2px solid",
        borderRadius: 0,
        borderColor: value === currentTab ? "primary" : "transparent",
        color: value === currentTab ? "primary" : "black",
        fontWeight: "bold",
      }}
      color="primary"
      size="small"
    >
      {children}
    </Button>
  );
};

export const TabContent = ({
  children,
  value,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const { currentTab } = useContext(TabsContext);
  return currentTab === value ? <>{children}</> : null;
};

export const Tabs = ({
  children,
  initialValue,
}: {
  children: React.ReactNode;
  initialValue: string;
}) => {
  const [currentTab, setCurrentTab] = useState<string>(initialValue);
  const context = useMemo(() => {
    return {
      currentTab,
      requestChangeTab: (newTab: string) => setCurrentTab(newTab),
    };
  }, [currentTab]);

  return (
    <TabsContext.Provider value={context}>{children}</TabsContext.Provider>
  );
};
