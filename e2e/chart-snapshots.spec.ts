import { argosScreenshot } from "@argos-ci/playwright";

import { configs as intConfigs } from "../app/test/__fixtures/config/int/configs";

import { setup, sleep } from "./common";
import { harReplayGraphqlEndpointQueryParam } from "./har-utils";

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
      replayFromHAR,
    }) => {
      await replayFromHAR();
      await page.setViewportSize(viewportSize);
      await page.goto(
        `/en/__test/${env}/${slug}?dataSource=Int&${harReplayGraphqlEndpointQueryParam}`
      );
      await selectors.chart.loaded();

      await sleep(2_000);
      await argosScreenshot(page, `chart-snapshot-${viewportName}-${slug}`);
    });
  }
}
