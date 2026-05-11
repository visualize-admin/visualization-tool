import { setup, sleep } from "./common";

const { test } = setup();

/**
 * @todo Works locally but not on CI
 * @todo Changed to an existing dataset - but it's not clear if it has enough values
 */
const testFn = process.env.CI ? test.skip : test;

testFn(
  "should be able to load a map with a dimension with a large number of values",
  async ({ page, selectors, actions }) => {
    test.setTimeout(300_000);
    await actions.chart.createFrom({
      iri: "https://environment.ld.admin.ch/foen/ubd01041prod/11",
      dataSource: "Prod",
    });
    await selectors.edition.drawerLoaded();
    await actions.editor.changeRegularChartType("Map");
    await selectors.chart.loaded();

    await sleep(2_000);
  }
);
