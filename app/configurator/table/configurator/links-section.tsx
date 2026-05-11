import { t, Trans } from "@lingui/macro";
import { SelectChangeEvent } from "@mui/material";
import { useMemo } from "react";

import { Select } from "@/components/form";
import { TableConfig } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ChartOptionCheckboxField } from "@/configurator/components/field";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { Dimension } from "@/domain/data";
import { useLocale, useOrderedLocales } from "@/locales/use-locale";
import { useEvent } from "@/utils/use-event";

import { LinkBaseUrlInput } from "./link-base-url-input";

export const TableLinksSection = ({
  chartConfig,
  dimensions,
}: {
  chartConfig: TableConfig;
  dimensions: Dimension[];
}) => {
  const locale = useLocale();
  const orderedLocales = useOrderedLocales();
  const [_, dispatch] = useConfiguratorState(isConfiguring);

  const dimensionOptions = useMemo(() => {
    return dimensions.map((d) => ({
      value: d.id,
      label: d.label,
    }));
  }, [dimensions]);

  const handleLinkComponentIdChange = useEvent(
    (e: SelectChangeEvent<unknown>) => {
      const linkComponentId = e.target.value as string;
      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field: null,
          path: "links.componentId",
          value: linkComponentId,
        },
      });

      if (chartConfig.links.targetComponentId === "") {
        dispatch({
          type: "CHART_FIELD_UPDATED",
          value: {
            locale,
            field: null,
            path: "links.targetComponentId",
            value: linkComponentId,
          },
        });
      }
    }
  );

  const handleTargetComponentIdChange = useEvent(
    (e: SelectChangeEvent<unknown>) => {
      const targetComponentId = e.target.value as string;
      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field: null,
          path: "links.targetComponentId",
          value: targetComponentId,
        },
      });
    }
  );

  return (
    <ControlSection collapse defaultExpanded={false}>
      <SectionTitle id="controls-links">
        <Trans id="controls.section.links">Links</Trans>
      </SectionTitle>
      <ControlSectionContent>
        <ChartOptionCheckboxField
          label={t({
            id: "controls.tableSettings.showLinks",
            message: "Enable links",
          })}
          field={null}
          path="links.enabled"
        />
        {orderedLocales.map((locale) => (
          <div key={`${locale}-table-link`}>
            <LinkBaseUrlInput
              value={chartConfig.links.baseUrl[locale]}
              disabled={!chartConfig.links.enabled}
              locale={locale}
            />
          </div>
        ))}
        <Select
          id="links.componentId"
          size="sm"
          label={t({
            id: "controls.tableSettings.linkComponentId",
            message: "Source Column",
          })}
          options={dimensionOptions}
          value={chartConfig.links.componentId}
          name="links.componentId"
          disabled={!chartConfig.links.enabled}
          onChange={handleLinkComponentIdChange}
        />
        <Select
          id="links.targetComponentId"
          size="sm"
          label={t({
            id: "controls.tableSettings.targetComponentId",
            message: "Target Column",
          })}
          options={dimensionOptions}
          value={chartConfig.links.targetComponentId}
          name="links.targetComponentId"
          disabled={!chartConfig.links.enabled}
          onChange={handleTargetComponentIdChange}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
