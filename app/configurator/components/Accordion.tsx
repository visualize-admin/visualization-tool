import { init } from "fp-ts/lib/ReadonlyNonEmptyArray";
import React, { useContext, useEffect, useState } from "react";
import { Box, BoxProps } from "theme-ui";

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

const AccordionContext = React.createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>]
>([false, () => false]);

export const Accordion = ({
  children,
  expanded,
}: {
  children: React.ReactNode;
  expanded: boolean;
}) => {
  const expandedState = useState(expanded);
  useEffect(() => {
    if (expandedState[0] !== expanded) {
      expandedState[1](expanded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);
  return (
    <AccordionContext.Provider value={expandedState}>
      {children}
    </AccordionContext.Provider>
  );
};

Accordion.defaultProps = {
  expanded: false,
};

export const AccordionSummary = ({
  children,
  ...boxProps
}: {
  children: React.ReactNode;
} & BoxProps) => {
  const [expanded, setExpanded] = useContext(AccordionContext);
  return (
    <Box
      onClick={() => setExpanded((expanded) => !expanded)}
      {...boxProps}
      sx={{
        cursor: "pointer",
        ...boxProps.sx,
      }}
    >
      <AccordionArrow expanded={expanded} /> {children}
    </Box>
  );
};

export const AccordionContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useContext(AccordionContext);
  return expanded ? <>{children}</> : null;
};
