import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";
import { GA_TRACKING_ID } from "../domain/env";
import { parseLocaleString } from "../locales/locales";

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
          <script noModule src="/static/ie-check.js"></script>
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
