import { t } from "@lingui/macro";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import groupBy from "lodash/groupBy";
import { type SyntheticEvent, useMemo, useState } from "react";

import { ParsedConfigWithViewCount } from "@/db/config";
import { useUserConfigs } from "@/domain/user-configs";
import { ProfileColorPaletteContent } from "@/login/components/color-palettes/profile-color-palette-content";
import { ProfileVisualizationsTable } from "@/login/components/profile-tables";
import { useRootStyles } from "@/login/utils";
import { useEvent } from "@/utils/use-event";

const useStyles = makeStyles<Theme>((theme) => ({
  section: {
    borderTop: `1px solid ${theme.palette.monochrome[300]}`,
    borderBottom: `1px solid ${theme.palette.monochrome[300]}`,
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

  const [value, setValue] = useState("home");
  const handleChange = useEvent((_: SyntheticEvent, v: string) => {
    setValue(v);
  });
  const rootClasses = useRootStyles();
  const classes = useStyles();

  const { DRAFT: draftConfigs = [], PUBLISHED: publishedConfigs = [] } =
    useMemo(() => {
      return groupBy(
        userConfigs,
        (config: ParsedConfigWithViewCount) => config.published_state
      );
    }, [userConfigs]);

  if (!userConfigs) {
    return null;
  }

  return (
    <TabContext value={value}>
      <Box className={clsx(rootClasses.section, classes.section)}>
        <Box className={rootClasses.sectionContent}>
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
                id: "login.profile.my-drafts",
                message: "My Drafts",
              })}
              value="drafts"
            />
            <Tab
              className={classes.tab}
              label={t({
                id: "login.profile.my-published-visualizations",
                message: "My Visualizations",
              })}
              value="published"
            />
            <Tab
              data-testid="color-palettes-tab"
              className={classes.tab}
              label={t({
                id: "login.profile.my-color-palettes",
                message: "My Color Palettes",
              })}
              value="palettes"
            />
          </TabList>
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
              message: "My Drafts",
            })}
            userId={userId}
            userConfigs={draftConfigs}
            preview
            onShowAll={() => setValue("drafts")}
          />
          <ProfileVisualizationsTable
            title={t({
              id: "login.profile.my-published-visualizations",
              message: "My Visualizations",
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
              message: "My Visualizations",
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
              message: "My Drafts",
            })}
            userId={userId}
            userConfigs={draftConfigs}
          />
        </Box>
      </TabPanel>
      <TabPanel className={classes.tabPanel} value="palettes">
        <Box className={classes.tabPanelContent}>
          <ProfileColorPaletteContent
            title={t({
              id: "login.profile.my-color-palettes",
              message: "My Color Palettes",
            })}
          />
        </Box>
      </TabPanel>
    </TabContext>
  );
};
