import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";
import { parseLocaleString } from "../locales/locales";

const clientEnv = {
  GA_TRACKING_ID: process.env.GA_TRACKING_ID,
  SPARQL_EDITOR: process.env.SPARQL_EDITOR,
  SPARQL_ENDPOINT: process.env.SPARQL_ENDPOINT,
  PUBLIC_URL: process.env.PUBLIC_URL,
  GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
};

class MyDocument extends Document<{ locale: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    const { query, pathname } = ctx;

    /**
     * Parse locale from query OR pathname
     * - so we can have dynamic locale query params like /[locale]/create/...
     * - and static localized pages like /en/index.mdx
     */
    const locale = /^\/\[locale\]/.test(pathname)
      ? parseLocaleString(query.locale?.toString() ?? "")
      : parseLocaleString(pathname.slice(1));

    return { ...initialProps, locale };
  }

  render() {
    return (
      <Html
        data-app-version={`${process.env.NEXT_PUBLIC_VERSION}`}
        lang={this.props.locale}
      >
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__clientEnv__=${JSON.stringify(clientEnv)}`,
            }}
          />
          {clientEnv.GA_TRACKING_ID && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${clientEnv.GA_TRACKING_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer = window.dataLayer || [];function gtag() {window.dataLayer.push(arguments);};gtag("js", new Date());gtag("config", "${clientEnv.GA_TRACKING_ID}", {anonymize_ip:true});`,
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
