import { I18nProvider } from "@lingui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { NextPage } from "next";
import { SessionProvider } from "next-auth/react";
import Router from "next/router";
import * as React from "react";

import { i18n } from "../app/locales/locales";
import { theme } from "../app/themes/federal";
import AsyncLocalizationProvider from "../app/utils/l10n-provider";

export const AppContextDecorator = (Story: NextPage) => (
  <SessionProvider>
    <AsyncLocalizationProvider locale="en">
      <I18nProvider i18n={i18n}>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      </I18nProvider>
    </AsyncLocalizationProvider>
  </SessionProvider>
);

export const RouterDecorator = (Story: NextPage) => {
  const [_, setIsRouterReady] = React.useState(false);
  React.useEffect(() => {
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
