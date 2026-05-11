import { sanitizeUrl } from "@braintree/sanitize-url";
import { t } from "@lingui/macro";
import { KeyboardEvent, useEffect, useState } from "react";

import { Input } from "@/components/form";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useLocale } from "@/locales/use-locale";
import { useEvent } from "@/utils/use-event";

export const LinkBaseUrlInput = ({
  value,
  disabled,
  locale,
}: {
  value: string;
  disabled: boolean;
  locale: string;
}) => {
  const currentLocale = useLocale();
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
        locale: currentLocale,
        field: null,
        path: `links.baseUrl.${locale}`,
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
      label={`${t({
        id: "controls.tableSettings.baseUrl",
        message: "Base URL",
      })} (${getFieldLabel(locale)})`}
      name={`links.baseUrl.${locale}`}
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
