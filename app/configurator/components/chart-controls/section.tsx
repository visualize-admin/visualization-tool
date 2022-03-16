import { Box, BoxProps, Typography } from "@mui/material";

import { ElementType, forwardRef, ReactNode } from "react";
import { Icon, IconName } from "../../../icons";
import { useTheme } from "../../../themes";

export const ControlSection = forwardRef<
  HTMLDivElement,
  {
    role?: string;
    children: ReactNode;
    isHighlighted?: boolean;
    sx?: BoxProps["sx"];
  }
>(({ role, children, isHighlighted, sx }, ref) => {
  return (
    <Box
      ref={ref}
      role={role}
      sx={{
        borderTopColor: "grey.500",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        overflowX: "hidden",
        overflowY: "auto",
        backgroundColor: isHighlighted ? "primaryLight" : "grey.100",
        flexShrink: 0,
        "&:first-of-type": {
          borderTopWidth: 0,
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
});

export const ControlSectionContent = ({
  side,
  component,
  role,
  ariaLabelledBy,
  children,
  sx,
}: {
  side: "left" | "right";
  component?: ElementType;
  role?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      component={component}
      role={role}
      aria-labelledby={ariaLabelledBy}
      sx={{ px: side === "left" ? 2 : 4, pb: 4, ...sx }}
    >
      {children}
    </Box>
  );
};

export const SectionTitle = ({
  color,
  iconName,
  titleId,
  disabled,
  children,
}: {
  color?: string;
  iconName?: IconName;
  titleId?: string;
  disabled?: boolean;
  children: ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Typography
      variant="h5"
      id={titleId}
      sx={{
        p: 4,
        width: "100%",
        border: "none",
        justifyContent: "flex-start",
        color: disabled ? "grey.600" : color ?? "grey.800",
      }}
    >
      {iconName && (
        <Box mr={2}>
          <Icon
            color={disabled ? theme.palette.grey[600] : theme.palette.grey[700]}
            name={iconName}
          ></Icon>
        </Box>
      )}
      {children}
    </Typography>
  );
};
