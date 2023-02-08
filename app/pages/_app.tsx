import { I18nProvider } from "@lingui/react";
// Used for color-picker component. Must include here because of next.js constraints about global CSS imports
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Theme } from "@mui/material/styles";
import "core-js/features/array/flat-map";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { ContentMDXProvider } from "@/components/content-mdx-provider";
import { PUBLIC_URL, THEME } from "@/domain/env";
import GqlDebug from "@/gql-flamegraph/devtool";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { i18n, parseLocaleString } from "@/locales/locales";
import { LocaleProvider } from "@/locales/use-locale";
import Flashes from "@/utils/flashes";
import { analyticsPageView } from "@/utils/googleAnalytics";
import AsyncLocalizationProvider from "@/utils/l10n-provider";
import "@/utils/nprogress.css";
import { useNProgress } from "@/utils/use-nprogress";

let theme: Theme | undefined;
let preloadFonts: string[];

if (THEME === "federal") {
  import("../themes/federal").then((mod) => {
    theme = mod.theme;
    preloadFonts = mod.preloadFonts;
  });
} else if (THEME === "prisma") {
  import("../themes/prisma").then((mod) => {
    theme = mod.theme;
    preloadFonts = mod.preloadFonts;
  });
} else {
  throw new Error(`Unknown theme: ${THEME}`);
}

const pageLaunchedWithDebug =
  typeof window !== "undefined" &&
  (process.env.NODE_ENV === "development" ||
    new URL(window.location.toString()).searchParams?.get("debug") === "true");

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const { events: routerEvents, asPath, locale: routerLocale } = useRouter();

  useNProgress();

  const locale = parseLocaleString(routerLocale ?? "");

  // Immediately activate locale to avoid re-render
  if (i18n.locale !== locale) {
    i18n.activate(locale);
  }

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

  const shouldShowDebug =
    typeof window !== "undefined" &&
    (process.env.NODE_ENV === "development" || pageLaunchedWithDebug);

  return (
    <>
      <Head>
        <title key="title">visualize.admin.ch</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={"visualize.admin.ch"} />
        <meta property="og:url" content={`${PUBLIC_URL}${asPath}`} />
        {preloadFonts?.map((src) => (
          <link
            key={src}
            rel="preload"
            href={src}
            as="font"
            crossOrigin="anonymous"
          />
        ))}
      </Head>

      <SessionProvider session={session}>
        <LocaleProvider value={locale}>
          <I18nProvider i18n={i18n}>
            <GraphqlProvider>
              {theme && (
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <Flashes />
                  {shouldShowDebug ? <GqlDebug /> : null}
                  <ContentMDXProvider>
                    <AsyncLocalizationProvider locale={locale}>
                      <Component {...pageProps} />
                    </AsyncLocalizationProvider>
                  </ContentMDXProvider>
                </ThemeProvider>
              )}
            </GraphqlProvider>
          </I18nProvider>
        </LocaleProvider>
      </SessionProvider>
    </>
  );
}
