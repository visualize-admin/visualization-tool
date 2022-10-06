import intConfigs from "../app/test/__fixtures/config/int/configs";

import { test, sleep } from "./common";

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
    test(`Chart Snapshots ${slug} ${env} ${viewportName}`, async ({ page }) => {
      test.setTimeout(1 * 60 * 1000);
      await page.setViewportSize(viewportSize);
      await page.goto(`/en/__test/${env}/${slug}?dataSource=Int`);
      await page
        .locator(`[data-chart-loaded="true"]`)
        .waitFor({ timeout: 90000 });
      await sleep(100);

      if (slug.includes("map")) {
        // @ts-ignore
        await sleep(1000);
      }
      await page.screenshot({
        path: `e2e-screenshots/chart-snapshot-${viewportName}-${slug}.png`,
        fullPage: true,
      });
    });
  }
}
