import { TabList, TabListProps } from "@mui/lab";
import { styled, Tab, TabProps, tabsClasses } from "@mui/material";

export const VisualizeTabList = styled(TabList)<TabListProps>(({ theme }) => {
  return {
    border: "none !important",
    [`& .${tabsClasses.indicator}`]: {
      display: "none",
    },
    [`& .${tabsClasses.scrollButtons}`]: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    // Use before so that bottom border of tabs can go "over" the tab list
    // bottom border
    "&:before": {
      content: '" "',
      display: "block",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      margin: "auto",
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  };
  // Need to do the type assertion otherwise we cannot use the "component" prop down the line
}) as typeof TabList;

export const VisualizeTab = styled(Tab)<TabProps>(({ theme }) => {
  return {
    marginRight: theme.spacing(2),
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    position: "relative",
    top: 0,
    zIndex: 1,
    "&.Mui-selected": {
      borderBottomColor: theme.palette.background.paper,
    },
    minWidth: "fit-content",
    padding: theme.spacing(0, 2),
  };
  // Need to do the type assertion otherwise we cannot use the "component" prop down the line
}) as typeof Tab;
