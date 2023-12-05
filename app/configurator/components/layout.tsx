import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { HEADER_HEIGHT } from "@/components/header";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";

const useStyles = makeStyles<Theme>((theme) => ({
  panelHeader: {
    gridArea: "header",
    padding: theme.spacing(5),
  },
  LMRPanelHeader: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr) ${DRAWER_WIDTH}px`,
    gridTemplateAreas: `
    "left middle right"
    `,
    marginLeft: "auto",
    marginRight: "auto",
  },
  panelHeaderLeft: {
    gridArea: "left",
  },
  panelHeaderMiddle: {
    gridArea: "middle",
  },
  panelHeaderRight: {
    gridArea: "right",
  },
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
  panelMiddle: {
    overflowX: "hidden",
    overflowY: "auto",
    padding: theme.spacing(5),
    gridArea: "middle",
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
    marginLeft: "auto",
    marginRight: "auto",
  },
  // Left-Middle
  LMPanelLayout: {
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr)`,
    gridTemplateAreas: `
    "header header"
    "left middle"`,
  },
  LMRPanelLayout: {
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr) ${DRAWER_WIDTH}px`,
    gridTemplateAreas: `
    "header header header"
    "left middle right"`,
  },
}));

export const LMPanelLayout = (props: BoxProps) => {
  const { children, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      className={clsx(
        classes.panelLayout,
        classes.LMPanelLayout,
        rest.className
      )}
    >
      {children}
    </Box>
  );
};

export const LMRPanelLayout = (props: BoxProps) => {
  const { children, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      className={clsx(
        classes.panelLayout,
        classes.LMRPanelLayout,
        rest.className
      )}
    >
      {children}
    </Box>
  );
};

export const LMRPanelHeaderWrapper = (props: BoxProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-header"
      className={clsx(classes.panelHeader, classes.LMRPanelHeader, className)}
    >
      {children}
    </Box>
  );
};

export const PanelHeaderLeftWrapper = (props: BoxProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-header-left"
      className={clsx(classes.panelHeaderLeft, className)}
    >
      {children}
    </Box>
  );
};

export const PanelHeaderMiddleWrapper = (props: BoxProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-header-middle"
      className={clsx(classes.panelHeaderMiddle, className)}
    >
      {children}
    </Box>
  );
};

export const PanelHeaderRightWrapper = (props: BoxProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-header-right"
      className={clsx(classes.panelHeaderRight, className)}
    >
      {children}
    </Box>
  );
};

export const PanelLeftWrapper = (props: BoxProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-left"
      className={clsx(classes.panelLeft, className)}
    >
      {children}
    </Box>
  );
};

PanelLeftWrapper.defaultProps = {
  raised: true,
};

export const PanelMiddleWrapper = (props: BoxProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-middle"
      className={clsx(classes.panelMiddle, className)}
    >
      {children}
    </Box>
  );
};

export const PanelRightWrapper = (props: BoxProps) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-right"
      className={clsx(classes.panelRight, className)}
    >
      {children}
    </Box>
  );
};
