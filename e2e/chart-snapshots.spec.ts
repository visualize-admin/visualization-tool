import percySnapshot from "@percy/playwright";

import intConfigs from "../app/test/__fixtures/config/int/configs";

import { setup, sleep } from "./common";

const { test } = setup();

// Right now the CI app server runs connected to int.lindas.admin.ch
const configs = intConfigs.map((x) => ({ env: "int", ...x }));

const viewports = {
  "ipad-mini, portrait": {
    width: 768,
    height: 1024,
  },
  "iphone-8, portrait": {
    width: 375,
    height: 667,
  },
};

for (let [viewportName, viewportSize] of Object.entries(viewports)) {
  for (let { slug, env } of configs) {
    test(`Chart Snapshots ${slug} ${env} ${viewportName}`, async ({
      page,
      selectors,
    }) => {
      if (process.env.E2E_HAR !== "false") {
        await page.routeFromHAR(`./e2e/har/chart-snapshots/${slug}.zip`, {
          notFound: "fallback",
        });
      }
      await page.setViewportSize(viewportSize);
      await page.goto(`/en/__test/${env}/${slug}?dataSource=Int`);
      await selectors.chart.loaded();

      await sleep(2_000);
      await percySnapshot(page, `chart-snapshot-${viewportName}-${slug}`);
    });
  }
}
