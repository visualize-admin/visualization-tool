import React from "react";
import App, { AppContext } from "next/app";
import { locales, defaultLocale } from "../locales/locales";

class MyApp extends App {
  static async getInitialProps(appContext: AppContext) {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);

    const {
      ctx: { query, res }
    } = appContext;

    // Redirect to default locale index page if locale is not found
    if (!locales.includes(query.locale as any)) {
      if (res) {
        res.writeHead(302, { Location: `/${defaultLocale}` });
        res.end();
      }
    }

    return { ...appProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    return <Component {...pageProps} />;
  }
}

export default MyApp;
