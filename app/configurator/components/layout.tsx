import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import { DRAWER_WIDTH } from "@/configurator/components/drawer";

export const LAYOUT_HEADER_HEIGHT = 96;

const useStyles = makeStyles<Theme>((theme) => ({
  panelLayout: {
    position: "fixed",
    top: HEADER_HEIGHT_CSS_VAR,
    width: "100%",
    height: `calc(100vh - ${HEADER_HEIGHT_CSS_VAR})`,
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr)",
    marginLeft: "auto",
    marginRight: "auto",
  },
  MPanelLayout: {
    gridTemplateColumns: `minmax(22rem, 1fr)`,
    gridTemplateAreas: `
    "header"
    "middle"`,
  },
  LMPanelLayout: {
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr)`,
    gridTemplateAreas: `
    "header header"
    "left middle"`,
  },
  MRPanelLayout: {
    gridTemplateColumns: `minmax(22rem, 1fr) ${DRAWER_WIDTH}px`,
    gridTemplateAreas: `
    "header header"
    "middle right"`,
  },
  LMRPanelLayout: {
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr) ${DRAWER_WIDTH}px`,
    gridTemplateAreas: `
    "header header header"
    "left middle right"`,
  },
  panelHeaderLayout: {
    gridArea: "header",
    height: LAYOUT_HEADER_HEIGHT,
  },
  LMRPanelHeaderLayout: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr) minmax(${DRAWER_WIDTH}px, auto)`,
    gridTemplateAreas: `
    "left middle right"
    `,
    marginLeft: "auto",
    marginRight: "auto",
  },
  LPanelHeaderWrapper: {
    gridArea: "left",
  },
  MPanelHeaderWrapper: {
    gridArea: "middle",
    padding: theme.spacing(4),
  },
  RPanelHeaderWrapper: {
    gridArea: "right",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(5),
  },
  LPanelBodyWrapper: {
    overflowX: "hidden",
    overflowY: "auto",
    boxShadow: "none",
    borderRightColor: theme.palette.divider,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    gridArea: "left",
  },
  MPanelBodyWrapper: {
    gridArea: "middle",
  },
  RPanelBodyWrapper: {
    overflowX: "hidden",
    overflowY: "auto",
    boxShadow: theme.shadows[5],
    borderLeftColor: theme.palette.divider,
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    gridArea: "right",
  },
}));

type PanelHeaderLayoutProps = BoxProps & {
  type: "LMR";
};

export const PanelHeaderLayout = (props: PanelHeaderLayoutProps) => {
  const { children, type, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid="panel-header"
      className={clsx(
        classes.panelHeaderLayout,
        classes[`${type}PanelHeaderLayout`],
        rest.className
      )}
    >
      {children}
    </Box>
  );
};

type PanelHeaderWrapperProps = BoxProps & {
  type: "L" | "M" | "R";
};

export const PanelHeaderWrapper = (props: PanelHeaderWrapperProps) => {
  const { children, type, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid={`panel-header-${type}`}
      className={clsx(classes[`${type}PanelHeaderWrapper`], rest.className)}
    >
      {children}
    </Box>
  );
};

type PanelLayoutProps = BoxProps & {
  type: "M" | "LM" | "MR" | "LMR";
};

export const PanelLayout = (props: PanelLayoutProps) => {
  const { children, type, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      className={clsx(
        classes.panelLayout,
        classes[`${type}PanelLayout`],
        rest.className
      )}
    >
      {children}
    </Box>
  );
};

export const PanelBodyWrapper = (
  props: BoxProps & {
    type: "L" | "M" | "R";
  }
) => {
  const { children, type, ...rest } = props;
  const classes = useStyles();

  return (
    <Box
      {...rest}
      component="section"
      data-testid={`panel-body-${type}`}
      className={clsx(classes[`${type}PanelBodyWrapper`], rest.className)}
    >
      {children}
    </Box>
  );
};
