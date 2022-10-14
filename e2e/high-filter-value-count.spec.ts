import actions from "./actions";
import { test } from "./common";
import selectors from "./selectors";

test("should be able to load a map with a dimension with a large number of values", async ({
  page,
  screen,
}) => {
  test.setTimeout(90 * 1000);
  const ctx = { page, screen };
  await actions.chart.createFrom(
    ctx,
    "https://environment.ld.admin.ch/foen/fab_hierarchy_test13_switzerland_canton_municipality/3",
    "Int",
    { timeout: 60 * 1000 }
  );
  await actions.editor.changeChartType(ctx, "Map");
  await selectors.chart.loaded(ctx);
  await page.screenshot({
    path: `e2e-screenshots/chart-map-high-filter-value-count.png`,
    fullPage: true,
  });
});
