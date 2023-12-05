import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { HEADER_HEIGHT } from "@/components/header";

const useStyles = makeStyles<Theme>((theme) => ({
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

export const PanelLeftWrapper = (props: BoxProps) => {
  const { children, sx, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
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

export const PanelRightWrapper = (props: BoxProps) => {
  const { children, sx, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-right"
      className={clsx(classes.panelRight, className)}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export const PanelLayout = (props: BoxProps) => {
  const { children, ...rest } = props;
  const { sx } = rest;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      className={clsx(classes.panelLayout, rest.className)}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export const PanelHeader = (props: BoxProps) => {
  const { children, ...boxProps } = props;
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

export const PanelMiddleWrapper = (props: BoxProps) => {
  const { children, sx, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-middle"
      className={clsx(classes.panelMiddle, className)}
      sx={sx}
    >
      {children}
    </Box>
  );
};
