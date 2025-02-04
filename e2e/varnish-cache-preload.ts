import fetch from "node-fetch";
import pLimit from "p-limit";
import { chromium, Page } from "playwright";

import { locales } from "../app/locales/constants";

type Config = { key: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const preloadChart = async (page: Page, locale: string, key: string) => {
  const loadPage = async () => {
    console.log(`Loading ${key} in ${locale}`);
    await page.goto(`https://visualize.admin.ch/${locale}/v/${key}`);
    // Wait for all the queries to finish
    await page.waitForLoadState("networkidle");
  };
  await Promise.race([
    loadPage().catch(() => {
      console.error(`Failed to load ${key} in ${locale}`);
    }),
    sleep(10000),
  ]);
};

const openNewPage = async () => {
  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { page, browser, context };
};

type ConfigQueryOptions = {
  limit?: number;
  orderByViewCount?: boolean;
};

const fetchConfigs = ({ limit, orderByViewCount }: ConfigQueryOptions) => {
  let qp = "";
  if (limit !== undefined) {
    qp = `${qp}limit=${limit}&`;
  }
  if (orderByViewCount !== undefined) {
    qp = `${qp}orderByViewCount=true&`;
  }
  const url = `https://visualize.admin.ch/api/config/all-metadata?${qp}`;
  return fetch(url).then((res) => res.json() as Promise<{ data: Config[] }>);
};

const preloadChartsPool = async (
  configs: Config[],
  concurrency: number = 4
) => {
  const openers = Array.from({ length: concurrency }, (_, i) => openNewPage());
  const contexts = await Promise.all(openers);
  const ready = contexts.map((c) => c.page);

  const withLocales = configs.flatMap((config) =>
    locales.map((locale) => ({ locale, key: config.key }))
  );
  let i = 0;

  const limit = pLimit(concurrency);

  const fetchPage = async ({ locale, key }: Config & { locale: string }) => {
    i++;
    const page = ready.pop();

    if (!page) {
      throw Error("No pages available");
    }

    await preloadChart(page, locale, key);
    ready.push(page);

    if (i % 10 !== 0) {
      return;
    }

    console.log(`Progress: ${i}/${withLocales.length}`);
  };

  const promises = withLocales.map((datum) => limit(() => fetchPage(datum)));
  await Promise.all(promises);

  await Promise.all(
    contexts.map(async ({ browser, page, context }) => {
      await page.close();
      await context.close();
      return browser.close();
    })
  );
};

const preloadChartsWithOptions = async (
  configQuery: ConfigQueryOptions,
  concurrency: number
) => {
  const fetchedConfigs = await fetchConfigs(configQuery);
  await preloadChartsPool(fetchedConfigs.data, concurrency);
};

const LIMIT = 250;

const main = async () => {
  const concurrency = process.env.CI ? 2 : 4;
  // Latest charts
  await preloadChartsWithOptions({ limit: LIMIT }, concurrency);
  // Most viewed charts
  await preloadChartsWithOptions(
    { limit: LIMIT, orderByViewCount: true },
    concurrency
  );
  process.exit(0);
};

main();
