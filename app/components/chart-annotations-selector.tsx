import React from "react";
import { ConfiguratorStateDescribingChart } from "../domain";
import { locales } from "../locales/locales";
import { CollapsibleSection } from "./chart-controls";
import { MetaInputField } from "./field";
import { getFieldLabel } from "./chart-controls/control-tab";

export const ChartAnnotationsSelector = ({
  state
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  // FIXME: use an identity function to ensure type safety
  const af = state.activeField === "title" ? "title" : "description";

  return (
    <CollapsibleSection
      title={state.activeField && getFieldLabel(state.activeField)}
    >
      {state.activeField &&
        locales.map(locale => (
          <MetaInputField
            key={`${locale}-${state.activeField!}`}
            metaKey={state.activeField!} // FIXME !
            locale={locale}
            label={locale}
            value={state.meta[af][locale]}
          />
        ))}
    </CollapsibleSection>
  );
};
