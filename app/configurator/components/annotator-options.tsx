import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

import { Meta } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  isAnnotatorField,
  isConfiguring,
  isLayouting,
  useConfiguratorState,
} from "@/configurator";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ConfirmButton } from "@/configurator/components/confirm-button";
import { MetaInputField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { useOrderedLocales } from "@/locales/use-locale";
import { useEvent } from "@/utils/use-event";

export const ChartAnnotatorSelector = () => {
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  return (
    <AnnotatorOptions
      type="chart"
      activeField={chartConfig.activeField}
      meta={chartConfig.meta}
    />
  );
};

export const LayoutAnnotatorSelector = () => {
  const [state] = useConfiguratorState(isLayouting);

  return (
    <AnnotatorOptions
      type="layout"
      activeField={state.layout.activeField}
      meta={state.layout.meta}
    />
  );
};

const AnnotatorOptions = ({
  type,
  activeField,
  meta,
}: {
  type: "chart" | "layout";
  activeField: string | undefined;
  meta: Meta;
}) => {
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

  if (!activeField || !isAnnotatorField(activeField)) {
    return null;
  }

  return (
    <Box
      ref={panelRef}
      role="tabpanel"
      id={`annotator-panel-${activeField}`}
      aria-labelledby={`annotator-tab-${activeField}`}
      tabIndex={-1}
      sx={{ overflowX: "hidden", overflowY: "auto" }}
    >
      <ControlSection hideTopBorder>
        <SectionTitle closable>{getFieldLabel(activeField)}</SectionTitle>
        <ControlSectionContent>
          {orderedLocales.map((locale) => (
            <div key={`${locale}-${activeField}`}>
              <MetaInputField
                type={type}
                inputType={activeField === "label" ? "text" : "markdown"}
                metaKey={activeField}
                locale={locale}
                label={getFieldLabel(locale)}
                value={meta[activeField][locale]}
                disableToolbar={{
                  blockType: true,
                  listToggles: activeField === "title",
                  link: activeField === "title",
                }}
              />
            </div>
          ))}
          <ConfirmButton onClick={handleClosePanel} />
        </ControlSectionContent>
      </ControlSection>
    </Box>
  );
};
