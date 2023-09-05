import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import create, { useStore } from "zustand";

import { ChartPublished } from "@/components/chart-published";
import { ConfiguratorStatePublishing } from "@/config-types";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { Locale, i18n } from "@/locales/locales";
import { LocaleProvider } from "@/locales/use-locale";
import * as federalTheme from "@/themes/federal";

const chartStateStore = create<{
  state: ConfiguratorStatePublishing | null;
  setState: (state: ConfiguratorStatePublishing) => void;
}>((set) => ({
  state: null,
  setState: (state) => set({ state }),
}));

if (typeof window !== "undefined") {
  window.addEventListener("message", (event) => {
    if (event.data.state === "CONFIGURING_CHART") {
      chartStateStore.setState({ state: event.data });
    }
  });
}

export default function Preview() {
  const locale: Locale = "en";
  i18n.activate(locale);

  const state = useStore(chartStateStore, (d) => d.state);

  return state ? (
    <LocaleProvider value={locale}>
      <I18nProvider i18n={i18n}>
        <GraphqlProvider>
          <ThemeProvider theme={federalTheme.theme}>
            <ChartPublished configKey="preview" {...state} />
          </ThemeProvider>
        </GraphqlProvider>
      </I18nProvider>
    </LocaleProvider>
  ) : null;
}
