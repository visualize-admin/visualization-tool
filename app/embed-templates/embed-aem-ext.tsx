import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PUBLIC_URL } from "@/domain/env";
import { EmbedOptions } from "@/utils/embed";

type Props = {
  locale: string;
  chartId: string;
  embedOptions: EmbedOptions;
};

const EmbedHTML = ({ locale, chartId, embedOptions }: Props) => (
  <html lang={locale}>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
    </head>
    <body style={{ padding: 0, margin: 0, background: "#fff" }}>
      <iframe
        title="chart"
        // src="/static/embed-content-placeholder.html"
        src={`${PUBLIC_URL}/${locale}/embed/${chartId}?${
          embedOptions
            ? `embedOptions=${encodeURIComponent(JSON.stringify(embedOptions))}`
            : ""
        }`}
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
