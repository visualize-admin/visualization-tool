import { locales } from "../app/locales/constants";

import { setup } from "./common";

const { test } = setup();

const fetchMetadata = ({
  limit,
  orderByViewCount,
}: {
  limit: 25;
  orderByViewCount?: boolean;
}) => {
  const qp = new URLSearchParams();
  if (limit !== undefined) {
    qp.append("limit", `${limit}`);
  }
  if (orderByViewCount !== undefined) {
    qp.append("orderByViewCount", orderByViewCount ? "true" : "false");
  }
  return fetch(`https://visualize.admin.ch/api/config/all-metadata?${qp}`).then(
    (res) => res.json()
  );
};

const TEST_TIMEOUT_MS = 5 * 60 * 1000;
const NAVIGATION_TIMEOUT_MS = 10_1000;

const formatError = (e: unknown) => {
  return e instanceof Error ? e.message : JSON.stringify(e);
};

// @noci as it's a special test that's supposed to preload varnish cache
// for most recent charts
test("@noci it should preload most recent charts", async ({
  page,
  browser,
}) => {
  test.setTimeout(TEST_TIMEOUT_MS);
  const fetchedConfigs = await fetchMetadata({ limit: 25 });
  const keys = fetchedConfigs.data.map((config) => config.key);

  for (const key of keys) {
    for (const locale of locales) {
      await page
        .goto(`https://visualize.admin.ch/${locale}/v/${key}`, {
          timeout: NAVIGATION_TIMEOUT_MS,
        })
        .catch((e) => {
          console.warn(`Error during goto for ${key}: ${formatError(e)}`);
        });
      // Wait for all the queries to finish
      await page.waitForLoadState("networkidle").catch(() => {
        console.warn("Timeout waitForLoadState for", key);
      });
    }
  }
});

// @noci as it's a special test that's supposed to preload varnish cache
// for most viewed charts
test("@noci it should preload most viewed charts", async ({ page }) => {
  test.setTimeout(TEST_TIMEOUT_MS);

  const fetchedConfigs = await fetchMetadata({
    limit: 25,
    orderByViewCount: true,
  });
  const keys = fetchedConfigs.data.map((config) => config.key);

  for (const key of keys) {
    for (const locale of locales) {
      await page
        .goto(`https://visualize.admin.ch/${locale}/v/${key}`, {
          timeout: NAVIGATION_TIMEOUT_MS,
        })
        .catch((e) => {
          console.warn(`Error during goto for ${key}: ${formatError(e)}`);
        });
      // Wait for all the queries to finish
      await page.waitForLoadState("networkidle").catch(() => {
        console.warn("Timeout for", key);
      });
    }
  }
});
