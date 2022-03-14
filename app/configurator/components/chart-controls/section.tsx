import { Box, BoxProps, Flex, Text } from "@mui/material";

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
        borderTopColor: "monochrome500",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        overflowX: "hidden",
        overflowY: "auto",
        backgroundColor: isHighlighted ? "primaryLight" : "monochrome100",
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
  as,
  role,
  ariaLabelledBy,
  children,
  sx,
}: {
  side: "left" | "right";
  as?: ElementType;
  role?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  sx?: BoxProps["sx"];
}) => {
  return (
    <Box
      as={as}
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
    <Flex
      as="h2"
      id={titleId}
      sx={{
        p: 4,
        bg: "transparent",
        appearance: "none",
        width: "100%",
        border: "none",
        justifyContent: "flex-start",
        color: disabled ? "monochrome600" : color ?? "monochrome800",
      }}
    >
      {iconName && (
        <Icon
          color={
            disabled ? theme.colors.monochrome600 : theme.colors.monochrome700
          }
          name={iconName}
        ></Icon>
      )}
      <Typography
        as="div"
        variant="table"
        sx={{ fontWeight: "bold", ml: iconName ? 2 : 0 }}
      >
        {children}
      </Typography>
    </Flex>
  );
};
