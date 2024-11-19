import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import create, { useStore } from "zustand";

import { ChartPublished } from "@/components/chart-published";
import { ConfiguratorStatePublished } from "@/config-types";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { i18n } from "@/locales/locales";
import { LocaleProvider, useLocale } from "@/locales/use-locale";
import { ConfiguratorStateProvider } from "@/src";
import * as federalTheme from "@/themes/federal";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

const chartStateStore = create<{
  state: ConfiguratorStatePublished | null;
  setState: (state: ConfiguratorStatePublished) => void;
}>((set) => ({
  state: null,
  setState: (state) => set({ state }),
}));

if (typeof window !== "undefined") {
  window.addEventListener("message", async (event) => {
    if (event.data.key) {
      chartStateStore.setState({
        state: {
          ...(await migrateConfiguratorState(event.data)),
          // Force state published for <ChartPublished /> to work correctly
          state: "PUBLISHED",
        } as ConfiguratorStatePublished,
      });
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
