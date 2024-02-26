import { TabContext, TabList } from "@mui/lab";
import { Tab } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";
import { useState } from "react";

import { VisualizeTab, VisualizeTabList } from "@/components/tabs";

const TabsDoc = () => {
  const [tab, setTab] = useState("line");
  return markdown`

> Tabs organize and allow navigation between groups of content that are related and at the same level of hierarchy.

## Tabs style 1

  ${(
    <ReactSpecimen span={2}>
      <TabContext value={tab}>
        <TabList onChange={(ev, newTab) => setTab(newTab)}>
          <Tab value="line" label="Line" />
          <Tab value="pie" label="Pie" />
        </TabList>
      </TabContext>
    </ReactSpecimen>
  )}

  ## Tabs style 2

  ${(
    <ReactSpecimen span={2}>
      <TabContext value={tab}>
        <VisualizeTabList onChange={(ev, newTab) => setTab(newTab)}>
          <VisualizeTab value="line" label="Line" />
          <VisualizeTab value="pie" label="Pie" />
        </VisualizeTabList>
      </TabContext>
    </ReactSpecimen>
  )}

`;
};

export default TabsDoc;
