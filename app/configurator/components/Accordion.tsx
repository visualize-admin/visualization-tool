import { Box, BoxProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import cx from "clsx";
import React, { useContext, useEffect, useMemo, useState } from "react";

import Flex, { FlexProps } from "@/components/flex";
import SvgIcChevronLeft from "@/icons/components/IcChevronLeft";

const AccordionArrow = ({
  expanded,
  ...boxProps
}: { expanded?: boolean } & BoxProps) => {
  return (
    <Box component="span" mr={1} {...boxProps}>
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
  borderColor: "grey.400",
  backgroundColor: "transparent",
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
  className,
}: {
  children: React.ReactNode;
  initialExpanded?: boolean;
  expanded?: boolean;
  theme?: AccordionTheme;
  className?: string;
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
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
};

Accordion.defaultProps = {
  initialExpanded: true,
};

type AccordionTheme = {
  borderColor: string;
  backgroundColor: string;
};

const useStyles = makeStyles((theme) => {
  return {
    root: {
      alignItems: "center",
      justifyContent: "stretch",
      cursor: "pointer",
      borderRadius: 2,
    },
    children: {
      flexGrow: 1,
    },
  };
});

export const AccordionSummary = ({
  children,
  className,
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
  const classes = useStyles();
  return (
    <Flex {...flexProps} className={cx(classes.root, className)}>
      {hasArrow && (
        <AccordionArrow
          expanded={expanded}
          onClick={() => setExpanded((expanded) => !expanded)}
        />
      )}
      <Flex className={classes.children}>{children}</Flex>
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
