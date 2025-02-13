import { argosScreenshot } from "@argos-ci/playwright";

import { loadChartInLocalStorage } from "./charts-utils";
import { setup, sleep } from "./common";
import offentlicheAusgabenChartConfigFixture from "./fixtures/offentliche-ausgaben-chart-config.json";

const { expect, test } = setup();

test("should be possible to edit filters of a hierarchy", async ({
  page,
  screen,
  selectors,
}) => {
  const key = "WtHYbmsehQKo";
  const config = offentlicheAusgabenChartConfigFixture;
  await loadChartInLocalStorage(page, key, config);
  await page.goto(`/en/create/${key}`);
  await selectors.chart.loaded();

  (
    await screen.findByText(
      "Edit filters",
      { selector: "button" },
      { timeout: 5_000 }
    )
  ).click();

  const filters = selectors.edition.filterDrawer().within();

  await (await filters.findByText("Economic affairs")).click();
  await (await filters.findByText("Social protection")).click();
  await (await filters.findByText("Health")).click();
  await (await filters.findByText("Apply filters")).click();

  await selectors.chart.loaded();
  const middlePanel = await selectors.panels.middle();
  await middlePanel.evaluate((panel) => {
    panel.scrollTo(0, 200);
  });

  await sleep(2_000);
  await argosScreenshot(page, `chart-edition-${key}`);
});

test("changing of locale shouldn't make the chart disappear", async ({
  page,
  actions,
  selectors,
}) => {
  await actions.chart.createFrom({
    iri: "https://agriculture.ld.admin.ch/foag/cube/MilkDairyProducts/Consumption_Price_Month",
    dataSource: "Prod",
  });
  await selectors.chart.loaded();
  await actions.editor.changeRegularChartType("Lines");
  const deLocaleButton = page.locator('a[rel="alternate"][hreflang="de"]');
  await deLocaleButton.click();
  await selectors.chart.loaded();
  // Make sure the chart had a chance to re-load.
  await sleep(6_000);
  const chart = page.locator("#chart-svg");
  const chartPath = chart.locator("path[data-testid='chart-line']").first();
  const d = await chartPath.getAttribute("d");
  expect(d).not.toContain("NaN");
});
