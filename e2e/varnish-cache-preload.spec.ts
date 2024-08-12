import { locales } from "../app/locales/constants";

import { setup } from "./common";

const { test } = setup();

const atMost = async ({
  timeout,
  fn,
  onTimeout,
}: {
  timeout: number;
  fn: () => Promise<void>;
  onTimeout: () => void;
}) => {
  let success = false;
  await Promise.race([
    fn().then((result) => {
      success = true;
      return result;
    }),
    new Promise((resolve, reject) =>
      setTimeout(() => {
        if (!success) {
          onTimeout();
        }
        return resolve(void 0);
      }, timeout)
    ),
  ]);
  throw new Error("Timeout");
};

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

// @noci as it's a special test that's supposed to preload varnish cache
// for most recent charts
test("@noci it should preload most recent charts", async ({ page }) => {
  const fetchedConfigs = await fetchMetadata({ limit: 25 });
  const keys = fetchedConfigs.data.map((config) => config.key);

  for (const key of keys) {
    for (const locale of locales) {
      await atMost({
        timeout: 40_1000,
        fn: async () => {
          await page.goto(`https://visualize.admin.ch/${locale}/v/${key}`);
          // Wait for all the queries to finish
          await page.waitForLoadState("networkidle");
        },
        onTimeout: () => {
          console.error(`Timeout for ${key}`);
        },
      });
    }
  }
});

// @noci as it's a special test that's supposed to preload varnish cache
// for most viewed charts
test("@noci it should preload most viewed charts", async ({ page }) => {
  const fetchedConfigs = await fetchMetadata({
    limit: 25,
    orderByViewCount: true,
  });
  const keys = fetchedConfigs.data.map((config) => config.key);

  for (const key of keys) {
    for (const locale of locales) {
      await atMost({
        timeout: 40_1000,
        fn: async () => {
          await page.goto(`https://visualize.admin.ch/${locale}/v/${key}`);
          // Wait for all the queries to finish
          await page.waitForLoadState("networkidle");
        },
        onTimeout: () => {
          console.error(`Timeout for ${key}`);
        },
      });
    }
  }
});
