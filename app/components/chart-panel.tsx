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
    display: "grid",
    gridTemplateColumns: "1fr",
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "50% 50%",
      "& > :nth-child(3n - 2)": {
        gridColumn: "1 / span 2",
      },
      "& > :nth-child(3n - 1, 3n)": {
        gridColumn: "1 / span 1",
      },
    },
    gap: theme.spacing(4),
  },
  chartWrapper: {
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

export type ChartWrapperProps = BoxProps & {
  editing?: boolean;
  layout?: Layout;
};

export const ChartWrapper = React.forwardRef<HTMLDivElement, ChartWrapperProps>(
  (props, ref) => {
    const { children, editing, layout, ...rest } = props;
    const classes = useStyles();

    return (
      <Box ref={ref} {...rest}>
        {(editing || layout?.type === "tab") && <ChartSelectionTabs />}
        <Box
          className={classes.chartWrapper}
          sx={{ minHeight: [150, 300, 500] }}
        >
          {children}
        </Box>
      </Box>
    );
  }
);
