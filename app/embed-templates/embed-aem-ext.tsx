import Head from "next/head";
import { renderToStaticMarkup } from "react-dom/server";

import { PUBLIC_URL } from "@/domain/env";

type Props = {
  locale: string;
  chartId: string;
};

const EmbedHTML = ({ locale, chartId }: Props) => (
  <html lang={locale}>
    <Head>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </Head>
    <body style={{ padding: 0, margin: 0, background: "#fff" }}>
      <iframe
        title="chart"
        // src="/static/embed-content-placeholder.html"
        src={`${PUBLIC_URL}/${locale}/embed/${chartId}`}
        data-visualize-iframe
        style={{ width: 1, minWidth: "100%" }}
        frameBorder="0"
        allowTransparency
        scrolling="no"
      />
      <div id="" />
      <script defer src={`${PUBLIC_URL}/dist/embed.js`}></script>
    </body>
  </html>
);

export const renderEmbedMarkup = (props: Props): string => {
  return renderToStaticMarkup(<EmbedHTML {...props} />);
};
