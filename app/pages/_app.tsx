import { I18nProvider } from "@lingui/react";
import "core-js/features/array/flat-map";
// Used for color-picker component. Must include here because of next.js constraints about global CSS imports
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

import { SnackbarProvider } from "@/components/snackbar";
import { PUBLIC_URL } from "@/domain/env";
import { flag } from "@/flags/flag";
import { GraphqlProvider } from "@/graphql/graphql-provider";
import { i18n, parseLocaleString } from "@/locales/locales";
import { LocaleProvider } from "@/locales/use-locale";
import * as federalTheme from "@/themes/theme";
import { AsyncLocalizationProvider } from "@/utils/async-localization-provider";
import { EventEmitterProvider } from "@/utils/event-emitter";
import { Flashes } from "@/utils/flashes";
import { analyticsPageView } from "@/utils/google-analytics";
import "@/utils/nprogress.css";
import { useNProgress } from "@/utils/use-nprogress";

import "@/configurator/components/color-picker.css";

const GQLDebugPanel = dynamic(
  () => import("@/gql-flamegraph/devtool").then((mod) => mod.DebugPanel),
  { ssr: false }
);

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  const { events: routerEvents, asPath, locale: routerLocale } = useRouter();
  const locale = parseLocaleString(routerLocale ?? "");

  useNProgress();

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

  const shouldShowGQLDebug =
    process.env.NODE_ENV === "development" || flag("debug");

  return (
    <>
      <Head>
        <title key="title">visualize.admin.ch</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={"visualize.admin.ch"} />
        <meta property="og:url" content={`${PUBLIC_URL}${asPath}`} />
        {federalTheme.preloadFonts?.map((src) => (
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
              <ThemeProvider theme={federalTheme.theme}>
                <EventEmitterProvider>
                  <SnackbarProvider>
                    <CssBaseline />
                    <Flashes />
                    {shouldShowGQLDebug ? <GQLDebugPanel /> : null}
                    <AsyncLocalizationProvider locale={locale}>
                      <Component {...pageProps} />
                    </AsyncLocalizationProvider>
                  </SnackbarProvider>
                </EventEmitterProvider>
              </ThemeProvider>
            </GraphqlProvider>
          </I18nProvider>
        </LocaleProvider>
      </SessionProvider>
    </>
  );
}
