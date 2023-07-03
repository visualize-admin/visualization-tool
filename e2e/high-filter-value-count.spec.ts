import percySnapshot from "@percy/playwright";

import { setup, sleep } from "./common";

const { test } = setup();

/**
 * @todo Works locally but not on CI
 */
const testFn = process.env.CI ? test.skip : test;

testFn(
  "should be able to load a map with a dimension with a large number of values",
  async ({ page, selectors, actions }) => {
    test.setTimeout(300_000);
    await actions.chart.createFrom(
      "https://environment.ld.admin.ch/foen/fab_hierarchy_test13_switzerland_canton_municipality/3",
      "Int",
      { timeout: 60 * 1000 }
    );
    await selectors.edition.drawerLoaded();
    await actions.editor.changeChartType("Map");
    await selectors.chart.loaded({ timeout: 240_000 });

    await sleep(2_000);
    await percySnapshot(page, "chart-map-high-filter-value-count");
  }
);
