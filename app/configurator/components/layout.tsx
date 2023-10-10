import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React from "react";

import { HEADER_HEIGHT } from "@/components/header";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";

const useStyles = makeStyles((theme: Theme) => ({
  panelLeft: {
    overflowX: "hidden",
    overflowY: "auto",
    backgroundColor: theme.palette.grey[100],
    boxShadow: "none",
    borderRightColor: theme.palette.divider,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    gridArea: "left",
  },
  panelRight: {
    backgroundColor: "white",
    overflowX: "hidden",
    overflowY: "auto",
    boxShadow: theme.shadows[5],
    borderLeftColor: theme.palette.divider,
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    gridArea: "right",
  },
  panelLayout: {
    position: "fixed",
    top: HEADER_HEIGHT,
    width: "100%",
    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
    display: "grid",
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr)`,
    gridTemplateRows: "auto minmax(0, 1fr)",
    gridTemplateAreas: `
    "header header"
    "left middle"`,
    marginLeft: "auto",
    marginRight: "auto",
  },
  panelMiddle: {
    overflowX: "hidden",
    overflowY: "auto",
    padding: theme.spacing(4),
    gridArea: "middle",
  },
}));

export const PanelLeftWrapper = ({
  children,
  sx,
  className,
}: {
  children?: React.ReactNode;
  sx?: BoxProps["sx"];
  className?: BoxProps["className"];
}) => {
  const classes = useStyles();
  return (
    <Box
      component="section"
      data-testid="panel-left"
      className={clsx(classes.panelLeft, className)}
      sx={sx}
    >
      {children}
    </Box>
  );
};

PanelLeftWrapper.defaultProps = {
  raised: true,
};

export const PanelRightWrapper = ({
  children,
  sx,
  className,
}: {
  children?: React.ReactNode;
  sx?: BoxProps["sx"];
  className?: BoxProps["className"];
}) => {
  const classes = useStyles();
  return (
    <Box
      component="section"
      data-testid="panel-right"
      className={clsx(classes.panelRight, className)}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export const PanelLayout = ({
  children,
  ...boxProps
}: {
  children: React.ReactNode;
} & BoxProps) => {
  const { sx } = boxProps;
  const classes = useStyles();
  return (
    <Box
      {...boxProps}
      className={clsx(classes.panelLayout, boxProps.className)}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export const PanelHeader = ({
  children,
  ...boxProps
}: {
  children: React.ReactNode;
} & BoxProps) => {
  const { sx } = boxProps;
  return (
    <Box
      component="section"
      role="navigation"
      {...boxProps}
      sx={{ gridArea: "header", ...sx }}
    >
      {children}
    </Box>
  );
};

export const PanelMiddleWrapper = ({
  children,
  sx,
  className,
}: {
  children: React.ReactNode;
  sx?: BoxProps["sx"];
  className?: BoxProps["className"];
}) => {
  const classes = useStyles();

  return (
    <Box
      className={clsx(classes.panelMiddle, className)}
      component="section"
      data-testid="panel-middle"
      sx={sx}
    >
      {children}
    </Box>
  );
};
