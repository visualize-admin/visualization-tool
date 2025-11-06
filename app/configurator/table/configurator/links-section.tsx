import { sanitizeUrl } from "@braintree/sanitize-url";
import { t, Trans } from "@lingui/macro";
import { SelectChangeEvent } from "@mui/material";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";

import { Input, Select } from "@/components/form";
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
import { useLocale } from "@/locales/use-locale";
import { useEvent } from "@/utils/use-event";

export const TableLinksSection = ({
  chartConfig,
  dimensions,
}: {
  chartConfig: TableConfig;
  dimensions: Dimension[];
}) => {
  const locale = useLocale();
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
            message: "Show link column",
          })}
          field={null}
          path="links.enabled"
        />
        <BaseUrlInput
          value={chartConfig.links.baseUrl}
          disabled={!chartConfig.links.enabled}
        />
        <Select
          id="links.componentId"
          size="sm"
          label={t({
            id: "controls.tableSettings.linkComponentId",
            message: "Source Dimension",
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
            message: "Target Dimension",
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

const BaseUrlInput = ({
  value,
  disabled,
}: {
  value: string;
  disabled: boolean;
}) => {
  const locale = useLocale();
  const [_, dispatch] = useConfiguratorState(isConfiguring);

  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const updateBaseUrl = useEvent((newValue: string) => {
    dispatch({
      type: "CHART_FIELD_UPDATED",
      value: {
        locale,
        field: null,
        path: "links.baseUrl",
        value: newValue,
      },
    });
  });

  const handleCommit = useEvent(() => {
    if (inputValue === "") {
      setIsValid(true);
      updateBaseUrl("");

      return;
    }

    const sanitizedUrl = sanitizeUrl(inputValue);

    if (sanitizedUrl === "about:blank") {
      setIsValid(false);
      updateBaseUrl("");

      return;
    }

    try {
      const url = new URL(sanitizedUrl);
      const normalizedUrl = normalizeUrl(url);

      updateBaseUrl(normalizedUrl);
      setIsValid(true);
      setInputValue(normalizedUrl);
    } catch {
      setIsValid(false);
    }
  });

  const handleKeyDown = useEvent((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommit();
    }
  });

  return (
    <Input
      type="url"
      label={t({
        id: "controls.tableSettings.baseUrl",
        message: "Base URL",
      })}
      name="links.baseUrl"
      placeholder="https://example.com/"
      value={inputValue}
      disabled={disabled}
      error={!isValid}
      errorMessage={t({
        id: "controls.tableSettings.baseUrlInvalid",
        message: "Please enter a valid URL",
      })}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={handleKeyDown}
    />
  );
};

const normalizeUrl = (url: URL) => {
  if (!url.pathname.endsWith("/")) {
    url.pathname = url.pathname + "/";
  }

  return url.toString();
};
