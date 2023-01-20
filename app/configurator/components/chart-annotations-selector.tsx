import { Box } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { MetaInputField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getIconName } from "@/configurator/components/ui-helpers";
import { InteractiveFiltersOptions } from "@/configurator/interactive-filters/interactive-filters-config-options";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { locales } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";

import { ConfiguratorStateConfiguringChart } from "../config-types";

const TitleAndDescriptionOptions = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { activeField, meta } = state;

  const locale = useLocale();
  // Reorder locales so the input field for
  // the current locale is on top
  const orderedLocales = [locale, ...locales.filter((l) => l !== locale)];

  if (!activeField) {
    return null;
  }

  return (
    <ControlSection>
      <SectionTitle iconName={getIconName(activeField)}>
        {getFieldLabel(activeField)}
      </SectionTitle>
      <ControlSectionContent gap="none">
        {orderedLocales.map((d) => (
          <Box
            key={`${d}-${activeField!}`}
            sx={{ ":not(:first-of-type)": { mt: 2 } }}
          >
            <MetaInputField
              metaKey={activeField}
              locale={d}
              label={getFieldLabel(d)}
              value={meta[activeField === "title" ? "title" : "description"][d]}
            />
          </Box>
        ))}
      </ControlSectionContent>
    </ControlSection>
  );
};

export const ChartAnnotationsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { activeField } = state;
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  const isInteractiveFilterField = useMemo(() => {
    switch (activeField as InteractiveFilterType) {
      case "dataFilters":
      case "legend":
      case "timeRange":
        return true;

      default:
        return false;
    }
  }, [activeField]);

  if (activeField) {
    return (
      <Box
        role="tabpanel"
        id={`annotation-panel-${activeField}`}
        aria-labelledby={`annotation-tab-${activeField}`}
        ref={panelRef}
        tabIndex={-1}
        sx={{ overflowX: "hidden", overflowY: "auto" }}
      >
        {isInteractiveFilterField ? (
          <InteractiveFiltersOptions state={state} />
        ) : (
          <TitleAndDescriptionOptions state={state} />
        )}
      </Box>
    );
  } else {
    return null;
  }
};
