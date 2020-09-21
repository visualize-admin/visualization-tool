import { I18nProvider } from "@lingui/react";
// Used for color-picker component. Must include here because of next.js constraints about global CSS imports
import "@reach/menu-button/styles.css";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "theme-ui";
import { ContentMDXProvider } from "../components/content-mdx-provider";
import { analyticsPageView } from "../domain/analytics";
import { PUBLIC_URL } from "../domain/env";
import { GraphqlProvider } from "../graphql/context";
import { LocaleProvider } from "../lib/use-locale";
import { useNProgress } from "../lib/use-nprogress";
import { catalogs, parseLocaleString } from "../locales/locales";
import * as defaultTheme from "../themes/federal";
import { loadTheme, ThemeModule } from "../themes/index";

import "../lib/nprogress.css";

export default function App({ Component, pageProps }: AppProps) {
  const { pathname, query, events: routerEvents, asPath } = useRouter();
  const [themeModule, setThemeModule] = useState<ThemeModule>(defaultTheme);

  useNProgress();

  /**
   * Parse locale from query OR pathname
   * - so we can have dynamic locale query params like /[locale]/create/...
   * - and static localized pages like /en/index.mdx
   */
  const locale = /^\/\[locale\]/.test(pathname)
    ? parseLocaleString(query.locale?.toString() ?? "")
    : parseLocaleString(pathname.slice(1));

  useEffect(() => {
    document.querySelector("html")?.setAttribute("lang", locale);
  }, [locale]);

  // Load custom theme
  const __theme = query.__theme ? query.__theme.toString() : undefined;
  useEffect(() => {
    if (__theme) {
      (async () => {
        const customTheme = await loadTheme(__theme);
        setThemeModule(customTheme);
      })();
    }
  }, [__theme]);

  // Initialize analytics
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analyticsPageView(url);
    };

    routerEvents.on("routeChangeComplete", handleRouteChange);
    return () => {
      routerEvents.off("routeChangeComplete", handleRouteChange);
    };
  }, [routerEvents]);

  return (
    <>
      <Head>
        <title>visualize.admin.ch</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={"visualize.admin.ch"} />
        <meta property="og:url" content={`${PUBLIC_URL}${asPath}`} />
        {themeModule.preloadFonts?.map((src) => (
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
            <ThemeProvider theme={themeModule.theme}>
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
