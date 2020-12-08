import "core-js/features/array/flat-map";
import { I18nProvider } from "@lingui/react";
// Used for color-picker component. Must include here because of next.js constraints about global CSS imports
import "@reach/menu-button/styles.css";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ThemeProvider } from "theme-ui";
import { ContentMDXProvider } from "../components/content-mdx-provider";
import { analyticsPageView } from "../lib/googleAnalytics";
import { PUBLIC_URL } from "../domain/env";
import { GraphqlProvider } from "../graphql/context";
import { LocaleProvider } from "../locales/use-locale";
import { useNProgress } from "../lib/use-nprogress";
import { i18n, parseLocaleString } from "../locales/locales";
import * as defaultTheme from "../themes/federal";
import { loadTheme, ThemeModule } from "../themes/index";

import "../lib/nprogress.css";

export default function App({ Component, pageProps }: AppProps) {
  const {
    query,
    events: routerEvents,
    asPath,
    locale: routerLocale,
  } = useRouter();
  const [themeModule, setThemeModule] = useState<ThemeModule>(defaultTheme);

  useNProgress();

  const locale = parseLocaleString(routerLocale ?? "");

  // Immediately activate locale to avoid re-render
  if (i18n.locale !== locale) {
    i18n.activate(locale);
  }

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

    const handleRouteStart = (url: string) => {
      const locale = parseLocaleString(url.slice(1));
      if (i18n.locale !== locale) {
        i18n.activate(locale);
      }
    };

    routerEvents.on("routeChangeStart", handleRouteStart);
    routerEvents.on("routeChangeComplete", handleRouteChange);
    return () => {
      routerEvents.off("routeChangeStart", handleRouteStart);
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
        <I18nProvider i18n={i18n}>
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
