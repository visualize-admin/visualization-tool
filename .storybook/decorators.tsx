import { I18nProvider } from "@lingui/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Router from "next/router";
import React from "react";
import { i18n } from "../app/locales/locales";

import { SessionProvider } from "next-auth/react";
import { theme } from "../app/themes/federal";
import AsyncLocalizationProvider from "../app/utils/l10n-provider";

export const AppContextDecorator = (Story) => (
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

export const RouterDecorator = (Story: NextPageWithLayout) => {
  const [isRouterReady, setIsRouterReady] = React.useState(false);
  React.useEffect(() => {
    Router.ready(() => {
      setIsRouterReady(true);
    });
  }, []);

  const getLayout = Story.getLayout ?? ((page) => page);

  return (
    <React.Fragment>
      <Story />
    </React.Fragment>
  );
};
