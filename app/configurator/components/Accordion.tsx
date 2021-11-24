import React, { useContext, useEffect, useMemo, useState } from "react";
import { Box, BoxProps, Flex, FlexProps } from "theme-ui";
import SvgIcChevronLeft from "../../icons/components/IcChevronLeft";

const AccordionArrow = ({
  expanded,
  ...boxProps
}: { expanded?: boolean } & BoxProps) => {
  return (
    <Box as="span" mr={2} sx={{}} {...boxProps}>
      <SvgIcChevronLeft
        sx={{
          transition: "transform 0.5s ease",
          transform: expanded ? "rotate(270deg)" : "rotate(180deg)",
        }}
      />
    </Box>
  );
};

const defaultTheme = {
  borderColor: "monochrome400",
  bg: "transparent",
};

const AccordionContext = React.createContext<{
  expandedState: [
    boolean | undefined,
    React.Dispatch<React.SetStateAction<boolean | undefined>>
  ];
  theme: AccordionTheme;
}>({
  expandedState: [false, () => false],
  theme: defaultTheme,
});

const useControlledState = <T extends unknown>(initial: T, propValue: T) => {
  const state = useState(initial);
  const [value, setValue] = state;
  useEffect(() => {
    if (value !== propValue && propValue !== undefined) {
      setValue(propValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propValue]);
  return state;
};

export const Accordion = ({
  children,
  expanded,
  initialExpanded = false,
  theme = defaultTheme,
}: {
  children: React.ReactNode;
  initialExpanded?: boolean;
  expanded?: boolean;
  theme?: AccordionTheme;
}) => {
  const expandedState = useControlledState(
    initialExpanded as boolean,
    expanded
  );
  const context = useMemo(
    () => ({ expandedState, theme }),
    [expandedState, theme]
  );
  return (
    <AccordionContext.Provider value={context}>
      <div>{children}</div>
    </AccordionContext.Provider>
  );
};

Accordion.defaultProps = {
  initialExpanded: true,
};

type AccordionTheme = {
  borderColor: string;
  bg: string;
};

export const AccordionSummary = ({
  children,
  hasArrow = true,
  ...flexProps
}: {
  children: React.ReactNode;
  hasArrow?: boolean;
} & FlexProps) => {
  const {
    expandedState: [expanded, setExpanded],
    theme,
  } = useContext(AccordionContext);
  return (
    <Flex
      {...flexProps}
      sx={{
        alignItems: "center",
        justifyContent: "stretch",
        cursor: "pointer",
        // border: "1px solid",
        // borderColor: theme.borderColor,
        bg: theme.bg,
        borderRadius: 4,
        height: "2.5rem",
      }}
    >
      {hasArrow && (
        <AccordionArrow
          expanded={expanded}
          onClick={() => setExpanded((expanded) => !expanded)}
        />
      )}
      <Flex sx={{ flexGrow: 1 }}>{children}</Flex>
    </Flex>
  );
};

export const AccordionContent = ({
  children,
  ...boxProps
}: {
  children: React.ReactNode;
} & BoxProps) => {
  const {
    expandedState: [expanded],
  } = useContext(AccordionContext);
  return (
    <Box
      {...boxProps}
      sx={{
        transform: expanded ? "scaleY(1)" : "scaleY(0)",
        transformOrigin: "center 0",
        maxHeight: expanded ? "10000px" : 0,
        transition:
          "transform 0.15s ease, opacity 0.15s ease, max-height 0.15s ease-out",
        opacity: expanded ? 1 : 0,
      }}
    >
      {children}
    </Box>
  );
};
