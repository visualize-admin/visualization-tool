import { string } from "fp-ts";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Flex, FlexProps } from "theme-ui";
import { theme } from "../../themes/federal";

const AccordionArrow = ({ expanded }: { expanded?: boolean }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentcolor"
      style={{
        display: "inline",
        position: "relative",
        top: 5,
        marginRight: -5,
        transform: expanded ? undefined : "rotate(-90deg)",
      }}
    >
      <path d="M7 10l5 5 5-5z"></path>
    </svg>
  );
};

const defaultTheme = {
  borderColor: "monochrome400",
  bg: "monochrome300",
};

const AccordionContext = React.createContext<{
  expandedState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  theme: AccordionTheme;
}>({
  expandedState: [false, () => false],
  theme: defaultTheme,
});

export const Accordion = ({
  children,
  expanded,
  initialExpanded = false,
  theme = defaultTheme,
}: {
  children: React.ReactNode;
  initialExpanded: boolean;
  expanded: boolean;
  theme?: AccordionTheme;
}) => {
  const expandedState = useState(initialExpanded);
  useEffect(() => {
    if (expandedState[0] !== expanded) {
      expandedState[1](expanded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);
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
  expanded: false,
};

type AccordionTheme = {
  borderColor: string;
  bg: string;
};

export const AccordionSummary = ({
  children,
  ...flexProps
}: {
  children: React.ReactNode;
} & FlexProps) => {
  const {
    expandedState: [expanded, setExpanded],
    theme,
  } = useContext(AccordionContext);
  return (
    <Flex
      onClick={() => setExpanded((expanded) => !expanded)}
      {...flexProps}
      sx={{
        alignItems: "center",
        p: 3,
        justifyContent: "space-between",
        cursor: "pointer",
        // border: "1px solid",
        // borderColor: theme.borderColor,
        bg: theme.bg,
        borderRadius: 4,
        height: "2.5rem",
        mb: 2,
      }}
    >
      {children}
      <AccordionArrow expanded={expanded} />
    </Flex>
  );
};

export const AccordionContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    expandedState: [expanded, setExpanded],
  } = useContext(AccordionContext);
  return expanded ? <>{children}</> : null;
};
