import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Locales } from "../locales/locales";

type Props = {
  locale: Locales;
  chartId: string;
};

const EmbedHTML = ({ locale, chartId }: Props) => (
  <html lang={locale}>
    <head></head>
    <body style={{ padding: 0, margin: 0, background: "#fff" }}>
      <iframe
        title="chart"
        // src="/static/embed-content-placeholder.html"
        src={`/${locale}/embed/${chartId}`}
        data-visualize-iframe
        style={{ width: 1, minWidth: "100%" }}
        frameBorder="0"
        allowTransparency
        scrolling="no"
      />
      <div id="" />
      <script defer src="/dist/embed.js"></script>
    </body>
  </html>
);

export const renderEmbedMarkup = (props: Props): string => {
  return renderToStaticMarkup(<EmbedHTML {...props} />);
};
