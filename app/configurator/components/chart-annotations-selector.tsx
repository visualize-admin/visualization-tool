import { useEffect, useRef } from "react";
import { Box } from "theme-ui";
import { ConfiguratorStateDescribingChart } from "..";
import { IconName } from "../../icons";
import { locales } from "../../locales/locales";
import { useLocale } from "../../locales/use-locale";
import { InteractiveFiltersOptions } from "../interactive-filters/interactive-filters-options";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import { EmptyRightPanel } from "./empty-right-panel";
import { MetaInputField } from "./field";
import { getFieldLabel } from "./ui-helpers";

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
        {state.activeField === "time" || state.activeField === "legend" ? (
          <InteractiveFiltersOptions state={state} />
        ) : (
          <ControlSection>
            <SectionTitle iconName={state.activeField as IconName}>
              {state.activeField && getFieldLabel(state.activeField)}
            </SectionTitle>
            <ControlSectionContent side="right">
              {state.activeField &&
                orderedLocales.map((locale) => (
                  <Box
                    key={`${locale}-${state.activeField!}`}
                    sx={{ ":not(:first-of-type)": { mt: 3 } }}
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
