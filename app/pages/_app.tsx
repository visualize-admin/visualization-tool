import { css, Global } from "@emotion/core";
import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "emotion-theming";
import App, { AppContext } from "next/app";
import ErrorPage from "next/error";
import Router from "next/router";
import React from "react";
import { analyticsPageView } from "../domain/analytics";
import { LocaleProvider } from "../lib/use-locale";
import {
  catalogs,
  defaultLocale,
  locales,
  Locales,
  parseLocaleString
} from "../locales/locales";
import { loadTheme, Theme } from "../themes/index";

Router.events.on("routeChangeComplete", path => analyticsPageView(path));

class MyApp extends App<{
  locale: Locales;
  statusCode: void | number;
  theme: Theme;
  globalStyles: string | undefined;
}> {
  static async getInitialProps(appContext: AppContext) {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);

    const {
      ctx: { query, res, asPath, pathname }
    } = appContext;

    let statusCode = undefined;

    // Redirect to default locale index page if locale is not found
    if (res) {
      if (asPath === "/") {
        res.writeHead(302, { Location: `/${defaultLocale}` });
        res.end();
      } else if (
        query.locale &&
        !locales.includes(query.locale as $IntentionalAny)
      ) {
        console.log("is this error?", pathname);
        res.statusCode = 404;
        statusCode = 404;
      }
    }

    const __theme = query.__theme ? query.__theme.toString() : undefined;
    const { theme, globalStyles } = await loadTheme(__theme);

    return {
      ...appProps,
      locale: parseLocaleString(query.locale as string),
      statusCode,
      theme,
      globalStyles
    };
  }

  render() {
    const {
      Component,
      pageProps,
      locale,
      statusCode,
      theme,
      globalStyles
    } = this.props;
    return statusCode ? (
      <ErrorPage statusCode={statusCode} />
    ) : (
      <LocaleProvider value={locale}>
        <I18nProvider language={locale} catalogs={catalogs}>
          <ThemeProvider theme={theme}>
            <Global
              styles={css`
                ${globalStyles}
              `}
            />
            <Component {...pageProps} />
          </ThemeProvider>
        </I18nProvider>
      </LocaleProvider>
    );
  }
}

export default MyApp;
