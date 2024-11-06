import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import configureCors from "cors";
import { GetServerSideProps } from "next";
import { useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { Locale, defaultLocale, i18n } from "@/locales/locales";
import { LocaleProvider } from "@/locales/use-locale";
import { ConfiguratorStateProvider } from "@/src";
import * as federalTheme from "@/themes/federal";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";
import { runMiddleware } from "@/utils/run-middleware";

type PageProps = {
  locale: Locale;
  configuratorState: any;
};

const cors = configureCors();

const streamToString = async (stream: any) => {
  if (stream) {
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk) as unknown as Uint8Array);
    }

    return Buffer.concat(chunks).toString("utf-8");
  }

  return null;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  locale,
}) => {
  let state: any | null = null;

  if (req.method === "POST") {
    runMiddleware(req as any, res as any, cors);
    const body = (await streamToString(req)) as string;
    const encodedState = body.split("=")[1];
    state = JSON.parse(decodeURIComponent(encodedState));
  }

  return {
    props: {
      locale: (locale ?? defaultLocale) as Locale,
      configuratorState: state,
    },
  };
};

export default function Preview({ configuratorState, locale }: PageProps) {
  i18n.activate(locale);
  const [migrated] = useState(() =>
    migrateConfiguratorState({ ...configuratorState, state: "PUBLISHED" })
  );
  return (
    <LocaleProvider value={locale}>
      <I18nProvider i18n={i18n}>
        <GraphqlProvider>
          <ThemeProvider theme={federalTheme.theme}>
            <ConfiguratorStateProvider
              chartId="published"
              initialState={migrated}
            >
              <ChartPublished configKey="preview" {...migrated} />
            </ConfiguratorStateProvider>
          </ThemeProvider>
        </GraphqlProvider>
      </I18nProvider>
    </LocaleProvider>
  );
}
