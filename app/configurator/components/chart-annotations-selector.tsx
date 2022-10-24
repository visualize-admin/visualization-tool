import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

import { ConfiguratorStateDescribingChart } from "@/configurator";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { EmptyRightPanel } from "@/configurator/components/empty-right-panel";
import { MetaInputField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
import { InteractiveFiltersOptions } from "@/configurator/interactive-filters/interactive-filters-config-options";
import { locales } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";

export const ChartAnnotationsSelector = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [state.activeField]);
  const locale = useLocale();

  const af = state.activeField === "title" ? "title" : "description";

  // Reorder locales so the input field for
  // the current locale is on top
  const orderedLocales = [locale, ...locales.filter((l) => l !== locale)];

  if (state.activeField) {
    return (
      <Box
        role="tabpanel"
        id={`annotation-panel-${state.activeField}`}
        aria-labelledby={`annotation-tab-${state.activeField}`}
        ref={panelRef}
        tabIndex={-1}
        sx={{ overflowX: "hidden", overflowY: "auto" }}
      >
        {state.activeField === "time" ||
        state.activeField === "legend" ||
        state.activeField === "dataFilters" ? (
          <InteractiveFiltersOptions state={state} />
        ) : (
          <ControlSection>
            <SectionTitle iconName={getIconName(state.activeField)}>
              {state.activeField && getFieldLabel(state.activeField)}
            </SectionTitle>
            <ControlSectionContent gap="none">
              {state.activeField &&
                orderedLocales.map((locale) => (
                  <Box
                    key={`${locale}-${state.activeField!}`}
                    sx={{ ":not(:first-of-type)": { mt: 2 } }}
                  >
                    <MetaInputField
                      metaKey={state.activeField!}
                      locale={locale}
                      label={getFieldLabel(locale)}
                      value={state.meta[af][locale]}
                    />
                  </Box>
                ))}
            </ControlSectionContent>
          </ControlSection>
        )}
      </Box>
    );
  } else {
    return <EmptyRightPanel state={state} />;
  }
};
