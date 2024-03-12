import { TabContext, TabList } from "@mui/lab";
import { Tab } from "@mui/material";
import { useState } from "react";

import { VisualizeTab, VisualizeTabList } from "@/components/tabs";

const meta = {
  default: VisualizeTab,
  title: "components / Tabs",
};

export default meta;

export const TabsVariant1 = () => {
  const [tab, setTab] = useState("line");

  return (
    <TabContext value={tab}>
      <TabList onChange={(_ev, newTab) => setTab(newTab)}>
        <Tab value="line" label="Line" />
        <Tab value="pie" label="Pie" />
      </TabList>
    </TabContext>
  );
};

export const TabsVariant2 = () => {
  const [tab, setTab] = useState("line");

  return (
    <TabContext value={tab}>
      <VisualizeTabList onChange={(_ev, newTab) => setTab(newTab)}>
        <VisualizeTab value="line" label="Line" />
        <VisualizeTab value="pie" label="Pie" />
      </VisualizeTabList>
    </TabContext>
  );
};
