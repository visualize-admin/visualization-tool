import { PROD_DATA_SOURCE_URL } from "../app/domain/datasource/constants";
import { locales } from "../app/locales";

import { setup } from "./common";

const { test } = setup();

// @noci as it's a special test that's supposed to preload varnish cache
// for most recent charts
test("it should preload most recent charts @noci", async ({
  page,
  selectors,
}) => {
  const fetchedConfigs = await fetch(
    "https://visualize.admin.ch/api/config/all-metadata?limit=25"
  ).then((res) => res.json());
  const keys = fetchedConfigs.map((config) => config.key);

  // Slice to 25 until we have a PROD deployment that actually makes use of
  // the limit query param
  for (const key of keys.slice(0, 25)) {
    for (const locale of locales) {
      await page.goto(`${PROD_DATA_SOURCE_URL}/${locale}/v/${key}`);
      await selectors.chart.loaded();
    }
  }
});
