import { init } from "fp-ts/lib/ReadonlyNonEmptyArray";
import React, { useContext, useState } from "react";
import { Box } from "theme-ui";

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
  initialExpanded,
}: {
  children: React.ReactNode;
  initialExpanded: boolean;
}) => {
  const accordionState = useState(initialExpanded);
  return (
    <AccordionContext.Provider value={accordionState}>
      {children}
    </AccordionContext.Provider>
  );
};

Accordion.defaultProps = {
  initialExpanded: false,
};

export const AccordionSummary = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useContext(AccordionContext);
  return (
    <Box
      style={{ cursor: "pointer" }}
      onClick={() => setExpanded((expanded) => !expanded)}
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
