import { TabList, TabListProps } from "@mui/lab";
import { styled, Tab, TabProps, tabsClasses } from "@mui/material";

export const VisualizeTabList = styled(TabList)<TabListProps>(({ theme }) => {
  return {
    position: "relative",
    [`& .${tabsClasses.indicator}`]: {
      display: "none",
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
});

export const VisualizeTab = styled(Tab)<TabProps>(({ theme }) => {
  return {
    marginRight: theme.spacing(2),
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    position: "relative",
    top: 0,
    zIndex: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&.Mui-selected": {
      borderBottomColor: theme.palette.background.paper,
    },
    minWidth: "fit-content",
    padding: theme.spacing(0, 2),
  };
});
