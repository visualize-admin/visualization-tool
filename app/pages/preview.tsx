import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import { GetServerSideProps } from "next";
import { useEffect } from "react";
import create, { useStore } from "zustand";

import { ChartPublished } from "@/components/chart-published";
import {
  ConfiguratorStatePublished,
  decodeConfiguratorState,
} from "@/config-types";
import { increaseConfigViewCount } from "@/db/config";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { i18n } from "@/locales/locales";
import { LocaleProvider, useLocale } from "@/locales/use-locale";
import { ConfiguratorStateProvider } from "@/src";
import * as federalTheme from "@/themes/theme";
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
      const state = decodeConfiguratorState({
        ...(await migrateConfiguratorState(e.data)),
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
  });
}

type PageProps = {
  configuratorState: string | null;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
}) => {
  const configuratorState = query.state;

  if (typeof configuratorState !== "string") {
    return {
      props: {
        configuratorState: null,
      },
    };
  }

  const migratedState = await migrateConfiguratorState(
    JSON.parse(configuratorState)
  );
  const decodedState = decodeConfiguratorState({
    ...migratedState,
    state: "PUBLISHED",
  }) as ConfiguratorStatePublished;

  await increaseConfigViewCount();

  return {
    props: {
      configuratorState: JSON.stringify(decodedState),
    },
  };
};

export default function Preview({ configuratorState }: PageProps) {
  const locale = useLocale();
  i18n.activate(locale);
  const state = useStore(chartStateStore, (d) => d.state);

  useEffect(() => {
    if (configuratorState) {
      chartStateStore.setState({ state: JSON.parse(configuratorState) });
    }
  }, [configuratorState]);

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
