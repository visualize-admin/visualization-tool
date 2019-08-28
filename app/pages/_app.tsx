import React from "react";
import App, { AppContext } from "next/app";
import { locales, defaultLocale, catalogs } from "../locales/locales";
import { I18nProvider } from "@lingui/react";

class MyApp extends App<{ locale: string }> {
  static async getInitialProps(appContext: AppContext) {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);

    const {
      ctx: { query, res, asPath }
    } = appContext;

    console.log(query);

    // Redirect to default locale index page if locale is not found
    if (
      (asPath === "/" || query.locale) &&
      !locales.includes(query.locale as any)
    ) {
      if (res) {
        res.writeHead(302, { Location: `/${defaultLocale}` });
        res.end();
      }
    }

    return { ...appProps, locale: query.locale };
  }

  render() {
    const { Component, pageProps, locale } = this.props;
    return (
      <I18nProvider language={locale} catalogs={catalogs}>
        <Component {...pageProps} />
      </I18nProvider>
    );
  }
}

export default MyApp;
