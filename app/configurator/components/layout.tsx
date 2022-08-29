import { Trans } from "@lingui/macro";
import { Box, BoxProps, Button, Paper, Slide, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import React from "react";
import { TransitionGroup } from "react-transition-group";

import { ChartOptionsSelector } from "@/configurator/components/chart-options-selector";
import { useConfiguratorState } from "@/configurator/configurator-state";
import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";

import { ChartAnnotationsSelector } from "./chart-annotations-selector";

const useStyles = makeStyles((theme: Theme) => ({
  panelLeft: {
    overflowX: "hidden",
    overflowY: "hidden",
    backgroundColor: theme.palette.grey[100],
    borderRightColor: theme.palette.grey[500],
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    gridArea: "left",
    position: "relative",
  },
  panelPage: {
    height: "100%",
    position: "absolute",
    top: 0,
    width: "100%",
    overflowY: "auto",
  },
  panelRight: {
    backgroundColor: "white",
    overflowX: "hidden",
    overflowY: "auto",
    boxShadow: theme.shadows[5],
    borderLeftColor: theme.palette.grey[500],
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    gridArea: "right",
  },
  panelLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(12rem, 20rem) minmax(22rem, 1fr)",
    gridTemplateRows: "auto minmax(0, 1fr)",
    gridTemplateAreas: `
    "header header header"
    "left middle right"`,
    width: "100%",
    position: "fixed",
    // FIXME replace 96px with actual header size
    top: "96px",
    height: "calc(100vh - 96px)",
  },
  panelMiddle: {
    overflowX: "hidden",
    overflowY: "auto",
    gridArea: "middle",
    backgroundColor: theme.palette.background.paper,
  },
}));

const ChartOptionsSelectorPanel = () => {
  const [state] = useConfiguratorState();
  if (state.state === "CONFIGURING_CHART") {
    return <ChartOptionsSelector state={state} />;
  } else if (state.state === "DESCRIBING_CHART") {
    return <ChartAnnotationsSelector state={state} />;
  }
  return null;
};

export const PanelLeftWrapper = ({
  children,
  sx,
  className,
}: {
  children?: React.ReactNode;
  sx?: BoxProps["sx"];
  className?: BoxProps["className"];
}) => {
  const [state, dispatch] = useConfiguratorState();

  const classes = useStyles();
  const panels =
    // eslint-disable-next-line react/jsx-key
    state.activeField ? [<ChartOptionsSelectorPanel />] : [];
  return (
    <>
      <Box
        component="section"
        data-name="panel-left"
        className={clsx(classes.panelLeft, className)}
        sx={sx}
      >
        <TransitionGroup>
          <div className={classes.panelPage}>{children}</div>
          {panels.map((x, i) => {
            return (
              <Slide key={i} direction="right">
                <Paper elevation={2} square className={classes.panelPage}>
                  <Box sx={{ mx: 2, my: 2 }}>
                    <Button
                      variant="text"
                      size="small"
                      color="inherit"
                      sx={{ fontWeight: "bold" }}
                      startIcon={<SvgIcChevronLeft />}
                      onClick={() =>
                        dispatch({
                          type: "ACTIVE_FIELD_CHANGED",
                          value: undefined,
                        })
                      }
                    >
                      <Trans id="button.back">Back</Trans>
                    </Button>
                  </Box>
                  {x}
                </Paper>
              </Slide>
            );
          })}
        </TransitionGroup>
      </Box>
    </>
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
      data-name="panel-right"
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
      data-name="panel-middle"
      sx={sx}
    >
      {children}
    </Box>
  );
};
