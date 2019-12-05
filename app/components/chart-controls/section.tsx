import * as React from "react";
import { Box, Flex, Text } from "rebass";
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
      justifyContent="flex-start"
    >
      {iconName && (
        <Icon
          color={(theme as any).colors.monochrome["700"]}
          name={iconName}
        ></Icon>
      )}
      <Text
        variant="table"
        color="monochrome.800"
        ml={2}
        sx={{ fontFamily: "frutigerBold" }}
      >
        {children}
      </Text>
    </Flex>
  );
};
