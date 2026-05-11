import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html data-app-version={`${process.env.NEXT_PUBLIC_VERSION}`}>
        <Head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src="/api/client-env"></script>
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
