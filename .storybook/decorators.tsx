import { I18nProvider } from "@lingui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import Router from "next/router";
import { Decorator } from "@storybook/react";
import { Client, Provider } from "urql";

import { i18n } from "../app/locales/locales";
import { theme } from "../app/themes/theme";
import AsyncLocalizationProvider from "../app/utils/l10n-provider";
import { SnackbarProvider } from "../app/components/snackbar";
import { useEffect, useState } from "react";

export const AppContextDecorator = (Story: NextPage) => (
  <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
    <AsyncLocalizationProvider locale="en">
      <I18nProvider i18n={i18n}>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <Story />
          </SnackbarProvider>
        </ThemeProvider>
      </I18nProvider>
    </AsyncLocalizationProvider>
  </SessionProvider>
);

export const RouterDecorator = (Story: NextPage) => {
  const [_, setIsRouterReady] = useState(false);
  useEffect(() => {
    Router.ready(() => {
      setIsRouterReady(true);
    });
  }, []);

  return (
    <>
      <Story />
    </>
  );
};

const graphqlURL =
  process.env.NODE_ENV === "production"
    ? "/api/graphql"
    : "http://localhost:3000/api/graphql";

export const UrqlDecorator: Decorator = (Story) => {
  const client = new Client({ url: graphqlURL });
  return (
    <Provider value={client}>
      <Story />
    </Provider>
  );
};
