import React from "react";
import { Box, ThemeUIStyleObject } from "theme-ui";

const commonPanelStyles = {};

export const PanelLeftWrapper = ({
  children,
  raised,
}: {
  children?: React.ReactNode;
  raised?: boolean;
}) => {
  return (
    <Box
      as="section"
      data-name="panel-left"
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        bgColor: "blue",
        boxShadow: raised ? "rightSide" : undefined,
        borderRightColor: raised ? "monochrome500" : undefined,
        borderRightWidth: raised ? "1px" : undefined,
        borderRightStyle: raised ? "solid" : undefined,
        gridArea: "left",
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
}: {
  children?: React.ReactNode;
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
  sx,
}: {
  children: React.ReactNode;
  sx?: ThemeUIStyleObject;
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
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
