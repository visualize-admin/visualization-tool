import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import create, { useStore } from "zustand";

import { ChartPublished } from "@/components/chart-published";
import {
  ConfiguratorStatePublished,
  decodeConfiguratorState,
} from "@/config-types";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { i18n } from "@/locales/locales";
import { LocaleProvider, useLocale } from "@/locales/use-locale";
import { ConfiguratorStateProvider } from "@/src";
import * as federalTheme from "@/themes/federal";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

const isValidMessage = (e: MessageEvent) => {
  return (
    e.data && e.data.type !== "connection-init" && e.data.type !== "debug-event"
  );
};

const chartStateStore = create<{
  state: ConfiguratorStatePublished | null;
  setState: (state: ConfiguratorStatePublished) => void;
}>((set) => ({
  state: null,
  setState: (state) => set({ state }),
}));

if (typeof window !== "undefined") {
  window.addEventListener("message", async (e) => {
    if (!isValidMessage(e)) {
      return;
    }

    try {
      const state = decodeConfiguratorState(
        await migrateConfiguratorState(e.data)
      );

      if (state) {
        chartStateStore.setState({
          state: {
            ...state,
            // Force state published for <ChartPublished /> to work correctly
            state: "PUBLISHED",
          } as ConfiguratorStatePublished,
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
}

export default function Preview() {
  const locale = useLocale();
  i18n.activate(locale);
  const state = useStore(chartStateStore, (d) => d.state);

  return (
    <LocaleProvider value={locale}>
      <I18nProvider i18n={i18n}>
        <GraphqlProvider>
          <ThemeProvider theme={federalTheme.theme}>
            {state ? (
              <ConfiguratorStateProvider
                key={state.key}
                chartId="published"
                initialState={state}
              >
                <ChartPublished configKey="preview" {...state} />
              </ConfiguratorStateProvider>
            ) : null}
          </ThemeProvider>
        </GraphqlProvider>
      </I18nProvider>
    </LocaleProvider>
  );
}
