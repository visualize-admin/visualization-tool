import { css, Global } from "@emotion/core";
import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "emotion-theming";
import App, { AppContext } from "next/app";
import ErrorPage from "next/error";
import React from "react";
import { catalogs, defaultLocale, locales } from "../locales/locales";
import { loadTheme } from "../themes/index";

class MyApp extends App<{
  locale: string;
  statusCode: void | number;
  theme: any;
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
      } else if (query.locale && !locales.includes(query.locale as any)) {
        console.log("is this error?", pathname);
        res.statusCode = 404;
        statusCode = 404;
      }
    }

    const __theme = query.__theme ? query.__theme.toString() : undefined;
    const { theme, globalStyles } = await loadTheme(__theme);

    return {
      ...appProps,
      locale: query.locale,
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
    );
  }
}

export default MyApp;
