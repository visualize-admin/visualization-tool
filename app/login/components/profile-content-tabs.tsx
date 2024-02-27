import { t } from "@lingui/macro";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import groupBy from "lodash/groupBy";
import React, { useMemo } from "react";

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
  const [value, setValue] = React.useState("home");
  const handleChange = useEvent((_: React.SyntheticEvent, v: string) => {
    setValue(v);
  });
  const rootClasses = useRootStyles();
  const classes = useStyles();

  const { DRAFT: draftConfigs = [], PUBLISHED: publishedConfigs = [] } =
    useMemo(() => {
      return groupBy(
        userConfigs,
        (x: { published_state: any }) => x.published_state
      );
    }, [userConfigs]);

  if (!userConfigs) {
    return null;
  }

  return (
    <TabContext value={value}>
      <Box className={clsx(rootClasses.section, classes.section)}>
        <Box className={rootClasses.sectionContent}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList className={classes.tabList} onChange={handleChange}>
              <Tab
                className={classes.tab}
                label={t({
                  id: "login.profile.home",
                  message: "Home",
                })}
                value="home"
              />
              <Tab
                className={classes.tab}
                label={t({
                  id: "login.profile.my-published-visualizations",
                  message: "My Published Visualizations",
                })}
                value="published"
              />
              <Tab
                className={classes.tab}
                label={t({
                  id: "login.profile.my-drafts",
                  message: "My draft visualizations",
                })}
                value="drafts"
              />
            </TabList>
          </Box>
        </Box>
      </Box>
      <TabPanel className={classes.tabPanel} value="home">
        <Box
          className={classes.tabPanelContent}
          sx={{ display: "flex", flexDirection: "column", gap: "3rem" }}
        >
          <ProfileVisualizationsTable
            title={t({
              id: "login.profile.my-drafts",
              message: "My draft visualizations",
            })}
            userId={userId}
            userConfigs={draftConfigs}
            preview
            onShowAll={() => setValue("drafts")}
          />
          <ProfileVisualizationsTable
            title={t({
              id: "login.profile.my-published-visualizations",
              message: "My published visualizations",
            })}
            userId={userId}
            userConfigs={publishedConfigs}
            preview
            onShowAll={() => setValue("published")}
          />
        </Box>
      </TabPanel>
      <TabPanel className={classes.tabPanel} value="published">
        <Box className={classes.tabPanelContent}>
          <ProfileVisualizationsTable
            title={t({
              id: "login.profile.my-published-visualizations",
              message: "My published visualizations",
            })}
            userId={userId}
            userConfigs={publishedConfigs}
          />
        </Box>
      </TabPanel>
      <TabPanel className={classes.tabPanel} value="drafts">
        <Box className={classes.tabPanelContent}>
          <ProfileVisualizationsTable
            title={t({
              id: "login.profile.my-drafts",
              message: "My draft visualizations",
            })}
            userId={userId}
            userConfigs={draftConfigs}
          />
        </Box>
      </TabPanel>
    </TabContext>
  );
};
