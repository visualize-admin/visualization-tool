import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import capitalize from "lodash/capitalize";
import React from "react";

import { ChartSelectionTabs } from "@/components/chart-selection-tabs";
import { Layout } from "@/config-types";

const useStyles = makeStyles((theme: Theme) => ({
  panelLayoutVertical: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  panelLayoutTall: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  chartPanel: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.grey[100],
    border: "1px solid",
    borderColor: theme.palette.divider,
    overflow: "hidden",
    width: "auto",
    height: "100%",
  },
}));

type ChartPanelLayoutProps = React.PropsWithChildren<{
  type: Extract<Layout, { type: "dashboard" }>["layout"];
}>;

export const ChartPanelLayout = (props: ChartPanelLayoutProps) => {
  const { children, type } = props;
  const classes = useStyles();

  return (
    <div
      className={
        classes[
          `panelLayout${
            capitalize(type) as Capitalize<ChartPanelLayoutProps["type"]>
          }`
        ]
      }
    >
      {children}
    </div>
  );
};

export type ChartPanelProps = BoxProps & {
  editing?: boolean;
  layout?: Layout;
};

export const ChartPanel = React.forwardRef<HTMLDivElement, ChartPanelProps>(
  (props, ref) => {
    const { children, editing, layout, ...rest } = props;
    const classes = useStyles();

    return (
      <Box ref={ref} {...rest}>
        {(editing || layout?.type === "tab") && <ChartSelectionTabs />}
        <Box className={classes.chartPanel} sx={{ minHeight: [150, 300, 500] }}>
          {children}
        </Box>
      </Box>
    );
  }
);
