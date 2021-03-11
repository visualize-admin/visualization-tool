import { Box, Flex, Text } from "theme-ui";

import { ElementType, forwardRef, ReactNode } from "react";
import { Icon, IconName } from "../../../icons";
import { useTheme } from "../../../themes";

export const ControlSection = forwardRef<
  HTMLDivElement,
  {
    role?: string;
    children: ReactNode;
    isHighlighted?: boolean;
  }
>(({ role, children, isHighlighted }, ref) => {
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

        "&:first-of-type": {
          borderTopWidth: 0,
        },
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
      <Text variant="table" sx={{ fontWeight: "bold", ml: iconName ? 2 : 0 }}>
        {children}
      </Text>
    </Flex>
  );
};
