import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

import { Meta, getChartConfig } from "@/config-types";
import {
  isAnnotationField,
  isConfiguring,
  isLayouting,
  useConfiguratorState,
} from "@/configurator";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { MetaInputField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { locales } from "@/locales/locales";
import { useLocale } from "@/locales/use-locale";

export const ChartAnnotationsSelector = () => {
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  return (
    <AnnotationOptions
      type="chart"
      activeField={chartConfig.activeField}
      meta={chartConfig.meta}
    />
  );
};

export const LayoutAnnotationsSelector = () => {
  const [state] = useConfiguratorState(isLayouting);
  return (
    <AnnotationOptions
      type="layout"
      activeField={state.layout.activeField}
      meta={state.layout.meta}
    />
  );
};

type AnnotationOptionsProps = {
  type: "chart" | "layout";
  activeField: string | undefined;
  meta: Meta;
};

const AnnotationOptions = (props: AnnotationOptionsProps) => {
  const { type, activeField, meta } = props;
  const locale = useLocale();
  // Reorder locales so the input field for
  // the current locale is on top
  const orderedLocales = [locale, ...locales.filter((l) => l !== locale)];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef?.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  if (!activeField || !isAnnotationField(activeField)) {
    return null;
  }

  return (
    <Box
      ref={panelRef}
      role="tabpanel"
      id={`annotation-panel-${activeField}`}
      aria-labelledby={`annotation-tab-${activeField}`}
      tabIndex={-1}
      sx={{ overflowX: "hidden", overflowY: "auto" }}
    >
      <ControlSection>
        <SectionTitle>{getFieldLabel(activeField)}</SectionTitle>
        <ControlSectionContent gap="none">
          {orderedLocales.map((locale) => (
            <Box
              key={`${locale}-${activeField}`}
              sx={{ ":not(:first-of-type)": { mt: 2 } }}
            >
              <MetaInputField
                type={type}
                metaKey={activeField}
                locale={locale}
                label={getFieldLabel(locale)}
                value={meta[activeField][locale]}
              />
            </Box>
          ))}
        </ControlSectionContent>
      </ControlSection>
    </Box>
  );
};
