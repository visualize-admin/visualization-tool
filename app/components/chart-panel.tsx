import { BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import { ChartType } from "@/configurator";

import { ChartSelectionTabs } from "./chart-selection-tabs";

type ChartPanelProps = {
  children: ReactNode;
} & BoxProps;

export const ChartPanelConfigurator = (props: ChartPanelProps) => {
  return (
    <>
      <ChartSelectionTabs editable />
      <ChartPanelInner {...props} />
    </>
  );
};

export const ChartPanelPublished = (
  props: ChartPanelProps & {
    chartType: ChartType;
  }
) => {
  return (
    <>
      <ChartSelectionTabs editable={false} />
      <ChartPanelInner {...props} />
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

const ChartPanelInner = ({ children, ...boxProps }: ChartPanelProps) => {
  const classes = useChartPanelInnerStyles();

  return (
    <Flex
      {...boxProps}
      className={classes.root}
      sx={{
        ...boxProps.sx,
        minHeight: [150, 300, 500],
      }}
    >
      {children}
    </Flex>
  );
};
