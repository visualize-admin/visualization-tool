import { I18nProvider } from "@lingui/react";
import { ThemeProvider } from "@mui/material";
import configureCors from "cors";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import { ConfiguratorState, decodeConfiguratorState } from "@/configurator";
import { GraphqlProvider } from "@/graphql/GraphqlProvider";
import { defaultLocale, i18n, Locale } from "@/locales/locales";
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
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks as unknown as Uint8Array[]).toString("utf-8");
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
  const [migrated, setMigrated] = useState<ConfiguratorState>();
  useEffect(() => {
    const run = async () => {
      const migratedConfiguratorState = decodeConfiguratorState(
        await migrateConfiguratorState(configuratorState)
      );
      setMigrated({
        ...migratedConfiguratorState,
        // Force state published for <ChartPublished /> to work correctly
        state: "PUBLISHED",
      } as ConfiguratorState);
    };

    run();
  }, [configuratorState]);

  return (
    <LocaleProvider value={locale}>
      <I18nProvider i18n={i18n}>
        <GraphqlProvider>
          <ThemeProvider theme={federalTheme.theme}>
            {migrated ? (
              <ConfiguratorStateProvider
                chartId="published"
                initialState={migrated}
              >
                <ChartPublished configKey="preview" {...migrated} />
              </ConfiguratorStateProvider>
            ) : null}
          </ThemeProvider>
        </GraphqlProvider>
      </I18nProvider>
    </LocaleProvider>
  );
}
