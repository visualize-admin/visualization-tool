import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import Flex from "@/components/flex";
import { Layout } from "@/config-types";

type ChartPanelProps = React.PropsWithChildren<{
  editing?: boolean;
  layout: Layout;
}>;

export const ChartPanel = (props: ChartPanelProps) => {
  const { children, editing, layout } = props;
  return (
    <>
      {(editing || layout.type === "tab") && <ChartSelectionTabs />}
      <ChartPanelInner>{children}</ChartPanelInner>
    </>
  );
};

const useChartPanelInnerStyles = makeStyles<Theme>((theme) => ({
  root: {
    flexDirection: "column",
    backgroundColor: theme.palette.grey[100],
    border: "1px solid",
    borderColor: theme.palette.divider,
    overflow: "hidden",
    width: "auto",
  },
}));

const ChartPanelInner = (props: React.PropsWithChildren<{}>) => {
  const { children } = props;
  const classes = useChartPanelInnerStyles();

  return (
    <Flex className={classes.root} sx={{ minHeight: [150, 300, 500] }}>
      {children}
    </Flex>
  );
};
