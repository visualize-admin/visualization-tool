import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import configureCors from "cors";
import { GetServerSideProps } from "next";

import { ChartPublished } from "@/components/chart-published";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { Locale, i18n } from "@/locales/locales";
import { LocaleProvider } from "@/locales/use-locale";
import * as federalTheme from "@/themes/federal";
import { runMiddleware } from "@/utils/run-middleware";

const cors = configureCors();

const streamToString = async (stream: any) => {
  if (stream) {
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
  }

  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let state: any | null = null;

  if (req.method === "POST") {
    runMiddleware(req as any, res as any, cors);
    const body = (await streamToString(req)) as string;
    const encodedState = body.split("=")[1];
    state = JSON.parse(decodeURIComponent(encodedState));
  }

  return {
    props: {
      ...state,
    },
  };
};

export default function Preview(props: any) {
  const locale: Locale = "en";
  i18n.activate(locale);

  return (
    <LocaleProvider value={locale}>
      <I18nProvider i18n={i18n}>
        <GraphqlProvider>
          <ThemeProvider theme={federalTheme.theme}>
            <ChartPublished configKey="preview" {...props} />
          </ThemeProvider>
        </GraphqlProvider>
      </I18nProvider>
    </LocaleProvider>
  );
}
