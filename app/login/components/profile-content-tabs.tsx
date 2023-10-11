import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React from "react";

import { ParsedConfig } from "@/db/config";
import { ProfileVisualizationsTable } from "@/login/components/profile-tables";
import { useRootStyles } from "@/login/utils";
import useEvent from "@/utils/use-event";

const useStyles = makeStyles<Theme>((theme) => ({
  section: {
    marginTop: theme.spacing(6),
  },
  tabList: {
    minHeight: "fit-content",

    "& .MuiTabs-flexContainer": {
      height: "fit-content",
    },
  },
  tabPanel: {
    padding: 0,
  },
  tabPanelContent: {
    padding: theme.spacing(6),
  },
  tab: {
    height: 48,
    minHeight: 0,
    padding: "0 1rem",
    textTransform: "none",
  },
}));

type ProfileContentTabsProps = {
  userConfigs: ParsedConfig[];
};

export const ProfileContentTabs = (props: ProfileContentTabsProps) => {
  const { userConfigs } = props;
  const [value, setValue] = React.useState("Home");
  const handleChange = useEvent((_: React.SyntheticEvent, v: string) => {
    setValue(v);
  });
  const rootClasses = useRootStyles();
  const classes = useStyles();

  return (
    <TabContext value={value}>
      <Box className={clsx(rootClasses.section, classes.section)}>
        <Box className={rootClasses.sectionContent}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList className={classes.tabList} onChange={handleChange}>
              {["Home", "My visualizations", "My favorite datasets"].map(
                (d) => (
                  <Tab key={d} className={classes.tab} label={d} value={d} />
                )
              )}
            </TabList>
          </Box>
        </Box>
      </Box>
      <TabPanel className={classes.tabPanel} value="Home">
        <Box className={classes.tabPanelContent}>
          <ProfileVisualizationsTable
            userConfigs={userConfigs}
            preview
            onShowAll={() => setValue("My visualizations")}
          />
        </Box>
      </TabPanel>
      <TabPanel className={classes.tabPanel} value="My visualizations">
        <Box
          className={classes.tabPanelContent}
          sx={{ bgcolor: "background.paper" }}
        >
          <ProfileVisualizationsTable userConfigs={userConfigs} />
        </Box>
      </TabPanel>
      <TabPanel className={classes.tabPanel} value="My favorite datasets">
        <Box
          className={classes.tabPanelContent}
          sx={{ bgcolor: "background.paper" }}
        >
          <Typography variant="h2">My favorite datasets</Typography>
        </Box>
      </TabPanel>
    </TabContext>
  );
};
