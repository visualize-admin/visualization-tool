import React from "react";
import App, { AppContext } from "next/app";
import ErrorPage from "next/error";
import { locales, defaultLocale, catalogs } from "../locales/locales";
import { I18nProvider } from "@lingui/react";
import { css, Global } from "@emotion/core";

const globalCss = css`
  @font-face {
    font-family: "FrutigerNeueBold";
    font-style: normal;
    font-weight: 700;
    src: url("/static/fonts/FrutigerNeueW02-Bd.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Bd.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueRegular";
    font-style: normal;
    font-weight: 400;
    src: url("/static/fonts/FrutigerNeueW02-Regular.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Regular.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueLight";
    font-style: normal;
    font-weight: 300;
    src: url("/static/fonts/FrutigerNeueW02-Light.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Light.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueItalic";
    font-style: italic;
    font-weight: 400;
    src: url("/static/fonts/FrutigerNeueW02-It.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-It.woff") format("woff");
  }
  body {
    margin: 0;
    padding: 0;
    font-family: FrutigerNeueRegular, -apple-system, BlinkMacSystemFont,
      Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji,
      Segoe UI Symbol;
  }
`;

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
        <Global styles={globalCss} />
        <Component {...pageProps} />
      </I18nProvider>
    );
  }
}

export default MyApp;
