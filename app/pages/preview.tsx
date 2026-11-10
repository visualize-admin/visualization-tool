import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import create, { useStore } from "zustand";

import { ChartPublished } from "@/components/chart-published";
import {
  ConfiguratorStatePublished,
  decodeConfiguratorState,
} from "@/config-types";
import { ConfiguratorStateProvider } from "@/configurator/configurator-state";
import { GraphqlProvider } from "@/graphql/graphql-provider";
import { i18n } from "@/locales/locales";
import { LocaleProvider, useLocale } from "@/locales/use-locale";
import * as federalTheme from "@/themes/theme";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";
import { hashStringToObject } from "@/utils/hash-utils";
import { maybeWindow } from "@/utils/maybe-window";

// Top-level keys that a posted configurator state may contain. Used to
// distinguish chart state messages from unrelated postMessage traffic
// (browser extensions, React DevTools backend, ...).
const CONFIG_STATE_KEYS = [
  "version",
  "state",
  "dataSource",
  "dataSet",
  "chartConfig",
  "chartConfigs",
  "layout",
  "dashboardFilters",
  "activeChartKey",
  "meta",
] as const;

const isValidMessage = (e: MessageEvent) => {
  const data = e.data;

  // The documented API contract: the embedding parent window posts the
  // configurator state object to this iframe.
  if (
    data === null ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    e.source !== window.parent
  ) {
    return false;
  }

  return CONFIG_STATE_KEYS.some((key) =>
    Object.prototype.hasOwnProperty.call(data, key)
  );
};

const chartStateStore = create<{
  state: ConfiguratorStatePublished | null;
  setState: (state: ConfiguratorStatePublished) => void;
}>((set) => ({
  state: null,
  setState: (state) => set({ state }),
}));

const updateState = async (rawState: any) => {
  try {
    const state = decodeConfiguratorState({
      ...(await migrateConfiguratorState(rawState)),
      // Force state published for <ChartPublished /> to work correctly
      state: "PUBLISHED",
    }) as ConfiguratorStatePublished;

    if (state) {
      await fetch("/api/config/view", {
        method: "POST",
        body: JSON.stringify({ type: "preview" }),
      });
      chartStateStore.setState({ state });
    }
  } catch (e) {
    console.error(e);
  }
};

export default function Preview() {
  const locale = useLocale();
  i18n.activate(locale);
  const state = useStore(chartStateStore, (d) => d.state);
  const window = maybeWindow();

  useEffect(() => {
    window?.parent?.postMessage({ type: "ready" }, "*");
  }, [window]);

  useEffect(() => {
    if (!window) {
      return;
    }

    const handleMessage = async (e: MessageEvent) => {
      if (!isValidMessage(e)) {
        return;
      }

      await updateState(e.data);
    };

    const handleHashChange = async () => {
      const hash = window.location.hash;

      if (!hash) {
        return;
      }

      await updateState(hashStringToObject(hash));
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("hashchange", handleHashChange);

    handleHashChange();

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [window]);

  return (
    <LocaleProvider value={locale}>
      <I18nProvider i18n={i18n}>
        <GraphqlProvider>
          <ThemeProvider theme={federalTheme.theme}>
            {state ? (
              <ConfiguratorStateProvider
                // Reset the state on e.g. manual hash parameters URL edit.
                key={JSON.stringify(state)}
                chartId="published"
                initialState={state}
              >
                <ChartPublished configKey="preview" isPreview {...state} />
              </ConfiguratorStateProvider>
            ) : null}
          </ThemeProvider>
        </GraphqlProvider>
      </I18nProvider>
    </LocaleProvider>
  );
}
