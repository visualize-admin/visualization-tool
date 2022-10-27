import Document, { Head, Html, Main, NextScript } from "next/document";

import { GA_TRACKING_ID } from "@/domain/env";

class MyDocument extends Document {
  render() {
    return (
      <Html data-app-version={`${process.env.NEXT_PUBLIC_VERSION}`}>
        <Head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src="/api/client-env"></script>
          {GA_TRACKING_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer = window.dataLayer || [];function gtag() {window.dataLayer.push(arguments);};gtag("js", new Date());gtag("config", "${GA_TRACKING_ID}", {anonymize_ip:true});`,
                }}
              ></script>
            </>
          )}
        </Head>
        <body>
          <Main />
          <script noModule src="/static/ie-check.js" defer></script>
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
