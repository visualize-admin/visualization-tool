import React, { useRef, useEffect } from "react";
import { ConfiguratorStateDescribingChart } from "../domain";
import { locales } from "../locales/locales";
import { SectionTitle } from "./chart-controls";
import { MetaInputField } from "./field";
import { Box } from "rebass";
import { getFieldLabel } from "../domain/helpers";

export const ChartAnnotationsSelector = ({
  state
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [state.activeField]);

  if (state.activeField !== "title" && state.activeField !== "description") {
    return <div></div>; // To avoid focus on first mount
  }
  const af = state.activeField === "title" ? "title" : "description";
  return (
    <Box
      variant="controlSection"
      role="tabpanel"
      id={`annotation-panel-${state.activeField}`}
      aria-labelledby={`annotation-tab-${state.activeField}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <SectionTitle iconName="text">
        {state.activeField && getFieldLabel(state.activeField)}
      </SectionTitle>
      <Box variant="controlSectionContent">
        {state.activeField &&
          locales.map(locale => (
            <MetaInputField
              key={`${locale}-${state.activeField!}`}
              metaKey={state.activeField!}
              locale={locale}
              label={locale}
              value={state.meta[af][locale]}
            />
          ))}
      </Box>
    </Box>
  );
};
