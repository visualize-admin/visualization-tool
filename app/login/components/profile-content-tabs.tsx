import { t } from "@lingui/macro";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React from "react";

import { useUserConfigs } from "@/domain/user-configs";
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
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    height: 48,
    minHeight: 0,
    padding: "0 1rem",
    textTransform: "none",
  },
}));

type ProfileContentTabsProps = {
  userId: number;
};

export const ProfileContentTabs = (props: ProfileContentTabsProps) => {
  const { userId } = props;

  const { data: userConfigs } = useUserConfigs();
  const [value, setValue] = React.useState("Home");
  const handleChange = useEvent((_: React.SyntheticEvent, v: string) => {
    setValue(v);
  });
  const rootClasses = useRootStyles();
  const classes = useStyles();

  if (!userConfigs) {
    return null;
  }

  return (
    <TabContext value={value}>
      <Box className={clsx(rootClasses.section, classes.section)}>
        <Box className={rootClasses.sectionContent}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList className={classes.tabList} onChange={handleChange}>
              {[
                "Home",
                t({
                  id: "login.profile.my-visualizations",
                  message: "My visualizations",
                }),
              ].map((d) => (
                <Tab key={d} className={classes.tab} label={d} value={d} />
              ))}
            </TabList>
          </Box>
        </Box>
      </Box>
      <TabPanel className={classes.tabPanel} value="Home">
        <Box
          className={classes.tabPanelContent}
          sx={{ display: "flex", flexDirection: "column", gap: 6 }}
        >
          <ProfileVisualizationsTable
            userId={userId}
            userConfigs={userConfigs}
            preview
            onShowAll={() =>
              setValue(
                t({
                  id: "login.profile.my-visualizations",
                  message: "My visualizations",
                })
              )
            }
          />
        </Box>
      </TabPanel>
      <TabPanel
        className={classes.tabPanel}
        value={t({
          id: "login.profile.my-visualizations",
          message: "My visualizations",
        })}
      >
        <Box className={classes.tabPanelContent}>
          <ProfileVisualizationsTable
            userId={userId}
            userConfigs={userConfigs}
          />
        </Box>
      </TabPanel>
    </TabContext>
  );
};
