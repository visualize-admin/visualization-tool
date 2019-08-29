import React from "react";
import App, { AppContext } from "next/app";
import ErrorPage from "next/error";
import { locales, defaultLocale, catalogs } from "../locales/locales";
import { I18nProvider } from "@lingui/react";

class MyApp extends App<{ locale: string; statusCode: void | number }> {
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

    return { ...appProps, locale: query.locale, statusCode };
  }

  render() {
    const { Component, pageProps, locale, statusCode } = this.props;
    return statusCode ? (
      <ErrorPage statusCode={statusCode} />
    ) : (
      <I18nProvider language={locale} catalogs={catalogs}>
        <Component {...pageProps} />
      </I18nProvider>
    );
  }
}

export default MyApp;
