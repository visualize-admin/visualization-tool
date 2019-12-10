import Document, { Html, Head, Main, NextScript } from "next/document";
import { GA_TRACKING_ID } from "../domain/env";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {GA_TRACKING_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer = window.dataLayer || [];function gtag() {window.dataLayer.push(arguments);};gtag("js", new Date());gtag("config", "${GA_TRACKING_ID}");`
                }}
              ></script>
            </>
          )}
        </Head>
        <body>
          <Main />
          <script noModule src="/static/ie-check.js"></script>
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
