import { test } from "./common";

test("should be able to load a map with a dimension with a large number of values", async ({
  page,
  selectors,
  actions,
}) => {
  test.setTimeout(90 * 1000);
  await actions.chart.createFrom(
    "https://environment.ld.admin.ch/foen/fab_hierarchy_test13_switzerland_canton_municipality/3",
    "Int",
    { timeout: 60 * 1000 }
  );

  await page.locator("text=Chart Type").waitFor({ timeout: 30_000 });
  await actions.editor.changeChartType("Map");
  await selectors.chart.loaded();
  await page.screenshot({
    path: `e2e-screenshots/chart-map-high-filter-value-count.png`,
    fullPage: true,
  });
});
