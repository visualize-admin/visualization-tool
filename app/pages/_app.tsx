import { css, Global } from "@emotion/core";
import { I18nProvider } from "@lingui/react";
import App, { AppContext } from "next/app";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import { ThemeProvider } from "theme-ui";
import { ContentMDXProvider } from "../components/content-mdx-provider";
import { analyticsPageView } from "../domain/analytics";
import { PUBLIC_URL } from "../domain/env";
import { GraphqlProvider } from "../graphql/context";
import { LocaleProvider } from "../lib/use-locale";
import { catalogs, Locales, parseLocaleString } from "../locales/locales";
import { loadTheme, Theme } from "../themes/index";

// Used for color-picker component. Must include here because of next.js constraints about global CSS imports
import "@reach/menu-button/styles.css";

Router.events.on("routeChangeComplete", path => analyticsPageView(path));

class MyApp extends App<{
  locale: Locales;
  theme: Theme;
  globalStyles: string | undefined;
  preloadFonts?: string[];
  asPath: string;
}> {
  static async getInitialProps(appContext: AppContext) {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);

    const {
      ctx: { query, asPath, pathname }
    } = appContext;

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

    if (typeof document !== "undefined") {
      document.querySelector("html")?.setAttribute("lang", locale);
    }

    return {
      ...appProps,
      locale,
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
      theme,
      globalStyles,
      preloadFonts,
      asPath
    } = this.props;

    return (
      <>
        <Head>
          <title>visualize.admin.ch</title>
          <meta property="og:type" content="website" />
          <meta property="og:title" content={"visualize.admin.ch"} />
          <meta property="og:url" content={`${PUBLIC_URL}${asPath}`} />
          {preloadFonts &&
            preloadFonts.map(src => (
              <link
                key={src}
                rel="preload"
                href={src}
                as="font"
                crossOrigin="anonymous"
              />
            ))}
        </Head>
        <LocaleProvider value={locale}>
          <I18nProvider language={locale} catalogs={catalogs}>
            <GraphqlProvider>
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
            </GraphqlProvider>
          </I18nProvider>
        </LocaleProvider>
      </>
    );
  }
}

export default MyApp;
