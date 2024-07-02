import { locales } from "../app/locales";

import { setup } from "./common";

const { test } = setup();

// @noci as it's a special test that's supposed to preload varnish cache
// for most recent charts
test("it should preload most recent charts @noci", async ({ page }) => {
  const fetchedConfigs = await fetch(
    "https://visualize.admin.ch/api/config/all-metadata?limit=25"
  ).then((res) => res.json());
  const keys = fetchedConfigs.data.map((config) => config.key);

  for (const key of keys) {
    for (const locale of locales) {
      await page.goto(`https://visualize.admin.ch/${locale}/v/${key}`);
      // Wait for all the queries to finish
      await page.waitForLoadState("networkidle");
    }
  }
});

// @noci as it's a special test that's supposed to preload varnish cache
// for most viewed charts
test("it should preload most viewed charts @noci", async ({ page }) => {
  const fetchedConfigs = await fetch(
    "https://visualize.admin.ch/api/config/all-metadata?limit=25&orderByViewCount=true"
  ).then((res) => res.json());
  const keys = fetchedConfigs.data.map((config) => config.key);

  for (const key of keys) {
    for (const locale of locales) {
      await page.goto(`https://visualize.admin.ch/${locale}/v/${key}`);
      // Wait for all the queries to finish
      await page.waitForLoadState("networkidle");
    }
  }
});
