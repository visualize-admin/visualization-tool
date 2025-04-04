import { Box, Button, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

import { Meta } from "@/config-types";
import { getChartConfig } from "@/config-utils";
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
import { useOrderedLocales } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

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
  const [_, dispatch] = useConfiguratorState();
  const orderedLocales = useOrderedLocales();
  const panelRef = useRef<HTMLDivElement>(null);
  const handleClosePanel = useEvent(() => {
    dispatch({
      type:
        type === "chart"
          ? "CHART_ACTIVE_FIELD_CHANGED"
          : "LAYOUT_ACTIVE_FIELD_CHANGED",
      value: undefined,
    });
  });

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
        <SectionTitle closable>{getFieldLabel(activeField)}</SectionTitle>
        <ControlSectionContent gap="none">
          {orderedLocales.map((locale) => (
            <Box
              key={`${locale}-${activeField}`}
              sx={{ ":not(:first-of-type)": { mt: 2 } }}
            >
              <MetaInputField
                type={type}
                inputType={activeField === "label" ? "text" : "markdown"}
                metaKey={activeField}
                locale={locale}
                label={getFieldLabel(locale)}
                value={meta[activeField][locale]}
              />
            </Box>
          ))}
          <Button
            size="sm"
            onClick={handleClosePanel}
            sx={{ alignSelf: "flex-end", mt: 3, px: 5 }}
          >
            <Typography component="span">Ok</Typography>
          </Button>
        </ControlSectionContent>
      </ControlSection>
    </Box>
  );
};
