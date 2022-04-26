import { Box, BoxProps } from "@mui/material";
import React from "react";

const commonPanelStyles = {};

export const PanelLeftWrapper = ({
  children,
  raised,
  sx,
}: {
  children?: React.ReactNode;
  raised?: boolean;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      component="section"
      data-name="panel-left"
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        backgroundColor: "grey.100",
        boxShadow: raised ? "rightSide" : undefined,
        borderRightColor: raised ? "grey.500" : undefined,
        borderRightWidth: raised ? "1px" : undefined,
        borderRightStyle: raised ? "solid" : undefined,
        gridArea: "left",
        ...sx,
      }}
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
}: {
  children?: React.ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      component="section"
      data-name="panel-right"
      sx={{
        backgroundColor: "white",
        overflowX: "hidden",
        overflowY: "auto",
        boxShadow: "leftSide",
        borderLeftColor: "grey.500",
        borderLeftWidth: "1px",
        borderLeftStyle: "solid",
        gridArea: "right",
        ...sx,
      }}
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
  return (
    <Box
      {...boxProps}
      sx={{
        backgroundColor: "muted.main",
        display: "grid",
        gridTemplateColumns:
          "minmax(12rem, 20rem) minmax(22rem, 1fr) minmax(12rem, 20rem)",
        gridTemplateRows: "auto minmax(0, 1fr)",
        gridTemplateAreas: `
        "header header header"
        "left middle right"
        `,
        width: "100%",
        position: "fixed",
        // FIXME replace 96px with actual header size
        top: "96px",
        height: "calc(100vh - 96px)",
        ...sx,
      }}
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
}: {
  children: React.ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      component="section"
      data-name="panel-middle"
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        p: 4,
        gridArea: "middle",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
