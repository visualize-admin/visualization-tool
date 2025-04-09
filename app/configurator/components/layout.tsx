import { Box, BoxProps, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import { HEADER_HEIGHT_CSS_VAR } from "@/components/header-constants";
import { DRAWER_WIDTH } from "@/configurator/components/drawers";
import { useResizeObserver } from "@/utils/use-resize-observer";

export const LAYOUT_HEADER_HEIGHT = 88;

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
    backgroundColor: theme.palette.monochrome[100],
  },
  LMPanelLayout: {
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr)`,
    gridTemplateAreas: `
    "header header"
    "left middle"`,
    backgroundColor: theme.palette.monochrome[100],
  },
  MRPanelLayout: {
    gridTemplateColumns: `minmax(22rem, 1fr) ${DRAWER_WIDTH}px`,
    gridTemplateAreas: `
    "header header"
    "middle right"`,
    backgroundColor: theme.palette.monochrome[100],
  },
  LMRPanelLayout: {
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr) ${DRAWER_WIDTH}px`,
    gridTemplateAreas: `
    "header header header"
    "left middle right"`,
    backgroundColor: theme.palette.monochrome[100],
  },
  panelHeaderLayout: {
    gridArea: "header",
    height: LAYOUT_HEADER_HEIGHT,
    borderBottom: `1px solid ${theme.palette.cobalt[100]}`,
    backgroundColor: theme.palette.background.paper,
  },
  LMRPanelHeaderLayout: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: `${DRAWER_WIDTH}px minmax(22rem, 1fr) minmax(${DRAWER_WIDTH}px, auto)`,
    gridTemplateAreas: `
    "left middle right"
    `,
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: theme.spacing(12),
    paddingRight: theme.spacing(12),
    backgroundColor: theme.palette.background.paper,
  },
  LPanelHeaderWrapper: {
    gridArea: "left",
    backgroundColor: theme.palette.background.paper,
  },
  MPanelHeaderWrapper: {
    gridArea: "middle",
    backgroundColor: theme.palette.background.paper,
  },
  RPanelHeaderWrapper: {
    gridArea: "right",
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
  },
  LPanelBodyWrapper: {
    overflowX: "hidden",
    overflowY: "auto",
    gridArea: "left",
    outline: `1px solid ${theme.palette.cobalt[100]}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "none",
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

const __PANEL_HEADER_CSS_VAR = "--panel-header";
export const PANEL_HEADER_CSS_VAR = `var(${__PANEL_HEADER_CSS_VAR})`;

export const PanelHeaderLayout = (
  props: BoxProps & {
    type: "LMR";
  }
) => {
  const { children, type, ...rest } = props;
  const classes = useStyles();
  const [ref] = useResizeObserver<HTMLDivElement>(({ height }) => {
    if (height) {
      document.documentElement.style.setProperty(
        __PANEL_HEADER_CSS_VAR,
        `${height}px`
      );
    }
  });

  return (
    <Box
      {...rest}
      ref={ref}
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
