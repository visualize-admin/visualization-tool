import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { MetaInputField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { locales } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";

import {
  ConfiguratorStateConfiguringChart,
  getChartConfig,
} from "../../config-types";

const TitleAndDescriptionOptions = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const chartConfig = getChartConfig(state);
  const { activeField, meta } = chartConfig;

  const locale = useLocale();
  // Reorder locales so the input field for
  // the current locale is on top
  const orderedLocales = [locale, ...locales.filter((l) => l !== locale)];

  if (!activeField) {
    return null;
  }

  return (
    <ControlSection>
      <SectionTitle>{getFieldLabel(activeField)}</SectionTitle>
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
  const chartConfig = getChartConfig(state);
  const { activeField } = chartConfig;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef?.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  return activeField ? (
    <Box
      role="tabpanel"
      id={`annotation-panel-${activeField}`}
      aria-labelledby={`annotation-tab-${activeField}`}
      ref={panelRef}
      tabIndex={-1}
      sx={{ overflowX: "hidden", overflowY: "auto" }}
    >
      <TitleAndDescriptionOptions state={state} />
    </Box>
  ) : null;
};
