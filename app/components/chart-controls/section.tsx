import * as React from "react";
import { Box, Flex, Text } from "@theme-ui/components";
import { Icon, IconName } from "../../icons";
import { useTheme } from "../../themes";

export const CollapsibleSection = ({
  title,
  titleId,
  children
}: {
  title?: React.ReactNode;
  titleId?: string;
  children: React.ReactNode;
}) => {
  return (
    <Box variant="controlSection">
      {title && <SectionTitle titleId={titleId}> {title}</SectionTitle>}
      {children}
    </Box>
  );
};

export const SectionTitle = ({
  iconName,
  titleId,
  children
}: {
  iconName?: IconName;
  titleId?: string;

  children: React.ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Flex
      id={titleId}
      as="h2"
      variant="controlSectionTitle"
      color="monochrome800"
      sx={{ justifyContent: "flex-start" }}
    >
      {iconName && (
        <Icon color={theme.colors.monochrome700} name={iconName}></Icon>
      )}
      <Text ml={iconName ? 2 : 0}>{children}</Text>
    </Flex>
  );
};
