import { Box, Flex, Text } from "@theme-ui/components";
import * as React from "react";
import { ElementType, ReactNode } from "react";
import { Icon, IconName } from "../../icons";
import { useTheme } from "../../themes";

export const ControlSection = ({
  role,
  children
}: {
  role?: string;
  children: ReactNode;
}) => {
  return (
    <Box
      role={role}
      sx={{
        borderTopColor: "monochrome500",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        overflowX: "hidden",
        overflowY: "scroll",

        "&:first-of-type": {
          borderTopWidth: 0
        }
      }}
    >
      {children}
    </Box>
  );
};
export const ControlSectionContent = ({
  side,
  as,
  role,
  ariaLabelledBy,
  children
}: {
  side: "left" | "right";
  as?: ElementType;
  role?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}) => {
  return (
    <Box
      as={as}
      role={role}
      aria-labelledby={ariaLabelledBy}
      sx={{ px: side === "left" ? 2 : 4, pb: 4 }}
    >
      {children}
    </Box>
  );
};

export const SectionTitle = ({
  iconName,
  titleId,
  disabled,
  children
}: {
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
      color="monochrome800"
      sx={{
        p: 4,
        bg: "transparent",
        appearance: "none",
        width: "100%",
        border: "none",
        justifyContent: "flex-start",
        color: disabled ? "monochrome600" : "monochrome800"
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
      <Text variant="table" sx={{ fontWeight: "bold", ml: iconName ? 2 : 0 }}>
        {children}
      </Text>
    </Flex>
  );
};
