import { css, Global } from "@emotion/core";
import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "theme-ui";
import App, { AppContext } from "next/app";
import ErrorPage from "next/error";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import { ContentMDXProvider } from "../components/content-mdx-provider";
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
import { PUBLIC_URL } from "../domain/env";

Router.events.on("routeChangeComplete", path => analyticsPageView(path));

class MyApp extends App<{
  locale: Locales;
  statusCode: void | number;
  theme: Theme;
  globalStyles: string | undefined;
  preloadFonts?: string[];
  asPath: string;
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
    const { theme, globalStyles, preloadFonts } = await loadTheme(__theme);

    /**
     * Parse locale from query OR pathname
     * - so we can have dynamic locale query params like /[locale]/create/...
     * - and static localized pages like /en/index.mdx
     */
    const locale = /^\/\[locale\]/.test(pathname)
      ? parseLocaleString(query.locale.toString())
      : parseLocaleString(pathname.slice(1));

    return {
      ...appProps,
      locale,
      statusCode,
      theme,
      globalStyles,
      preloadFonts,
      asPath
    };
  }

  render() {
    const {
      Component,
      pageProps,
      locale,
      statusCode,
      theme,
      globalStyles,
      preloadFonts,
      asPath
    } = this.props;

    if (statusCode) {
      return <ErrorPage statusCode={statusCode} />;
    }

    return (
      <>
        <Head>
          <title>visualize.admin.ch</title>
          <meta property="og:type" content="website" />
          <meta property="og:title" content={"visualize.admin.ch"} />
          <meta property="og:url" content={`${PUBLIC_URL}${asPath}`} />
          {preloadFonts &&
            preloadFonts.map(src => <link key={src} rel={src} as="font" />)}
        </Head>
        <LocaleProvider value={locale}>
          <I18nProvider language={locale} catalogs={catalogs}>
            <ThemeProvider theme={theme}>
              <Global
                styles={css`
                  ${globalStyles}
                `}
              />
              <ContentMDXProvider>
                <Component {...pageProps} />
              </ContentMDXProvider>
            </ThemeProvider>
          </I18nProvider>
        </LocaleProvider>
      </>
    );
  }
}

export default MyApp;
