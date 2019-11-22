import React from "react";
import { ConfiguratorStateDescribingChart } from "../domain";
import { locales } from "../locales/locales";
import { CollapsibleSection } from "./chart-controls";
import { MetaInputField } from "./field";

export const ChartAnnotationsSelector = ({
  state
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  return (
    <CollapsibleSection title={state.activeField}>
      {state.activeField &&
        locales.map(locale => (
          <MetaInputField
            key={`${locale}-${state.activeField!}`}
            metaKey={state.activeField!} // FIXME !
            locale={locale}
            label={locale}
          />
        ))}
    </CollapsibleSection>
  );
};
