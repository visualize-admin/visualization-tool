import React from "react";
import { Box } from "theme-ui";

export const PanelLeftWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      as="section"
      data-name="panel-left"
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        bg: "monochrome100",
        boxShadow: "rightSide",
        borderRightColor: "monochrome500",
        borderRightWidth: "1px",
        borderRightStyle: "solid",
        gridArea: "left",
      }}
    >
      {children}
    </Box>
  );
};

export const PanelRightWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      as="section"
      data-name="panel-right"
      sx={{
        bg: "mutedColored",
        overflowX: "hidden",
        overflowY: "auto",
        boxShadow: "leftSide",
        borderLeftColor: "monochrome500",
        borderLeftWidth: "1px",
        borderLeftStyle: "solid",
        gridArea: "right",
      }}
    >
      {children}
    </Box>
  );
};

export const PanelMiddleWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      as="section"
      data-name="panel-middle"
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        p: 4,
        gridArea: "middle",
      }}
    >
      {children}
    </Box>
  );
};
