import React, { useRef, useEffect } from "react";
import { ConfiguratorStateDescribingChart } from "../domain";
import { locales } from "../locales/locales";
import { SectionTitle } from "./chart-controls";
import { MetaInputField } from "./field";
import { Box } from "@theme-ui/components";
import { getFieldLabel } from "../domain/helpers";
import { EmptyRightPanel } from "./empty-right-panel";

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

  const af = state.activeField === "title" ? "title" : "description";
  if (state.activeField) {
    return (
      <Box
        variant="controlSection"
        role="tabpanel"
        id={`annotation-panel-${state.activeField}`}
        aria-labelledby={`annotation-tab-${state.activeField}`}
        ref={panelRef}
        tabIndex={-1}
        sx={{ overflowX: "hidden", overflowY: "scroll" }}
      >
        <>
          <SectionTitle iconName="text">
            {state.activeField && getFieldLabel(state.activeField)}
          </SectionTitle>
          <Box variant="rightControlSectionContent">
            {state.activeField &&
              locales.map(locale => (
                <MetaInputField
                  key={`${locale}-${state.activeField!}`}
                  metaKey={state.activeField!}
                  locale={locale}
                  label={getFieldLabel(locale)}
                  value={state.meta[af][locale]}
                />
              ))}
          </Box>
        </>
      </Box>
    );
  } else {
    return <EmptyRightPanel state={state} />;
  }
};
